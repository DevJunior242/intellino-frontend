import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import ClubAutoComplete from "./ClubAutoComplete";
import { Home, SwapHoriz } from "@mui/icons-material";

const EquipmentLoanManager = ({
  onRefresh,
  activeId,
  open,
  handleClose,
  equipment,
}) => {
  const [selectClub, setSelectClub] = useState(null);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  // On ajoute un champ "description" pour préciser l'usage (interne ou externe)
  const [loanData, setLoanData] = useState({
    equipment_id: equipment.id,
    to_club_id: "",
    quantity_loaned: 1,
    beneficiary: "",
    type: "",
  });

  const isInternal = !selectClub;

  useEffect(() => {
    setLoanData((prev) => ({
      ...prev,
      to_club_id: selectClub ? selectClub.id : null,
    }));
  }, [selectClub]);

  const handleLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});
    setSuccess("");
    if (isInternal && !loanData.beneficiary.trim()) {
      setError({
        beneficiary: ["Le nom ou numéro du bénéficiaire est requis"],
      });
      return;
    }
    try {
      const dataToSend = {
        ...loanData,
        club_id: activeId,
        type: isInternal ? "internal" : "external",
      };
      if (!dataToSend.to_club_id) {
        delete dataToSend.to_club_id;
      }
      console.log("dataToSend", dataToSend);
      const res = await Instance.post("/api/inventory/loans", dataToSend);

      if (res.data.success) {
        // Message dynamique
        const msg = isInternal
          ? `Sortie interne enregistrée pour ${loanData.quantity_loaned} unité(s)`
          : `Prêt au club ${selectClub.name} enregistré`;

        alert(msg);
        handleClose();
        onRefresh();
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          p: 3,
          borderRadius: 3,
          backgroundColor: "background.default",
        },
      }}
    >
      <form onSubmit={handleLoan}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Gestion de matériel : {equipment.name}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            mt: 1,
            backgroundColor: "background.default",
          }}
        >
          {/* Indicateur visuel du mode */}
          <Box display="flex" justifyContent="center" mb={1}>
            <Chip
              icon={isInternal ? <Home /> : <SwapHoriz />}
              label={isInternal ? "Mouvement Interne" : "Prêt Inter-Clubs"}
              color={isInternal ? "info" : "secondary"}
              variant="outlined"
            />
          </Box>
          {equipment.available_quantity} / {equipment.total_quantity}
          {error.general && <Message text={error.general} type="error" />}
          {success && <Message text={success} type="success" />}
          <Typography variant="body2" color="text.secondary">
            Laissez le champ "Club" vide pour une affectation au sein de votre
            propre club.
          </Typography>
          <ClubAutoComplete
            value={selectClub}
            onChange={(val) => setSelectClub(val)}
            label="Club partenaire (Optionnel)"
            hasError={hasError}
            getError={getError}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                error={hasError("quantity_loaned")}
                helperText={getError("quantity_loaned")}
                type="number"
                fullWidth
                label="Quantité"
                value={loanData.quantity_loaned}
                onChange={(e) =>
                  setLoanData({ ...loanData, quantity_loaned: e.target.value })
                }
                required
                inputProps={{ min: 1, max: equipment.available_quantity }}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                label={
                  isInternal
                    ? "Bénéficiaire (Nom, Prof, Salle)"
                    : "Référence ou Contact au club"
                }
                placeholder={
                  isInternal
                    ? "Ex: Coach Ahmed, Salle B, Élève Jean..."
                    : "Ex: Responsable matériel du club"
                }
                value={loanData.beneficiary}
                onChange={(e) =>
                  setLoanData({
                    ...loanData,
                    beneficiary: e.target.value,
                  })
                }
                // On le rend obligatoire surtout pour le prêt interne
                required={isInternal}
                error={hasError("beneficiary")}
                helperText={
                  getError("beneficiary") ||
                  (isInternal ? "Précisez qui emporte le matériel" : "")
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={isInternal ? "primary" : "secondary"}
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : isInternal
                ? "Valider la sortie"
                : "Enregistrer le prêt"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EquipmentLoanManager;
