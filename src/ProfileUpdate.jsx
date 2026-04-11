import { Box, Button, Container, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UseAuth } from "./Api/AuthContext";
import { Instance } from "./Api/Axios";

function ProfileUpdate() {
  const navigate = useNavigate();
  const { user, setUser,logout } = UseAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password,
        password_confirmation: user.password,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    try {
      const res = await Instance.put("api/update-user", formData);

      console.log("before:", user);

      console.log("res:", res.data);
      const updateUser = res.data;
      setSuccess("user updated successfully");
      setUser(updateUser.user);
      localStorage.setItem("user", JSON.stringify(updateUser));
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          setError(data.errors);
          console.warn(data.errors);
        } else {
          setError({ general: data.message || "you can't update user" });
          console.warn(data);
        }
      }
    }
  };
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  if (!user) return <div>Loading...</div>;

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          mettre à jour
        </Typography>

        {success && (
          <Typography sx={{ mt: 2 }} color={"green"}>
            {success}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            id="name"
            name="name"
            value={formData.name}
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          {error.name && (
            <Typography textAlign={"center"} color={"red"}>
              {error.name[0]}
            </Typography>
          )}
          <TextField
            id="email"
            name="email"
            value={formData.email}
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          {error.email && (
            <Typography textAlign={"center"} color={"red"}>
              {error.email[0]}
            </Typography>
          )}
          <TextField
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          {error.password && (
            <Typography textAlign={"center"} color={"red"}>
              {error.password[0]}
            </Typography>
          )}
          <TextField
            id="password_confirmation"
            name="password_confirmation"
            label="Password confirmation"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          {error.password_confirmation && (
            <Typography textAlign={"center"} color={"red"}>
              {error.password_confirmation[0]}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            mettre à jour
          </Button>
          <Button
            onClick={handleLogout}
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

export default ProfileUpdate;
