import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import { ErrorOutlined } from "@mui/icons-material";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import ConfigSkeleton from "./ConfigSkeleton";
import ErrorBlock from "./ErrorBlock";

const EquipmentManager = ({ onRefresh, isSubmitting, setIsSubmitting }) => {
  const [categories, setCategories] = useState([]);
  const [openCat, setOpenCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const [errorCategory, setErrorCategory] = useState("");

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    name: "",
    equipment_category_id: "",
    total_quantity: 0,
    min_stock_alert: 2,
  });

  const { activeClubId } = UseAuth();

  const fetchData = async () => {
    setLoading(true);
    setErrorCategory("");
    try {
      const res = await Instance.get(
        `/api/inventory/categories?club_id=${activeClubId}`,
      );
      console.log(res);
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
      setErrorCategory("Erreur lors de la récupération des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClubId == null) return;
    fetchData();
  }, [activeClubId]);

  // Création rapide de catégorie
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError({});
    if (!newCatName) return;
    setSubmitting(true);
    try {
      const res = await Instance.post("/api/inventory/categories", {
        name: newCatName,
        club_id: activeClubId,
      });
      if (res.data.success) {
        setSuccess("Catégorie créée avec succès !");
        setCategories([...categories, res.data]);
        setFormData({ ...formData, equipment_category_id: res.data.id });
        setOpenCat(false);
        setNewCatName("");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        fetchData();
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({});
    setSuccess("");

    try {
      const dataSend = {
        ...formData,
        club_id: activeClubId,
      };
      const res = await Instance.post("/api/inventory/equipments", dataSend);

      if (res.data.success) {
        setFormData({
          name: "",
          equipment_category_id: "",
          total_quantity: 1,
        });
        onRefresh();
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (errorCategory)
    return (
      <ErrorBlock
        message="Impossible de charger les catégories"
        onRetry={fetchData}
      />
    );

  return (
    <Paper
      sx={{ p: 3, borderRadius: 3, backgroundColor: "background.default" }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Ajouter au Catalogue
      </Typography>

      <Box>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              error={hasError("name")}
              helperText={getError("name")}
              fullWidth
              label="Nom de l'article"
              name="name"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={10}
            sm={3}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FormControl
              fullWidth
              error={hasError("equipment_category_id")}
              required
            >
              <InputLabel id="category-select-label">Catégorie</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                name="equipment_category_id"
                value={formData.equipment_category_id}
                label="Catégorie"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    equipment_category_id: e.target.value,
                  })
                }
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: "background.default" },
                  },
                }}
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Chargement...
                  </MenuItem>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Aucune catégorie
                  </MenuItem>
                )}
              </Select>
              {hasError("equipment_category_id") && (
                <FormHelperText>
                  {getError("equipment_category_id")}
                </FormHelperText>
              )}
            </FormControl>

            <IconButton
              onClick={() => setOpenCat(true)}
              color="primary"
              sx={{ ml: 1 }}
            >
              <AddIcon />
            </IconButton>
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              error={hasError("total_quantity")}
              helperText={getError("total_quantity")}
              fullWidth
              type="number"
              name="total_quantity"
              label="Quantité"
              value={formData.total_quantity}
              onChange={(e) =>
                setFormData({ ...formData, total_quantity: e.target.value })
              }
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Modale ultra-rapide pour nouvelle catégorie */}
      <Dialog open={openCat} onClose={() => setOpenCat(false)}>
        <DialogTitle>Nouvelle Catégorie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            variant="standard"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCat(false)}>Annuler</Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            sx={{ fontSize: { xs: 10, md: 14 }, textTransform: "none" }}
            disabled={submitting}
          >
            {submitting ? "Enregistrement..." : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
export default EquipmentManager;
