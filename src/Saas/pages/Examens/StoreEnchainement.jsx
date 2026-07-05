import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { act, useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import EnchainementList from "./Enchainement";
import { UseAuth } from "../../../Api/AuthContext";
import { useParams } from "react-router-dom";

function StoreEnchainement() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  //modal
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  //ench
  const [loading, setLoading] = useState(true);
  const [enchainements, setEnchainement] = useState([]);
  //obtenir les tournois
  const { examenId } = useParams();
  const { activeId, activeType } = UseAuth();
  const getEnch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance(`/api/enchainements/${examenId}`);
      setEnchainement(response.data.enchainements || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [examenId]);

  useEffect(() => {
    getEnch();
  }, [getEnch]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    diviseur: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const response = await Instance.post(
        `/api/enchainements/${examenId}`,
        formData,
      );
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          name: "",
          description: "",
          diviseur: "",
        });
        getEnch();
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
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontSize: { xs: 10, md: 14 } }}
          >
            veuillez clicquer sur le bouton pour ajouter une matiere
          </Typography>
          <Button
            variant="contained"
            sx={{ textTransform: "none", fontSize: { xs: 10, md: 14 } }}
            onClick={handleOpenModal}
          >
            creer matiere
          </Button>
        </Box>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}

        <Dialog open={openModal} maxWidth="sm" fullWidth>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: "background.default",
            }}
          >
            <Box>
              {success && <Message text={success} type="success" />}
              {error.general && <Message text={error.general} type="error" />}
            </Box>

            <form onSubmit={handleSubmit}>
              <DialogTitle>ajouter matiere</DialogTitle>
              <DialogContent
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                <TextField
                  error={!!hasError("name")}
                  helperText={getError("name")}
                  id="name"
                  name="name"
                  label="Nom"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <TextField
                  error={!!hasError("diviseur")}
                  helperText={getError("diviseur")}
                  id="diviseur"
                  type="number"
                  name="diviseur"
                  label="Diviseur"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={formData.diviseur}
                  onChange={handleChange}
                  required
                />

                <TextField
                  error={!!hasError("description")}
                  helperText={getError("description")}
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  margin="normal"
                  value={formData.description}
                  onChange={handleChange}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal} color="inherit">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogActions>
            </form>
          </Paper>
        </Dialog>

        <EnchainementList
          examenId={examenId}
          enchainements={enchainements}
          getEnch={getEnch}
          loading={loading}
        />
      </Box>
    </Container>
  );
}

export default StoreEnchainement;
