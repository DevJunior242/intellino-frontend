import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { alpha, useTheme } from "@mui/material/styles";
import { Instance } from "../../../../Api/Axios";
import { UseAuth } from "../../../../Api/AuthContext";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 DESIGN TOKENS — dérivés du thème actif (au lieu de valeurs fixes) pour
// s'adapter au clair/sombre des dashboards ligue/fédération.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const useLocalTheme = () => {
  const t = useTheme();
  return {
    bg: t.palette.background.default,
    surface: t.palette.background.paper,
    surfaceHigh: t.palette.background.paper,
    border: t.palette.divider,
    accent: t.palette.primary.main,
    accentLight: t.palette.primary.light,
    accentDim: alpha(t.palette.primary.main, 0.12),
    accentContrastText: t.palette.primary.contrastText,
    teal: t.palette.info.main,
    tealDim: alpha(t.palette.info.main, 0.1),
    amber: t.palette.warning.main,
    amberDim: alpha(t.palette.warning.main, 0.1),
    success: t.palette.success.main,
    successDim: alpha(t.palette.success.main, 0.1),
    successContrastText: t.palette.success.contrastText,
    danger: t.palette.error.main,
    dangerDim: alpha(t.palette.error.main, 0.1),
    text: t.palette.text.primary,
    textMuted: t.palette.text.secondary,
    textFaint: t.palette.text.disabled,
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 UTILITAIRES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
});

const getNiveauColors = (C) => ({
  local: { color: C.teal, label: "Local" },
  regional: { color: C.amber, label: "Régional" },
  national: { color: C.accent, label: "National" },
  international: { color: C.danger, label: "International" },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 PRIMITIVES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Tag = ({ children, color }) => {
  const C = useLocalTheme();
  const resolvedColor = color ?? C.accent;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: resolvedColor,
        background: `${resolvedColor}18`,
        padding: "3px 9px",
        borderRadius: 20,
      }}
    >
      {children}
    </span>
  );
};

const Divider = () => {
  const C = useLocalTheme();
  return <div style={{ height: 1, background: C.border, margin: "4px 0" }} />;
};

