import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

function StoreExamenLeague() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [formData, setFormData] = useState({
    title: "",
    grade: "",
    description: "",
    start_date: null,
    end_date: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      const response = await Instance.post(
        "/api/examen-leagues/examen-leagues",
        formData,
      );
      console.log(response);
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          title: "",
          grade: "",
          description: "",
          start_date: null,
          end_date: null,
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
    <Container maxWidth="md" sx={{ mt: 10 }}>
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
        <Typography>creation d'un examen league</Typography>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            error={hasError("title")}
            helperText={getError("title")}
            type="text"
            name="title"
            placeholder="Titre"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <TextField
            error={hasError("grade")}
            helperText={getError("grade")}
            type="text"
            name="grade"
            placeholder="Grade"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.grade}
            onChange={handleChange}
            required
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              error={hasError("start_date")}
              helperText={getError("start_date")}
              type="date"
              name="start_date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.start_date}
              onChange={handleChange}
              required
            />

            <TextField
              error={hasError("end_date")}
              helperText={getError("end_date")}
              type="date"
              name="end_date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </Box>
          <TextField
            error={hasError("description")}
            helperText={getError("description")}
            type="text"
            name="description"
            placeholder="Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            maxRows={4}
          />
          {/* <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              error={hasError("start_time")}
              helperText={getError("start_time")}
              fullWidth
              type="time"
              name="start_time"
              label="heure de début"
              InputLabelProps={{ shrink: true }}
              value={formData.start_time}
              onChange={handleChange}
              margin="dense"
            />
            <TextField
              error={hasError("end_time")}
              helperText={getError("end_time")}
              fullWidth
              type="time"
              name="end_time"
              label="Fin"
              InputLabelProps={{ shrink: true }}
              value={formData.end_time}
              onChange={handleChange}
              margin="dense"
            />
          </Box> */}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            ajouter
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StoreExamenLeague;
