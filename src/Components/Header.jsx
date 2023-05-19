import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Flex,
  Input,
  Text,
  Button,
  VStack,
  Image,
  FormControl,
  FormLabel,
  Avatar
} from "@chakra-ui/react";
import ImageUploader from "../Hooks/ImageUploadHook";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../Slice/userSlice";
import { selectUser } from "../Slice/userSlice";

const Header = () => {
  const user = useSelector((state) => state.user);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [count, setCount] = useState(0)
  const token = localStorage.getItem("token");
  const userId = user.value._id;
  const dispatch = useDispatch();
  console.log(user.value);

  const uploadImage = async () => {
    console.log(selectUser);
    console.log(user);
    console.log(token);
    // create form data
    const formData = new FormData();
    // formData.append("name", name);
    // console.log(imageFile);
    formData.append("image", imageFile);


    // create headers
    let config = {
      headers: {
        Authorization: `Bearer ${token}`, // assuming you're using Bearer token
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:6001/images",
        formData,
        config
      );
      alert(response.status, "Image uploaded succesfully");
      setCount((prev) => prev + 1)
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const searchImage = async () => {
    let config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `http://localhost:6001/images/${userId}/${name}`,
        config
      );
      alert(response.status, "Found the image!!");
      setImages(response.data)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    // Create headers
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`http://localhost:6001/images/${userId}`, config)
      .then((response) => {
        const imagesData = response.data;
        setImages(imagesData);
        console.log({ "imagesData": imagesData });
        // Process the imagesData as needed
      })
      .catch((error) => {
        console.error(error);
      });
  }, [user, count]);

  return (
    <div>
      <Box>
        {/* <ImageUploader
          value={imageFile}
          onchange={(event) => {
            console.log(event)
            setImageFile(event.target.files[0]);
          }}
        />
        <Input
          placeholder="Image name"
          color="black"
          margin="5px"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={() => uploadImage()}>Post the Image</Button>
        <Button onClick={() => searchImage()}>Search</Button> */}

        <Box display="flex" alignItems="flex-start" justifyContent="space-between" margin="25px">
          <Box width="800px" p={4} boxShadow="md" borderRadius="md">
            <VStack spacing={4} align="stretch">
              <Box>
                <ImageUploader
                  value={imageFile}
                  onchange={(event) => {
                    setImageFile(event.target.files[0]);
                  }}
                />
              </Box>
              <Button colorScheme="teal" onClick={uploadImage}>
                Upload Image
              </Button>
              <FormControl>
                <FormLabel htmlFor="image-name">Image Name</FormLabel>
                <Input
                  id="image-name"
                  placeholder="Enter image name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <Button colorScheme="blue" onClick={searchImage}>
                Search
              </Button>
            </VStack>
          </Box>

          <Box width="300px" p={4} boxShadow="md" borderRadius="md" textAlign="center">
            <Avatar size="xl" src={user.value.profileImage} name={user.name} mb={4} borderRadius="50%" />
            <Box>
              <p>{user.value.username}</p>
              <Button colorScheme="red" size="sm" onClick={() => {
                  window.location.reload();
          alert("logged out succesfully");
              }}>
                Logout
              </Button>
            </Box>
          </Box>
        </Box>


        <Text padding="25px" align="center" fontSize="xl">Uploaded Images</Text>
        {/* <Button onClick={() => {
          window.location.reload();
          alert("logged out succesfully");
        }}>logout</Button> */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gridGap="40px">
          {images.map((image) => (
            <Box key={image._id}>
              <div style={{ position: 'relative', paddingBottom: '100%' }}>
                <Image
                  src={image.filePath || image.image}
                  alt={image.name}
                  objectFit="cover"
                  position="absolute"
                  top="0"
                  left="0"
                  width="500px"
                  height="100%"
                  
                  onClick={(e) => { console.log(e.target) }}
                />
              </div>
              <Text>{image.name}</Text>
            </Box>
          ))}
        </Box>

      </Box>
    </div>
  );
};

export default Header;
