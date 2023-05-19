import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";

export default function ImageUploader({ name,onchange }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    setFileName(event.target.files[0].name);
  };

  return (
    <Box>
      <FormControl>
        <InputGroup>
          <Input
            type="file"
            placeholder={name}
            id="image-upload"
            accept="image/*"
            onChange={(event)=>{
              onchange(event)
              handleFileChange(event)
              }}
            style={{ display: "none" }}
            color="black"
          />
          <Input
            placeholder={`select a ${name}`}
            value={fileName}
            color="black"
            readOnly
          />
          <InputRightAddon bgColor="black">
            <label
              htmlFor="image-upload"
              style={{
                cursor: "pointer",
                backgroundColor: "black",
                color: "white",
              }}
            >
              Browse
            </label>
          </InputRightAddon>
        </InputGroup>
      </FormControl>
    </Box>
  );
}
