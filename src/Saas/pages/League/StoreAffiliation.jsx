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
import { UseAuth } from "../../../Api/AuthContext";
import { useNavigate } from "react-router-dom";

function StoreAffiliation() {
  const { activeId } = UseAuth();
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    club_id: "",
    cotisation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const searchParams = new URLSearchParams(window.location.search);
  const clubId = searchParams.get("club");

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
    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
      };
      if (clubId) {
        dataSend.club_id = clubId;
      }
      const response = await Instance.post(
        `/api/affiliations/affiliations`,
        dataSend,
      );
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          saison: "",
          cotisation: "",
          date_debut: null,
        });
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
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
        <Button
          variant="outlined"
          sx={{
            mb: 4,
            px: 4,
            py: 1.5,
            color: "#fff",
            borderColor: "rgba(255,255,255,0.3)",
            textTransform: "none",
            borderRadius: 2,
            fontSize: "1rem",
            "&:hover": {
              borderColor: "#fff",
              bgcolor: "rgba(255,255,255,0.05)",
            },
          }}
          onClick={() => navigate("/dashboard/league/clubs")}
        >
          Retour à la liste des clubs
        </Button>
        <Typography>affiliation d'un club</Typography>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="club_id" value={formData.clubId} />

          <TextField
            label="Cotisation:prix de l'affiliation"
            error={hasError("cotisation")}
            helperText={getError("cotisation")}
            type="number"
            name="cotisation"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.cotisation}
            onChange={handleChange}
          />
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          ></Box>

          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            {submitting ? <PulseLoader size={20} color="#fff" /> : "Ajouter"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StoreAffiliation;
