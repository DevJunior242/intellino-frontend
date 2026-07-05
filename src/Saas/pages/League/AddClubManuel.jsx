import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import ConfigSkeleton from "../ConfigSkeleton";

function AddclubManuel({ open, handleClose }) {
  const { activeId, activeType } = UseAuth();
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [disciplines, setDisciplines] = useState([]);
  const [selectDiscipline, setSelectDiscipline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discipline_id: "",
    city: "",
    address: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const disciplinesResponse = await Instance.get("/api/disciplines");

      setDisciplines(disciplinesResponse.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  useEffect(() => {
    if (selectDiscipline) {
      setFormData((prev) => ({ ...prev, discipline_id: selectDiscipline.id }));
    }
  }, [selectDiscipline]);

  // Soumission finale à la base de données
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);

    const formDataInitial = new FormData();
    formDataInitial.append("name", formData.name);
    formDataInitial.append("city", formData.city);
    formDataInitial.append("address", formData.address);
    formDataInitial.append("discipline_id", formData.discipline_id);

    try {
      const dataSend = {
        ...formData,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };
      console.log("DATA SEND", dataSend);
      const response = await Instance.post(
        "/api/leagues/addClubManuel",
        dataSend,
      );
      console.log(response);
      if (response?.data?.success) {
        setSelectDiscipline(null);
        setFormData({
          name: "",
          discipline_id: "",
          city: "",
          address: "",
        });
        setSuccess("Votre club a été créé avec succès..");
        setError({});
      } else {
        setError({ general: response.data.message });
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <ConfigSkeleton />;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un club manuel</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        {error && (
          <Message
            text={error.general}
            type="error"
            className="mb-4 text-center"
          />
        )}
        {success && (
          <Message text={success} type="success" className="mb-4 text-center" />
        )}

        <form onSubmit={handleSubmit}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            🏫 Informations du club
          </Typography>
          <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
            <TextField
              error={hasError("name")}
              helperText={getError("name")}
              name="name"
              label="Nom du club"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />

            <FormControl fullWidth error={hasError("discipline_id")} required>
              <InputLabel>Discipline</InputLabel>
              <Select
                label="Discipline"
                value={formData.discipline_id}
                onChange={(e) =>
                  setFormData({ ...formData, discipline_id: e.target.value })
                }
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: "background.default" },
                  },
                }}
              >
                {disciplines.length > 0 ? (
                  disciplines.map((disp) => (
                    <MenuItem key={disp.id} value={disp.id}>
                      {disp.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Aucune discipline</MenuItem>
                )}
              </Select>
              {hasError("discipline_id") && (
                <FormHelperText>{getError("discipline_id")}</FormHelperText>
              )}
            </FormControl>
          </Box>

          <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2, mt: 2 }}>
            <TextField
              error={hasError("city")}
              helperText={getError("city")}
              name="city"
              label="La ville"
              fullWidth
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Box>

          <TextField
            error={hasError("address")}
            helperText={getError("address")}
            name="address"
            label="Adresse"
            fullWidth
            margin="normal"
            value={formData.address}
            onChange={handleChange}
          />

          {/* ── SECTION 3 ── */}
          {/* <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
            🖼️ Branding
          </Typography>
          <TextField
            error={hasError("logo")}
            helperText={getError("logo")}
            name="logo"
            type="file"
            fullWidth
            onChange={handleChange}
          /> */}

          <Button
            disabled={submitting}
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
          >
            {submitting ? <CircularProgress size={20} /> : " Ajouter le club"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddclubManuel;
