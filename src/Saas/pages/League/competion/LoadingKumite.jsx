import { Box, keyframes } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import useCompetitionTheme from "./useCompetitionTheme";

const LoadingKumite = () => {
  const T = useCompetitionTheme();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  // Animation de respiration
  const breathing = keyframes`
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
  `;

  // Animation de rotation pour le dojo
  const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `;

  // Animation des faisceaux de lumière
  const shine = keyframes`
    0% { left: -100%; }
    100% { left: 100%; }
  `;

  // Animation du karatéka
  const kickAnimation = keyframes`
    0% { transform: scaleX(1); }
    50% { transform: scaleX(-1) translateX(0); }
    100% { transform: scaleX(1); }
  `;

  return (
    <Box
      sx={{
        bgcolor: T.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fond avec dégradé */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 50% 50%, ${alpha(T.warning, 0.1)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Conteneur principal */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Tatami circulaire avec animation */}
        <Box
          sx={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: `4px solid ${T.warning}`,
            background: `linear-gradient(135deg, ${T.surface} 0%, ${T.bg} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: `0 0 30px ${alpha(T.warning, 0.3)}, inset 0 0 20px ${alpha(T.warning, 0.1)}`,
            animation: `${spin} 3s linear infinite`,
          }}
        >
          {/* Karatéka en silhouette */}
          <Box
            sx={{
              fontSize: "80px",
              animation: `${kickAnimation} 1.5s ease-in-out infinite`,
              transformOrigin: "center",
            }}
          >
            🥋
          </Box>
        </Box>

        {/* Texture de tatami */}
        <Box
          sx={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            border: `2px solid ${alpha(T.warning, 0.2)}`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: `${breathing} 2s ease-in-out infinite`,
          }}
        />

        {/* Texte principal */}
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Box
            component="h1"
            sx={{
              fontSize: "28px",
              fontWeight: "700",
              color: T.warning,
              margin: 0,
              letterSpacing: "2px",
              textTransform: "uppercase",
              textShadow: `0 2px 8px ${alpha(T.warning, 0.3)}`,
            }}
          >
            Chargement du Tatami
          </Box>

          {/* Points animés */}
          <Box
            sx={{
              fontSize: "24px",
              color: T.warning,
              mt: 1,
              minHeight: "30px",
              letterSpacing: "4px",
              animation: `${breathing} 1s ease-in-out infinite`,
            }}
          >
            ●●●
          </Box>

          {/* Sous-titre */}
          <Box
            sx={{
              fontSize: "14px",
              color: alpha(T.warning, 0.6),
              mt: 2,
              fontStyle: "italic",
              letterSpacing: "1px",
            }}
          >
            Préparation du combat...
          </Box>
        </Box>

        {/* Barre de progression styisée */}
        <Box
          sx={{
            width: "280px",
            height: "4px",
            background: alpha(T.warning, 0.1),
            borderRadius: "2px",
            overflow: "hidden",
            mt: 2,
            border: `1px solid ${alpha(T.warning, 0.2)}`,
          }}
        >
          <Box
            sx={{
              height: "100%",
              background: `linear-gradient(90deg, transparent, ${T.warning}, transparent)`,
              animation: `${shine} 2s infinite`,
            }}
          />
        </Box>

        {/* Éléments visuels secondaires */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mt: 3,
            justifyContent: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: T.warning,
                animation: `${breathing} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                boxShadow: `0 0 8px ${alpha(T.warning, 0.5)}`,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Coins décoratifs */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          width: "50px",
          height: "50px",
          border: `2px solid ${alpha(T.warning, 0.2)}`,
          borderRight: "none",
          borderBottom: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          width: "50px",
          height: "50px",
          border: `2px solid ${alpha(T.warning, 0.2)}`,
          borderLeft: "none",
          borderBottom: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
          width: "50px",
          height: "50px",
          border: `2px solid ${alpha(T.warning, 0.2)}`,
          borderRight: "none",
          borderTop: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: "50px",
          height: "50px",
          border: `2px solid ${alpha(T.warning, 0.2)}`,
          borderLeft: "none",
          borderTop: "none",
        }}
      />
    </Box>
  );
};

export default LoadingKumite;
