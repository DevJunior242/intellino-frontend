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

function Plan() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    try {
      const response = await Instance.post("/api/plan/store", formData);
      console.log(response);

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        setFormData({
          name: "",
          description: "",
          amount: "",
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
        <Typography variant="h4" component={"h1"} textAlign={"center"}>
          Plan
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
            multiline
            rows={4}
            rowsMax={4}
            value={formData.description}
            onChange={handleChange}
          />
          {error.description && (
            <FormHelperText error>
              {error.description.join(", ")}
            </FormHelperText>
          )}
          <TextField
            error={!!error.amount}
            type="number"
            id="amount"
            name="amount"
            label="Amount"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          {error.amount && (
            <FormHelperText error>{error.amount.join(", ")}</FormHelperText>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}>
            ajouter un plan
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default Plan;
