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
import Message from "./Message";
import { UseAuth } from "../../Api/AuthContext";

function StoreGrade() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  //activeClubId
  const { activeClubId } = UseAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
   });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    try {
      const dataSend = {
        ...formData,
        club_id: activeClubId,
      };
      const response = await Instance.post("/api/grade/store", dataSend);
      console.log(response);

      if (response.data.success) {
        setFormData({
          name: "",
          description: "",
        });
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };
  return (
    <Container maxWidth="xs">
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
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
        >
          les noms de grades
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.name}
            id="name"
            name="name"
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {error.name && (
            <FormHelperText error>{error.name.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.description}
            id="description"
            name="description"
            label="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={handleChange}
          />
          {error.description && (
            <FormHelperText error>
              {error.description.join(", ")}
            </FormHelperText>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
          >
            ajouter
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StoreGrade;
