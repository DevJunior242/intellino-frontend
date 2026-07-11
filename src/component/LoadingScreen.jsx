import { Box, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.75; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Écran de chargement générique aux couleurs d'Intellino — utilisé comme
// fallback de Suspense pour éviter le flash de page blanche pendant le
// chargement d'un chunk (changement de page, switch de contexte club/ligue...).
// `fullscreen` : couvre tout le viewport (boot initial de l'auth, changement de layout).
// Sans `fullscreen` : remplit son conteneur parent (zone de contenu d'un layout déjà monté).
function LoadingScreen({ fullscreen = false }) {
  return (
    <Box
      sx={{
        position: fullscreen ? "fixed" : "static",
        inset: fullscreen ? 0 : "auto",
        zIndex: fullscreen ? 1300 : "auto",
        minHeight: fullscreen ? "100vh" : "60vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 88,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid",
            borderColor: "primary.main",
            borderTopColor: "transparent",
            animation: `${spin} 0.9s linear infinite`,
          }}
        />
        <Box
          component="img"
          src="/Intellino-Logo.png"
          alt="Intellino"
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
            animation: `${pulse} 1.4s ease-in-out infinite`,
          }}
        />
      </Box>
    </Box>
  );
}

export default LoadingScreen;
