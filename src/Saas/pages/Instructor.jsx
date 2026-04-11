import React from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "../../component/ErrorGlobal";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./Message";

function Instructor() {
  const [error, setError] = useState({});

  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    status: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    try {
      const response = await Instance.post("/api/instructor/store", formData);
      console.log(response);
      if (response.data.success) {
        setSuccess(response.data.message);
        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          club_id: "",

          start_date: "",
          end_date: "",
          status: "",
        });
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          ajouter un instructeur
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            name="fullname"
            label="Nom complet"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
          {error.fullname && (
            <FormHelperText error>{error.fullname.join(", ")}</FormHelperText>
          )}
          <TextField
            name="phone"
            label="Numéro de téléphone"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {error.phone && (
            <FormHelperText error>{error.phone.join(", ")}</FormHelperText>
          )}
          <TextField
            name="grade"
            label="Grade"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.grade}
            onChange={handleChange}
            required
          />
          {error.grade && (
            <FormHelperText error>{error.grade.join(", ")}</FormHelperText>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            ajouter un instructeur
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Instructor;
