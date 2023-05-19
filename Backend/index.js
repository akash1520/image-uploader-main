const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./model/auth");
const Image = require("./model/image");
const multer = require("multer");
const verifiytoken = require("./middleware/verifyToken");
const bcrypt = require("bcrypt");
const verifytoken = require("./middleware/verifyToken");
const cors = require("cors");
require("dotenv").config();

//Routes
const app = express();
app.use(bodyParser.json());
// app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  cors({
    origin: "*",
  })
);

const upload = multer({
  storage: multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

//Register Route
app.post("/register", upload.single("profileImage"), async (req, res) => {
  // Validate the request body
  try{
    const { username, password, profileImage } = req.body;
    if (!username || !password ) {
      res.status(400).send("Invalid request body");
      return;
    }
  
    // Check if the username already exists
    const user = await User.findOne({ username });
    if (user) {
      res.status(400).send("Username already exists");
      return;
    }
  
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
  
    // Create a new user
    const newUser = new User({ username, password: passwordHash });
    newUser.profileImage = profileImage;
    await newUser.save();
  
    // Return the user object
    res.status(201).json(newUser);
  }catch(err){
    alert(err);
  }
  
});

// Login route
app.post("/login", async (req, res) => {
  // Validate the request body
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Invalid request body");
    return;
  }

  // Find the user by username
  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).send("Invalid username or password");
    return;
  }

  // Compare the password
  try{const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });
  // Generate a JWT token
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
  // Return the token
  res.status(200).json({ token, user });}
  catch(error){
    res.json(error)
  }
});

app.get("/",(req,res)=>{
  res.send("Working")
})

//Image routes

app.use("/profile", express.static('upload/images'));

app.post("/images", verifytoken, upload.single("image"), async (req, res) => {
  // if (!req.user || !req.user.userId) {
  //   return res.status(401).json({ message: "User not authenticated" });
  // }

  const { originalname, path,  filename } = req.file;

  const profile_url = `http://localhost:6001/profile/${filename}`;

try {
    // Create a new image instance
    const newImage = new Image({
      name: originalname,
      image: profile_url, // Store the file path in the database
      user: req.user.userId,
    });

    // Save the image to MongoDB
    const savedImage = await newImage.save();

    res.status(201).json(savedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save the image' });
  }

  // const { name } = req.body;
  // if (!name) {
  //   res.status(400).send("Invalid request body");
  //   return;
  // }

  // // Upload the image

  // // Create a new image object
  // const newImage = new Image({
  //   name,
  //   image,
  //   user: req.user.userId,
  // });

  // // Save the image
  // await newImage.save();

  // // Return the image object
  // res.status(201).json(newImage);
});

// Get image route
app.get("/images/:userId", verifiytoken, async (req, res) => {
  try {
    // Find the images by user ID
    const images = await Image.find({ user: req.params.userId });


    // If no images are found for this user
    if (images.length === 0) {
      return res.status(404).send("No images found for this user");
    }

    // Create an array to hold the processed images
    const processedImages = [];

    // Loop through the images
    for (let image of images) {
      // console.log(image)
      // Process the image file path and create an object with the processed data
      const processedImage = {
        name: image.name,
        filePath: image.image,
        // You can add any additional properties you need
      };

      // Add the processed image object to the array
      processedImages.push(processedImage);
    }

    // Return the processed images
    res.json(processedImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve images' });
  }
});

app.get("/images/:userId/:imageName",verifytoken, async(req, res) => {

    const {userId,imageName}=req.params

  try {
    // Find the images by user ID
    const images = await Image.find({ user: req.params.userId });
    const image = images.filter((img)=>img.name===imageName)
    res.json(image)
  }catch(error){
    res.json(error)
  }

  // const query = req.query.name;

  // Image.find({ name: { $regex: query, $options: "i" } }, (err, images) => {
  //   if (err) {
  //     res.send(err);
  //   } else {
  //     res.json(images);
  //   }
  // });
});

const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.DB)
  .then(() => {
    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
  })
  .catch((error) => {
    console.log(`${error} did not connect`);
  });
