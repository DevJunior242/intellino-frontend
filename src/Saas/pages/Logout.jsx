import { Box, Button, Container, Typography } from "@mui/material";
import React, { useState } from "react";
import { motion } from "motion/react";

import { UseAuth } from "../../Api/AuthContext";
import Message from "./Message";

function Logout() {
  const { logout } = UseAuth();
  const [error, setError] = useState({});
  const handleLogout = async (e) => {
    e.preventDefault();
    setError({});
    try {
      await logout();
      console.log("logout");
    } catch (error) {
      console.log(error.response?.data || error.message);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          setError(data.errors);
          console.warn(data.errors);
        } else {
          setError({ general: data.message || "Authentication failed" });
          console.warn(data);
        }
      } else {
        setError({ general: error.message });
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          Deconnexion <br />
        </Typography>
         {error.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleLogout}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, backgroundColor: "red" }}
          >
            logout
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Logout;
