import React, { useEffect } from "react";
import Auth from "./Components/Auth";
import Header from "./Components/Header";
import { ChakraProvider } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./Slice/userSlice";

const App = () => {
  const user = useSelector((state) => state.user);
  return <ChakraProvider>{user.value!==null ? <Header /> : <Auth />}</ChakraProvider>;
};

export default App;
