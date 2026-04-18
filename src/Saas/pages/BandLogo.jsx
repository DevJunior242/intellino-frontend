import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const GOLD = "#c8a84b";

/**
 * BrandLogo
 * - Le texte INTELLINO / Martial SaaS est superposé sous l'image dans le même bloc
 * - Le fond derrière le logo est fondu vers le background (#0d0d0d) via un radial-gradient
 * - Aucun rectangle blanc/gris visible
 */
export default function BrandLogo() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        textAlign: "center",
        mb: 3,
        // fond radial centré qui fond vers transparent → se marie avec bgcolor card
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-20px -40px",
          background:
            "radial-gradient(ellipse 70% 80% at 50% 40%, rgba(13,13,13,0.55) 0%, transparent 75%)",
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      {/* Wrapper logo + texte superposé */}
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        {/* Image logo — fond mélangé au noir via mix-blend-mode */}
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Intellino"
          onError={(e) => (e.currentTarget.style.display = "none")}
          sx={{
            height: 90,
            // supprime le fond blanc/gris de l'image JPG en la mélangeant au bg
            mixBlendMode: "luminosity",
            filter: "contrast(1.15) brightness(1.05)",
            display: "block",
            mb: "-6px", // rapproche le texte de l'image
          }}
        />

        {/* Texte fusionné sous le logo */}
        <Box
          sx={{
            // fond noir semi-transparent pour que le texte soit lisible
            // et se fonde naturellement avec la card
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.45) 40%, rgba(13,13,13,0) 100%)",
            px: 2,
            pt: 0.5,
            pb: 0.5,
            borderRadius: "0 0 8px 8px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#fff",
              fontFamily: "'Bebas Neue', 'Impact', sans-serif",
              fontSize: "1.75rem",
              lineHeight: 1.1,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            INTELLINO
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: GOLD,
              letterSpacing: "0.28em",
              fontWeight: 600,
              fontSize: "0.6rem",
              display: "block",
              textShadow: "0 1px 6px rgba(0,0,0,0.9)",
            }}
          >
            — Martial SaaS —
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
