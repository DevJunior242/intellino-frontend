// ─── AuthPage.jsx ────────────────────────────────────────────────────────────
import { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

// ── Palette ──────────────────────────────────────────────────────────────────
export const GOLD = "#C9A227";
export const GOLD_H = "#E8B84B";
export const BG = "#050B14";
export const CARD = "#0B1628";
export const FIELD = "#0D1E36";
export const BORDER = "#1E3550";
export const DIM = "#5A7A9A";
export const TEXT = "#C8D8E8";
export const RED = "#C41E3A";

// ── Slide animation ───────────────────────────────────────────────────────────
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [dir, setDir] = useState(1);

  const handleTab = (_, val) => {
    setDir(val > tab ? 1 : -1);
    setTab(val);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Logo ── */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Impact','Arial Narrow',sans-serif",
            color: GOLD,
            fontSize: 30,
            letterSpacing: 5,
          }}
        >
          INTELLINO
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Impact','Arial Narrow',sans-serif",
            color: DIM,
            fontSize: 12,
            letterSpacing: 7,
          }}
        >
          MARTIAL SAAS
        </Typography>
      </Box>

      {/* ── Card ── */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          bgcolor: CARD,
          border: `1px solid ${GOLD}`,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={handleTab}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${BORDER}`,
            "& .MuiTabs-indicator": { backgroundColor: GOLD, height: 2 },
            "& .MuiTab-root": {
              fontFamily: "'Impact','Arial Narrow',sans-serif",
              letterSpacing: 2,
              fontSize: 13,
              color: DIM,
              transition: "color .2s",
            },
            "& .Mui-selected": { color: `${GOLD} !important` },
          }}
        >
          <Tab label="CONNEXION" disableRipple />
          <Tab label="INSCRIPTION" disableRipple />
        </Tabs>

        {/* Animated panel */}
        <Box sx={{ overflow: "hidden", position: "relative" }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={tab}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {tab === 0 ? (
                <LoginForm
                  onSwitch={() => {
                    setDir(1);
                    setTab(1);
                  }}
                />
              ) : (
                <RegisterForm
                  onSwitch={() => {
                    setDir(-1);
                    setTab(0);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ mt: 1.5, textAlign: "center" }}>
        <Box
          sx={{ width: 40, height: 2, bgcolor: GOLD, mx: "auto", mb: 0.5 }}
        />
        <Typography
          sx={{
            fontFamily: "'Impact','Arial Narrow',sans-serif",
            fontSize: 10,
            letterSpacing: 3,
            color: "#3A5A7A",
          }}
        >
          INTELLINO · MARTIAL SAAS · SÉCURISÉ SSL
        </Typography>
      </Box>
    </Box>
  );
}
