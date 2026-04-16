import { motion } from "framer-motion";

const C = {
  bg: "#080a0f",
  surface: "#0e1118",
  surfaceHigh: "#141720",
  border: "#1e2433",
  accent: "#6c63ff",
  accentLight: "#9d97ff",
  accentDim: "rgba(108,99,255,0.12)",
  teal: "#00e5c0",
  tealDim: "rgba(0,229,192,0.10)",
  amber: "#ffb547",
  amberDim: "rgba(255,181,71,0.10)",
  success: "#22c55e",
  successDim: "rgba(34,197,94,0.10)",
  danger: "#ef4444",
  dangerDim: "rgba(239,68,68,0.10)",
  text: "#dde1f0",
  textMuted: "#636b88",
  textFaint: "#2a3048",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UTILITAIRES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
});

const ErrorBlock = ({ message, onRetry }) => (
  <motion.div
    {...fadeUp(0)}
    style={{
      textAlign: "center",
      padding: "32px 20px",
      background: C.dangerDim,
      border: `1px solid ${C.danger}`,
      borderRadius: 12,
    }}
  >
    <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
    <div style={{ color: C.danger, fontWeight: 600, marginBottom: 6 }}>
      {message}
    </div>
    <motion.button
      onClick={onRetry}
      whileTap={{ scale: 0.97 }}
      style={{
        background: C.dangerDim,
        border: `1px solid ${C.danger}`,
        color: C.danger,
        borderRadius: 8,
        padding: "8px 18px",
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      Réessayer
    </motion.button>
  </motion.div>
);
export default ErrorBlock;