const Row = ({ label, children }) => {
  const C = useLocalTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {children}
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💀 SKELETON
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SkeletonCard = () => {
  const C = useLocalTheme();
  return (
    <div
      style={{
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 10,
      }}
    >
      <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
      <div
        style={{
          width: 220,
          height: 14,
          borderRadius: 6,
          background: C.border,
          marginBottom: 8,
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: 120,
          height: 11,
          borderRadius: 6,
          background: C.border,
          animation: "pulse 1.4s ease-in-out infinite 0.2s",
        }}
      />
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ ERROR BLOCK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ErrorBlock = ({ message, onRetry }) => {
  const C = useLocalTheme();
  return (
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
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 STEPPER HEADER — DYNAMIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StepHeader = ({ current, steps }) => {
  const C = useLocalTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        const color = done ? C.success : active ? C.accent : C.textFaint;
        return (
          <div
            key={s.num}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < steps.length - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
              }}
            >
              <motion.div
                animate={{
                  background: done
                    ? C.success
                    : active
                      ? C.accent
                      : C.surfaceHigh,
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: done || active ? C.accentContrastText : C.textFaint,
                }}
              >
                {done ? "✓" : s.num}
              </motion.div>
              <span
                style={{
                  fontSize: 10,
                  color,
                  whiteSpace: "nowrap",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 6px",
                  background: done ? C.success : C.border,
                  marginBottom: 16,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏆 STEP 1 — ÉPREUVE (commun kata + kumite)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Step1Competition = ({
  value,
  onChange,
  competitions,
  error,
  onRetry,
}) => {
  const C = useLocalTheme();
  const NIVEAU_COLORS = getNiveauColors(C);
  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les épreuves"
        onRetry={onRetry}
      />
    );
  if (competitions.length === 0)
    return (
      <motion.div
        {...fadeUp(0)}
        style={{
          textAlign: "center",
          padding: "32px 20px",
          background: C.surfaceHigh,
          border: `1px dashed ${C.border}`,
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>🏆</div>
        <div style={{ color: C.textMuted, fontSize: 14 }}>
          Aucune épreuve disponible.
        </div>
      </motion.div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {competitions.map((comp, i) => {
        console.log("comp", comp);
        const niv = NIVEAU_COLORS[comp.niveau?.nom] ?? {
          color: C.textMuted,
          label: comp.niveau?.nom,
        };
        const selected = value?.id === comp.id;
        const discNom = comp.sub_discipline?.nom?.toLowerCase() ?? "";
        const poidsLabel = comp.category?.poids_max
          ? comp?.category?.poids_min
            ? `${Number(comp?.category?.poids_min)}-${Number(comp.category.poids_max)}kg`
            : `-${Number(comp?.category?.poids_max)}kg`
          : comp?.category?.poids_min
            ? `+${Number(comp?.category?.poids_min)}kg`
            : null;
        return (
          <motion.div
            key={comp.id}
            {...fadeUp(i * 0.06)}
            onClick={() => onChange(comp)}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: selected ? C.accentDim : C.surfaceHigh,
              border: `1.5px solid ${selected ? C.accent : C.border}`,
              borderRadius: 12,
              padding: "14px 18px",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
                  {comp.category?.nom ?? comp.nom}
                  {comp.category?.sexe &&
                    ` — ${comp.category.sexe === "M" ? "Masculin" : comp.category.sexe === "F" ? "Féminin" : "Mixte"}`}
                </span>
                <Tag color={niv.color}>{niv.label}</Tag>
                <Tag color={discNom === "kumite" ? C.danger : C.teal}>
                  {comp.sub_discipline?.nom ?? "—"}({" "}
                  {poidsLabel && `  ${poidsLabel}`})
                </Tag>
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {comp?.evenement?.nom ?? "—"}
              </div>
              {comp.heure_debut_prevu && (
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>
                  {new Date(comp?.heure_debut_prevu).toLocaleString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
            <motion.div
              animate={{
                scale: selected ? 1 : 0.7,
                opacity: selected ? 1 : 0.3,
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${selected ? C.accent : C.border}`,
                background: selected ? C.accent : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selected && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏟️ STEP 2 — PLATEAU (commun kata + kumite)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Step2Plateau = ({
  plateaux,
  plateauId,
  setPlateauId,
  plateauNom,
  setPlateauNom,
  creerNouveau,
  setCreerNouveau,
  loading,
}) => {
  const C = useLocalTheme();
  if (loading)
    return (
      <div>
        {[1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
        Choisissez un plateau existant ou créez-en un nouveau
      </div>

      {/* Plateaux existants */}
      {plateaux.length > 0 &&
        plateaux.map((p, i) => {
          const selected = plateauId === p.id && !creerNouveau;
          return (
            <motion.div
              key={p.id}
              {...fadeUp(i * 0.06)}
              onClick={() => {
                setPlateauId(p.id);
                setCreerNouveau(false);
                setPlateauNom("");
              }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: selected ? C.accentDim : C.surfaceHigh,
                border: `1.5px solid ${selected ? C.accent : C.border}`,
                borderRadius: 12,
                padding: "14px 18px",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.text,
                    marginBottom: 4,
                  }}
                >
                  🏟️ {p.nom}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  {p.config_notations_count ?? 0} configuration(s) existante(s)
                </div>
              </div>
              <motion.div
                animate={{
                  scale: selected ? 1 : 0.7,
                  opacity: selected ? 1 : 0.3,
                }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${selected ? C.accent : C.border}`,
                  background: selected ? C.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {selected && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}

      {/* Option créer nouveau */}
      <motion.div
        {...fadeUp(0.1)}
        onClick={() => {
          setCreerNouveau(true);
          setPlateauId(null);
        }}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.99 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: creerNouveau ? C.tealDim : C.surfaceHigh,
          border: `1.5px solid ${creerNouveau ? C.teal : C.border}`,
          borderRadius: 12,
          padding: "14px 18px",
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: creerNouveau ? `${C.teal}20` : C.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          +
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: creerNouveau ? C.teal : C.text,
            }}
          >
            Créer un nouveau plateau
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            Tatami A, Plateau 1, Zone Kata...
          </div>
        </div>
      </motion.div>

      {/* Input nom nouveau plateau */}
      <AnimatePresence>
        {creerNouveau && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              name="nom"
              value={plateauNom}
              onChange={(e) => setPlateauNom(e.target.value)}
              placeholder="Ex: Tatami A, Plateau 1, Zone Kumite..."
              autoFocus
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: C.surfaceHigh,
                border: `1.5px solid ${plateauNom.trim() ? C.teal : C.border}`,
                borderRadius: 10,
                padding: "12px 16px",
                color: C.text,
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🥋 STEP KATA — NOMBRE DE JUGES + ROTATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StepKataNbJuges = ({
  value,
  onChange,
  nbJuges,
  rotation,
  setRotation,
  error,
  onRetry,
}) => {
  const C = useLocalTheme();
  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les nombres de juges"
        onRetry={onRetry}
      />
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12 }}>
        {nbJuges.map((opt, i) => {
          const selected = value?.id === opt.id;
          return (
            <motion.div
              key={opt.id}
              {...fadeUp(i * 0.07)}
              onClick={() => onChange(opt)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              style={{
                flex: 1,
                textAlign: "center",
                background: selected ? C.accentDim : C.surfaceHigh,
                border: `1.5px solid ${selected ? C.accent : C.border}`,
                borderRadius: 14,
                padding: "22px 12px",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: selected ? C.accentLight : C.textMuted,
                  marginBottom: 6,
                }}
              >
                {opt.valeur}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                {opt.libelle}
              </div>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.accent,
                    margin: "8px auto 0",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          background: C.surfaceHigh,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "16px 18px",
        }}
      >
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10 }}>
          Nombre de rotations d'arbitres après chaque athlète
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2].map((n) => (
            <motion.div
              key={n}
              onClick={() => setRotation(n)}
              whileTap={{ scale: 0.96 }}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px",
                background: rotation === n ? C.accentDim : C.bg,
                border: `1.5px solid ${rotation === n ? C.accent : C.border}`,
                borderRadius: 10,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: rotation === n ? C.accentLight : C.textMuted,
                }}
              >
                {n}
              </span>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                {n === 1 ? "arbitre change" : "arbitres changent"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏱️ STEP KUMITE — DURÉE COMBAT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StepKumiteDuration = ({ value, onChange }) => {
  const C = useLocalTheme();
  const durees = [
    {
      valeur: 2,
      label: "2 min",
      desc: "Catégories jeunes (benjamins, minimes)",
    },
    { valeur: 3, label: "3 min", desc: "Catégories seniors et juniors" },
  ];
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {durees.map((d, i) => {
        const selected = value === d.valeur;
        return (
          <motion.div
            key={d.valeur}
            {...fadeUp(i * 0.07)}
            onClick={() => onChange(d.valeur)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            style={{
              flex: 1,
              textAlign: "center",
              background: selected ? C.accentDim : C.surfaceHigh,
              border: `1.5px solid ${selected ? C.accent : C.border}`,
              borderRadius: 14,
              padding: "28px 12px",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: selected ? C.accentLight : C.textMuted,
                marginBottom: 8,
              }}
            >
              {d.label}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
              {d.desc}
            </div>
            {selected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.accent,
                  margin: "10px auto 0",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 STEP MODE SAISIE (commun)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StepModeSaisie = ({ value, onChange, modes, error, onRetry }) => {
  const C = useLocalTheme();
  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les modes de saisie"
        onRetry={onRetry}
      />
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {modes.map((mode, i) => {
        const selected = value?.id === mode.id;
        const isTab = mode.code === "tablettes";
        const color = isTab ? C.teal : C.amber;
        return (
          <motion.div
            key={mode.id}
            {...fadeUp(i * 0.08)}
            onClick={() => onChange(mode)}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              background: selected ? `${color}10` : C.surfaceHigh,
              border: `1.5px solid ${selected ? color : C.border}`,
              borderRadius: 14,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: selected ? `${color}20` : C.border,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
                transition: "all 0.18s",
              }}
            >
              {isTab ? "📱" : "💻"}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: selected ? color : C.text,
                  }}
                >
                  {mode.libelle}
                </span>
                {isTab && <Tag color={C.teal}>Recommandé</Tag>}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {mode.description}
              </p>
            </div>
            <motion.div
              animate={{
                scale: selected ? 1 : 0.7,
                opacity: selected ? 1 : 0.3,
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                flexShrink: 0,
                border: `2px solid ${selected ? color : C.border}`,
                background: selected ? color : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ RECAP KATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RecapKata = ({
  competition,
  plateau,
  plateauNom,
  nbJuge,
  mode,
  rotation,
}) => {
  const C = useLocalTheme();
  const NIVEAU_COLORS = getNiveauColors(C);
  const niv = NIVEAU_COLORS[competition?.niveau?.nom] ?? { color: C.textMuted };
  return (
    <motion.div
      {...fadeUp(0)}
      style={{
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Récapitulatif — Kata
        </div>
      </div>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Row label="Épreuve">
          <span style={{ color: C.text, fontWeight: 500 }}>
            {competition?.category?.nom}
            {competition?.category?.sexe &&
              ` — ${competition.category.sexe === "M" ? "Masculin" : "Féminin"}`}
          </span>
          <Tag color={niv.color}>{competition?.niveau?.nom}</Tag>
        </Row>
        <Divider />
        <Row label="Événement">
          <span style={{ color: C.text }}>
            {competition?.evenement?.nom ?? "—"}
          </span>
        </Row>
        <Divider />
        <Row label="Plateau">
          <span style={{ color: C.teal, fontWeight: 600 }}>
            🏟️ {plateau ? plateau.nom : plateauNom}
          </span>
        </Row>
        <Divider />
        <Row label="Discipline">
          <Tag color={C.teal}>Kata</Tag>
        </Row>
        <Divider />
        <Row label="Nombre de juges">
          <span style={{ color: C.accentLight, fontWeight: 700, fontSize: 16 }}>
            {nbJuge?.valeur}
          </span>
        </Row>
        <Divider />
        <Row label="Rotations">
          <span style={{ color: C.amber, fontWeight: 700 }}>
            {rotation} arbitre(s) / athlète
          </span>
        </Row>
        <Divider />
        <Row label="Mode de saisie">
          <span
            style={{
              color: mode?.code === "tablettes" ? C.teal : C.amber,
              fontWeight: 500,
            }}
          >
            {mode?.libelle}
          </span>
        </Row>
      </div>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ RECAP KUMITE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RecapKumite = ({ competition, plateau, plateauNom, duration, mode }) => {
  const C = useLocalTheme();
  const NIVEAU_COLORS = getNiveauColors(C);
  const niv = NIVEAU_COLORS[competition?.niveau?.nom] ?? { color: C.textMuted };
  return (
    <motion.div
      {...fadeUp(0)}
      style={{
        background: C.surfaceHigh,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Récapitulatif — Kumite
        </div>
      </div>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Row label="Épreuve">
          <span style={{ color: C.text, fontWeight: 500 }}>
            {competition?.category?.nom}
            {competition?.category?.sexe &&
              ` — ${competition.category.sexe === "M" ? "Masculin" : "Féminin"}`}
          </span>
          <Tag color={niv.color}>{competition?.niveau?.nom}</Tag>
        </Row>
        <Divider />
        <Row label="Événement">
          <span style={{ color: C.text }}>
            {competition?.evenement?.nom ?? "—"}
          </span>
        </Row>
        <Divider />
        <Row label="Plateau">
          <span style={{ color: C.teal, fontWeight: 600 }}>
            🏟️ {plateau ? plateau.nom : plateauNom}
          </span>
        </Row>
        <Divider />
        <Row label="Discipline">
          <Tag color={C.danger}>Kumite</Tag>
        </Row>
        <Divider />
        <Row label="Durée combat">
          <span style={{ color: C.amber, fontWeight: 700 }}>
            {duration === 120 ? "2 minutes" : "3 minutes"}
          </span>
        </Row>
        <Divider />
        <Row label="Mode de saisie">
          <span
            style={{
              color: mode?.code === "tablettes" ? C.teal : C.amber,
              fontWeight: 500,
            }}
          >
            {mode?.libelle}
          </span>
        </Row>
      </div>
    </motion.div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎉 ÉCRAN SUCCÈS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SuccessScreen = ({ competition, mode, onReset }) => {
  const C = useLocalTheme();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", maxWidth: 420, padding: 32 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: C.successDim,
            border: `2px solid ${C.success}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 20px",
          }}
        >
          ✓
        </motion.div>
        <h2
          style={{
            color: C.text,
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
          }}
        >
          Configuration créée !
        </h2>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "0 0 28px" }}>
          Le plateau pour{" "}
          <strong style={{ color: C.text }}>
            {competition?.category?.nom}
          </strong>{" "}
          est configuré.
          {mode?.code === "tablettes" &&
            " Les arbitres peuvent se connecter avec leurs codes PIN."}
        </p>
        <motion.button
          onClick={onReset}
          whileTap={{ scale: 0.97 }}
          style={{
            background: C.accentDim,
            border: `1px solid ${C.accent}`,
            color: C.accentLight,
            borderRadius: 10,
            padding: "10px 24px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Nouvelle configuration
        </motion.button>
      </motion.div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 PAGE PRINCIPALE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function ConfigNotationPage() {
  const C = useLocalTheme();
  //id
  const { activeId, activeType } = UseAuth();
  // ── États communs ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [competition, setCompetition] = useState(null);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState({});

  // ── États plateau ──────────────────────────────────────────────────────────
  const [plateaux, setPlateaux] = useState([]);
  const [plateauId, setPlateauId] = useState(null);
  const [plateauNom, setPlateauNom] = useState("");
  const [creerNouveau, setCreerNouveau] = useState(false);
  const [loadingPlateaux, setLoadingPlateaux] = useState(false);

  // ── États KATA ─────────────────────────────────────────────────────────────
  const [nbJuge, setNbJuge] = useState(null);
  const [rotation, setRotation] = useState(1);

  // ── États KUMITE ───────────────────────────────────────────────────────────
  const [duration, setDuration] = useState(null);

  // ── Données API ────────────────────────────────────────────────────────────
  const [competitions, setCompetitions] = useState([]);
  const [modes, setModes] = useState([]);
  const [nbJuges, setNbJuges] = useState([]);
  const [loadingInit, setLoadingInit] = useState(false);
  const [errorInit, setErrorInit] = useState("");
  const [errorComps, setErrorComps] = useState("");
  const [errorModes, setErrorModes] = useState("");
  const [errorNbJuges, setErrorNbJuges] = useState("");

  // ── Discipline détectée ────────────────────────────────────────────────────
  const estKumite =
    competition?.sub_discipline?.nom?.toLowerCase() === "kumite";
  const estKata = competition?.sub_discipline?.nom?.toLowerCase() === "kata";

  // ── Plateau sélectionné (objet) ────────────────────────────────────────────
  const plateauSelectionne = plateaux.find((p) => p.id === plateauId) ?? null;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STEPS DYNAMIQUES
  // Kata  : Épreuve(1) → Plateau(2) → Nb juges(3) → Mode(4) → Validation(5)
  // Kumite: Épreuve(1) → Plateau(2) → Durée(3) → Mode(4) → Validation(5)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const STEPS_KATA = [
    { num: 1, label: "Épreuve" },
    { num: 2, label: "Plateau" },
    { num: 3, label: "Nb juges" },
    { num: 4, label: "Mode" },
    { num: 5, label: "Validation" },
  ];
  const STEPS_KUMITE = [
    { num: 1, label: "Épreuve" },
    { num: 2, label: "Plateau" },
    { num: 3, label: "Durée" },
    { num: 4, label: "Mode" },
    { num: 5, label: "Validation" },
  ];

  const STEPS = estKumite ? STEPS_KUMITE : STEPS_KATA;
  const dernierStep = 5;

  const LABELS_KATA = [
    "Choisir l'épreuve",
    "Choisir le plateau (tatami)",
    "Nombre de juges + rotations",
    "Mode de saisie",
    "Confirmer la configuration",
  ];
  const LABELS_KUMITE = [
    "Choisir l'épreuve",
    "Choisir le plateau (tatami)",
    "Durée du combat",
    "Mode de saisie",
    "Confirmer la configuration",
  ];
  const LABELS = estKumite ? LABELS_KUMITE : LABELS_KATA;

  // ── Fetch initial ──────────────────────────────────────────────────────────
  const fetchInitialData = useCallback(async () => {
    setLoadingInit(true);
    setErrorInit("");
    setErrorComps("");
    setErrorModes("");
    setErrorNbJuges("");

    const [resComps, resModes, resNbJuges] = await Promise.allSettled([
      Instance.get(`/api/competitions/competitions`),
      Instance.get("/api/modes-saisie/modes-saisie"),
      Instance.get("/api/nb-juges/nb-juges"),
    ]);

    if (resComps.status === "fulfilled")
      setCompetitions(resComps.value.data.data || []);
    else
      setErrorComps(
        resComps.reason?.response?.data?.message ??
          "Impossible de charger les épreuves.",
      );

    if (resModes.status === "fulfilled")
      setModes(resModes.value.data.data || resModes.value.data || []);
    else
      setErrorModes(
        resModes.reason?.response?.data?.message ??
          "Impossible de charger les modes.",
      );

    if (resNbJuges.status === "fulfilled")
      setNbJuges(resNbJuges.value.data.data || resNbJuges.value.data || []);
    else
      setErrorNbJuges(
        resNbJuges.reason?.response?.data?.message ??
          "Impossible de charger les nb juges.",
      );

    if (resComps.status === "rejected" && resModes.status === "rejected")
      setErrorInit("Erreur réseau. Vérifie ta connexion et réessaie.");

    setLoadingInit(false);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ── Fetch plateaux quand épreuve choisie ───────────────────────────────────
  const fetchPlateaux = useCallback(async (evenementId) => {
    if (!evenementId) return;
    setLoadingPlateaux(true);
    try {
      const res = await Instance.get(`/api/evenements/${evenementId}/plateaux`);
      setPlateaux(res.data.plateaux || []);
    } catch (err) {
      console.error("Erreur chargement plateaux", err);
      setPlateaux([]);
    } finally {
      setLoadingPlateaux(false);
    }
  }, []);

  // ── Retries ciblés ─────────────────────────────────────────────────────────
  const retryCompetitions = useCallback(async () => {
    setErrorComps("");
    try {
      const res = await Instance.get("/api/competitions/competitions");
      setCompetitions(res.data.competitions || []);
    } catch (err) {
      setErrorComps(err.response?.data?.message ?? "Erreur réseau.");
    }
  }, []);

  const retryModes = useCallback(async () => {
    setErrorModes("");
    try {
      const res = await Instance.get("/api/modes-saisie/modes-saisie");
      setModes(res.data.data || res.data || []);
    } catch (err) {
      setErrorModes(err.response?.data?.message ?? "Erreur réseau.");
    }
  }, []);

  const retryNbJuges = useCallback(async () => {
    setErrorNbJuges("");
    try {
      const res = await Instance.get("/api/nb-juges/nb-juges");
      setNbJuges(res.data.data || res.data || []);
    } catch (err) {
      setErrorNbJuges(err.response?.data?.message ?? "Erreur réseau.");
    }
  }, []);

  // ── Reset complet ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setDone(false);
    setStep(1);
    setCompetition(null);
    setMode(null);
    setNbJuge(null);
    setRotation(1);
    setDuration(null);
    setPlateauId(null);
    setPlateauNom("");
    setCreerNouveau(false);
    setPlateaux([]);
    setError("");
    fetchInitialData();
  };

  // ── Changement de compétition → reset + fetch plateaux ────────────────────
  const handleCompetitionChange = (comp) => {
    setCompetition(comp);
    setMode(null);
    setNbJuge(null);
    setRotation(1);
    setDuration(null);
    setPlateauId(null);
    setPlateauNom("");
    setCreerNouveau(false);
    fetchPlateaux(comp.evenement_id);
  };

  // ── canNext ────────────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 1) return !!competition;
    if (step === 2) return plateauId !== null || plateauNom.trim() !== "";

    if (estKata) {
      if (step === 3) return !!nbJuge;
      if (step === 4) return !!mode;
      if (step === 5) return true;
    }
    if (estKumite) {
      if (step === 3) return !!duration;
      if (step === 4) return !!mode;
      if (step === 5) return true;
    }
    return false;
  };

  const handleNext = () => setStep((s) => s + 1);

  // ── handleSubmit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError({});
    try {
      const dataSend = {
        competition_id: competition.id,
        mode_saisie_id: mode.id,
        evenement_id: competition.evenement_id,
        organisateur_id: activeId,
        organisateur_type: activeType,
        ...(plateauId
          ? { plateau_id: plateauId }
          : { nouveau_plateau_nom: plateauNom.trim() }),
        ...(estKata && {
          nb_juges_option_id: nbJuge.id,
          nb_rotation: rotation,
        }),
        ...(estKumite && {
          duration,
        }),
      };
      console.log(dataSend);
      await Instance.post("/api/config-notation/config-notation", dataSend);
      setDone(true);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
      // if (err.response?.status === 422) {
      //   const msgs = Object.values(err.response.data.errors ?? {})
      //     .flat()
      //     .join(" — ");
      //   setError(msgs);
      // } else {
      //   setError(err.response?.data?.message ?? "Erreur serveur inattendue.");
      // }
    } finally {
      setLoading(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDUS CONDITIONNELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (loadingInit)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `3px solid ${C.border}`,
              borderTopColor: C.accent,
              margin: "0 auto 16px",
            }}
          />
          <div style={{ color: C.textMuted, fontSize: 13 }}>
            Chargement des données...
          </div>
        </motion.div>
      </div>
    );

  if (errorInit)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", maxWidth: 340, padding: 24 }}
        >
          <div style={{ fontSize: 36, marginBottom: 16 }}>📡</div>
          <div
            style={{
              color: C.danger,
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            Erreur de connexion
          </div>
          <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>
            {errorInit}
          </div>
          <motion.button
            onClick={fetchInitialData}
            whileTap={{ scale: 0.97 }}
            style={{
              background: C.accentDim,
              border: `1px solid ${C.accent}`,
              color: C.accentLight,
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Réessayer
          </motion.button>
        </motion.div>
      </div>
    );

  if (done)
    return (
      <SuccessScreen
        competition={competition}
        mode={mode}
        onReset={handleReset}
      />
    );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGE PRINCIPALE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', sans-serif",
        color: C.text,
      }}
    >
      {/* Topbar */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          padding: "0 28px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            ★
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>KaratéLigue</span>
          <span style={{ color: C.textFaint, fontSize: 13 }}>
            / Notation / Configuration
          </span>
        </div>
        <Tag color={C.amber}>Admin</Tag>
      </div>

      <div
        style={{ maxWidth: 620, margin: "0 auto", padding: "36px 20px 80px" }}
      >
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>
            Configuration de la notation
          </h1>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
            Paramétrez la séance avant le début des épreuves
          </p>
        </motion.div>

        <StepHeader current={step} steps={STEPS} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Card */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 6,
                    borderRadius: 3,
                    alignSelf: "stretch",
                    background: [
                      C.accent,
                      C.teal,
                      C.amber,
                      C.accentLight,
                      C.success,
                      C.danger,
                    ][step - 1],
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    Étape {step} / {STEPS.length}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                    {LABELS[step - 1]}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "20px" }}>
                {/* STEP 1 — Épreuve (commun) */}
                {step === 1 && (
                  <Step1Competition
                    value={competition}
                    onChange={handleCompetitionChange}
                    competitions={competitions}
                    error={errorComps}
                    onRetry={retryCompetitions}
                  />
                )}

                {/* STEP 2 — Plateau (commun) */}
                {step === 2 && (
                  <Step2Plateau
                    plateaux={plateaux}
                    plateauId={plateauId}
                    setPlateauId={setPlateauId}
                    plateauNom={plateauNom}
                    setPlateauNom={setPlateauNom}
                    creerNouveau={creerNouveau}
                    setCreerNouveau={setCreerNouveau}
                    loading={loadingPlateaux}
                  />
                )}

                {/* KATA — Step 3 : nb juges + rotation */}
                {estKata && step === 3 && (
                  <StepKataNbJuges
                    value={nbJuge}
                    onChange={setNbJuge}
                    nbJuges={nbJuges}
                    rotation={rotation}
                    setRotation={setRotation}
                    error={errorNbJuges}
                    onRetry={retryNbJuges}
                  />
                )}

                {/* KATA — Step 4 : mode saisie */}
                {estKata && step === 4 && (
                  <StepModeSaisie
                    value={mode}
                    onChange={setMode}
                    modes={modes}
                    error={errorModes}
                    onRetry={retryModes}
                  />
                )}

                {/* KATA — Step 5 : recap */}
                {estKata && step === 5 && (
                  <RecapKata
                    competition={competition}
                    plateau={plateauSelectionne}
                    plateauNom={plateauNom}
                    nbJuge={nbJuge}
                    mode={mode}
                    rotation={rotation}
                  />
                )}

                {/* KUMITE — Step 3 : durée combat */}
                {estKumite && step === 3 && (
                  <StepKumiteDuration value={duration} onChange={setDuration} />
                )}

                {/* KUMITE — Step 4 : mode saisie */}
                {estKumite && step === 4 && (
                  <StepModeSaisie
                    value={mode}
                    onChange={setMode}
                    modes={modes}
                    error={errorModes}
                    onRetry={retryModes}
                  />
                )}

                {/* KUMITE — Step 5 : recap */}
                {estKumite && step === 5 && (
                  <RecapKumite
                    competition={competition}
                    plateau={plateauSelectionne}
                    plateauNom={plateauNom}
                    duration={duration}
                    mode={mode}
                  />
                )}
              </div>
            </div>

            {/* Alerte mode tablettes */}
            {mode?.code === "tablettes" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: C.tealDim,
                  border: `1px solid ${C.teal}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: C.teal,
                  marginBottom: 16,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ</span>
                <span>
                  En mode tablettes, un <strong>code PIN à 6 chiffres</strong>{" "}
                  sera généré pour chaque arbitre lors de la validation.
                </span>
              </motion.div>
            )}

            {/* Erreur submit */}
            {/* {error && (
              <div
                style={{
                  background: C.dangerDim,
                  border: `1px solid ${C.danger}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: C.danger,
                  marginBottom: 16,
                }}
              >
                ⚠ {error}
              </div>
            )} */}
            {error?.general && <Message text={error.general} type="error" />}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && (
                <motion.button
                  onClick={() => setStep((s) => s - 1)}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: C.textMuted,
                    borderRadius: 10,
                    padding: "11px 20px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ← Retour
                </motion.button>
              )}

              {step < dernierStep ? (
                <motion.button
                  onClick={handleNext}
                  disabled={!canNext()}
                  whileHover={canNext() ? { scale: 1.01 } : {}}
                  whileTap={canNext() ? { scale: 0.98 } : {}}
                  style={{
                    flex: 1,
                    background: canNext() ? C.accent : C.surfaceHigh,
                    border: "none",
                    color: canNext() ? C.accentContrastText : C.textFaint,
                    borderRadius: 10,
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: canNext() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  Continuer →
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{
                    flex: 1,
                    background: loading
                      ? C.surfaceHigh
                      : `linear-gradient(135deg, ${C.accent}, ${C.teal})`,
                    border: "none",
                    color: loading ? C.textFaint : C.accentContrastText,
                    borderRadius: 10,
                    padding: "13px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {loading ? "Enregistrement..." : "✓ Valider la configuration"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
