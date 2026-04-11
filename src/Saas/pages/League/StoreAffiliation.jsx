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

function StoreAffiliation() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [formData, setFormData] = useState({
    club_id: "",
    saison: "",
    cotisation: "",
    date_affiliation: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const searchParams = new URLSearchParams(window.location.search);
  const clubId = searchParams.get("club");
  console.log("CLUB ID", clubId);

  useEffect(() => {
    if (clubId) {
      setFormData((prev) => ({ ...prev, club_id: clubId }));
    }
  }, [clubId]);
  const handleSubmit = async (e) => {
    if (!clubId) return;
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      console.log("FORM DATA", formData);
      const response = await Instance.post(
        "/api/affiliations/affiliations?club_id=" + clubId,
        formData,
      );
      console.log("RESPONSE", response);
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          saison: "",
          cotisation: "",
          date_affiliation: null,
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
        <Typography>affiliation d'un club</Typography>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="club_id" value={formData.clubId} />
          <TextField
            error={hasError("saison")}
            helperText={getError("saison")}
            type="text"
            name="saison"
            placeholder="ex: 2024-2025"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.saison}
            onChange={handleChange}
            required
          />
          <TextField
            error={hasError("cotisation")}
            helperText={getError("cotisation")}
            type="number"
            name="cotisation"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.cotisation}
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
              error={hasError("date_affiliation")}
              helperText={getError("date_affiliation")}
              type="date"
              name="date_affiliation"
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData.date_affiliation}
              onChange={handleChange}
              required
            />
          </Box>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            ajouter
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StoreAffiliation;
