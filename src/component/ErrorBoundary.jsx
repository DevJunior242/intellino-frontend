import { Component } from "react";
import { Box, Button, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Filet de sécurité pour toute l'appli : sans ceci, une erreur JS non
// rattrapée n'importe où dans l'arbre React fait disparaître TOUTE la page
// (React démonte tout au-dessus du composant en faute) — écran blanc sans
// aucune indication pour l'utilisateur. Affiche un message de secours et
// permet de recharger, au lieu de planter silencieusement.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur non rattrapée :", error, errorInfo?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 4,
          textAlign: "center",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 56, color: "error.main" }} />
        <Typography variant="h6" fontWeight="bold">
          Une erreur inattendue est survenue
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          Un problème technique a interrompu l'affichage de cette page.
          Rechargez pour continuer — vos données n'ont pas été perdues.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recharger la page
        </Button>
      </Box>
    );
  }
}
