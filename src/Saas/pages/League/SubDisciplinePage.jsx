import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";

// ── Palette & tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f14",
  surface: "#13161e",
  surfaceHigh: "#1a1e2a",
  border: "#252a38",
  borderHover: "#353c52",
  accent: "#6c63ff",
  accentLight: "#8b84ff",
  accentDim: "rgba(108,99,255,0.15)",
  teal: "#1de4bd",
  tealDim: "rgba(29,228,189,0.12)",
  amber: "#f5a623",
  amberDim: "rgba(245,166,35,0.12)",
  text: "#e8eaf0",
  textMuted: "#7a8099",
  textFaint: "#3e4460",
  success: "#22c55e",
  successDim: "rgba(34,197,94,0.12)",
  danger: "#ef4444",
  dangerDim: "rgba(239,68,68,0.1)",
};

// ── Tiny design-system primitives ────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label
    style={{
      display: "block",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: C.textMuted,
      marginBottom: 6,
    }}
  >
    {children}
    {required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
  </label>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    style={{
      width: "100%",
      boxSizing: "border-box",
      background: C.surfaceHigh,
      border: `1px solid ${error ? C.danger : C.border}`,
      borderRadius: 8,
      padding: "10px 14px",
      color: C.text,
      fontSize: 14,
      outline: "none",
      transition: "border-color 0.2s",
      fontFamily: "inherit",
      ...props.style,
    }}
    onFocus={(e) => (e.target.style.borderColor = error ? C.danger : C.accent)}
    onBlur={(e) => (e.target.style.borderColor = error ? C.danger : C.border)}
  />
);

const Err = ({ msg }) =>
  msg ? (
    <p style={{ color: C.danger, fontSize: 12, marginTop: 5, marginBottom: 0 }}>
      {msg}
    </p>
  ) : null;

const SectionCard = ({ index, color, title, subtitle, icon, children }) => {
  const colors = {
    accent: { pill: C.accentDim, text: C.accentLight, border: C.accent },
    teal: { pill: C.tealDim, text: C.teal, border: C.teal },
    amber: { pill: C.amberDim, text: C.amber, border: C.amber },
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: colors.border,
          borderRadius: "3px 0 0 3px",
        }}
      />

      {/* header */}
      <div
        style={{
          padding: "20px 24px 16px 28px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: colors.pill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: colors.text,
                background: colors.pill,
                padding: "2px 8px",
                borderRadius: 20,
              }}
            >
              Étape {index + 1}
            </span>
          </div>
          <div
            style={{
              color: C.text,
              fontWeight: 600,
              fontSize: 16,
              marginTop: 3,
            }}
          >
            {title}
          </div>
          <div style={{ color: C.textMuted, fontSize: 13, marginTop: 1 }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: "20px 24px 24px 28px" }}>{children}</div>
    </motion.div>
  );
};

const Chip = ({ label, selected, onClick, color = C.accent }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    style={{
      border: `1.5px solid ${selected ? color : C.border}`,
      background: selected ? `rgba(108,99,255,0.15)` : C.surfaceHigh,
      color: selected ? C.accentLight : C.textMuted,
      borderRadius: 8,
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: selected ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.18s",
      fontFamily: "inherit",
    }}
  >
    {label}
  </motion.button>
);

// ── Recap block ───────────────────────────────────────────────────────────────
const RecapRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
    }}
  >
    <span style={{ color: C.textMuted, fontSize: 13, flexShrink: 0 }}>
      {label}
    </span>
    <span
      style={{
        color: C.text,
        fontSize: 13,
        fontWeight: 500,
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SubDisciplinePage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const { activeId, activeType } = UseAuth();
  // — Disciplines state
  const DISC_PRESETS = ["Kata", "Kumite", "Kumite équipe", "Kata équipe"];
  const [disciplines, setDisciplines] = useState(
    DISC_PRESETS.map((nom, i) => ({ id: i + 1, nom, selected: i < 2 })),
  );
  const [newDisc, setNewDisc] = useState("");

  // — Categories state
  const [categories, setCategories] = useState([
    {
      id: 1,
      nom: "Poussin",
      age_min: 6,
      age_max: 7,
      sexe: "M",
      disciplines: ["Kata"],
    },
    {
      id: 2,
      nom: "Benjamin",
      age_min: 8,
      age_max: 9,
      sexe: "F",
      disciplines: ["Kata", "Kumite"],
      poids_min: "",
      poids_max: 30,
    },
    {
      id: 3,
      nom: "Senior",
      age_min: 18,
      age_max: 34,
      sexe: "M",
      disciplines: ["Kata", "Kumite"],
      poids_min: 60,
      poids_max: 67,
    },
  ]);
  const [catErrors, setCatErrors] = useState({});
  const [newCat, setNewCat] = useState({
    nom: "",
    age_min: "",
    age_max: "",
    sexe: "",
    disciplines: [],
    poids_min: "",
    poids_max: "",
  });

  // Une catégorie rattachée au Kumite doit avoir des bornes de poids
  const needsPoids = (discNoms) =>
    discNoms.some((nom) => nom.toLowerCase().includes("kumite"));

  // — Submitted state
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedDiscs = disciplines.filter((d) => d.selected);

  const toggleDisc = (id) =>
    setDisciplines((ds) =>
      ds.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)),
    );

  const addDisc = () => {
    if (!newDisc.trim()) return;
    const id = Date.now();
    setDisciplines((ds) => [
      ...ds,
      { id, nom: newDisc.trim(), selected: true },
    ]);
    setNewDisc("");
  };

  const addCategory = (e) => {
    e?.preventDefault();
    const errs = {};
    if (!newCat.nom.trim()) errs.nom = "Nom requis";
    if (!newCat.age_min && newCat.age_min !== 0)
      errs.age_min = "Âge min requis";
    if (!newCat.age_max && newCat.age_max !== 0)
      errs.age_max = "Âge max requis";
    if (newCat.disciplines.length === 0)
      errs.disciplines = "Choisir au moins une discipline";
    if (!newCat.sexe) errs.sexe = "Choisir un sexe";
    if (needsPoids(newCat.disciplines) && !newCat.poids_min && !newCat.poids_max)
      errs.poids = "Kumite : indiquer au moins un poids min ou max";
    setCatErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setCategories((cs) => [...cs, { ...newCat, id: Date.now() }]);
    setNewCat({
      nom: "",
      age_min: "",
      age_max: "",
      sexe: "",
      disciplines: [],
      poids_min: "",
      poids_max: "",
    });
    setCatErrors({});
  };

  const removeCategory = (id) =>
    setCategories((cs) => cs.filter((c) => c.id !== id));

  const toggleNewCatDisc = (id) =>
    setNewCat((c) => ({
      ...c,
      disciplines: c.disciplines.includes(id)
        ? c.disciplines.filter((d) => d !== id)
        : [...c.disciplines, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    setLoading(true);
    const dataToSubmit = {
      disciplines: selectedDiscs,
      categories: categories,
      organisateur_id: activeId,
      organisateur_type: activeType,
    };
    try {
      const response = await Instance.post("/api/setup/setup", dataToSubmit);
      if (response.data.success) {
        setSuccess(
          response.data.message || "votre configuration a bien été enregistrée",
        );
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError, callback: () => setLoading(false) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: C.text,
      }}
    >
      {/* top bar */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          background: C.surface,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ★
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
            KaratéCatégories
          </span>
          <span style={{ color: C.textFaint, fontSize: 13, marginLeft: 6 }}>
            / Configuration catégories
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.textMuted,
            background: C.surfaceHigh,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          3 étapes · tout en une page
        </div>
      </div>

      <div
        style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 80px" }}
      >
        {/* page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1
            style={{ fontSize: 26, fontWeight: 700, margin: 0, color: C.text }}
          >
            Configurer la ligue
          </h1>
          <p style={{ color: C.textMuted, margin: "6px 0 0", fontSize: 14 }}>
            Crée la saison, tes disciplines et tes catégories en une seule fois.
          </p>
        </motion.div>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
        >
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: C.success,
                borderRadius: 20,
                padding: "10px 14px",
                fontSize: 13,
                color: C.textMuted,
                textAlign: "center",
                marginTop: 20,
              }}
            >
              {success}
            </motion.div>
          )}
        </div>
        {error.general && <Message text={error.general} type="error" />}

        {/* debut */}
        <form onSubmit={handleSubmit}>
          {/* ── ÉTAPE 2 : DISCIPLINES ── */}
          <SectionCard
            index={1}
            color="teal"
            icon="🥋"
            title="Disciplines"
            subtitle="Sélectionner ou ajouter des disciplines"
          >
            <Label>Disciplines disponibles</Label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {disciplines.map((d) => (
                <Chip
                  key={d.id}
                  label={d.nom}
                  selected={d.selected}
                  onClick={() => toggleDisc(d.id)}
                />
              ))}
            </div>
            <Label>Ajouter une discipline personnalisée</Label>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                placeholder="ex: Bo Jutsu"
                value={newDisc}
                onChange={(e) => setNewDisc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDisc();
                  }
                }}
                style={{ flex: 1 }}
              />
              <motion.button
                type="button"
                onClick={addDisc}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: C.tealDim,
                  border: `1px solid ${C.teal}`,
                  color: C.teal,
                  borderRadius: 8,
                  padding: "0 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                + Ajouter
              </motion.button>
            </div>
            {selectedDiscs.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: C.tealDim,
                  borderRadius: 8,
                  fontSize: 13,
                  color: C.teal,
                }}
              >
                {selectedDiscs.length} discipline
                {selectedDiscs.length > 1 ? "s" : ""} sélectionnée
                {selectedDiscs.length > 1 ? "s" : ""} :&nbsp;
                <strong>{selectedDiscs.map((d) => d.nom).join(", ")}</strong>
              </div>
            )}
            <Err msg={error["disciplines"]?.[0]} />
          </SectionCard>

          {/* ── ÉTAPE 3 : CATÉGORIES ── */}
          <SectionCard
            index={2}
            color="amber"
            icon="👥"
            title="Catégories d'âge"
            subtitle="Définir les tranches d'âge et leurs disciplines"
          >
            {/* liste existante */}
            <AnimatePresence>
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: C.surfaceHigh,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <span
                      style={{ fontWeight: 600, fontSize: 14, color: C.text }}
                    >
                      {cat.nom}
                    </span>
                    <span
                      style={{ fontWeight: 600, fontSize: 14, color: C.text }}
                    >
                      ( {cat.sexe})
                    </span>

                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 12,
                        color: C.textMuted,
                        background: C.amberDim,
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {cat.age_min}–{cat.age_max} ans
                    </span>
                    {(cat.poids_min || cat.poids_max) && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 12,
                          color: C.teal,
                          background: C.tealDim,
                          padding: "2px 8px",
                          borderRadius: 20,
                        }}
                      >
                        {cat.poids_min && cat.poids_max
                          ? `${Number(cat.poids_min)}–${Number(cat.poids_max)}kg`
                          : cat.poids_max
                            ? `-${Number(cat.poids_max)}kg`
                            : `+${Number(cat.poids_min)}kg`}
                      </span>
                    )}
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: C.textMuted,
                      }}
                    >
                      {cat.disciplines.join(", ") || "—"}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    style={{
                      background: C.dangerDim,
                      border: "none",
                      color: C.danger,
                      borderRadius: 6,
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "inherit",
                    }}
                  >
                    Supprimer
                  </button>
                  <Err msg={error[`categories.${idx}.nom`]?.[0]} />
                  <Err msg={error[`categories.${idx}.sexe`]?.[0]} />
                  <Err msg={error[`categories.${idx}.age_min`]?.[0]} />
                  <Err msg={error[`categories.${idx}.age_max`]?.[0]} />
                  <Err msg={error[`categories.${idx}.poids_max`]?.[0]} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* formulaire nouvelle catégorie */}
            <div
              style={{
                background: C.surfaceHigh,
                border: `1px dashed ${C.borderHover}`,
                borderRadius: 12,
                padding: 16,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.amber,
                  marginBottom: 12,
                }}
              >
                + Nouvelle catégorie
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <Label required>Nom</Label>
                  <Input
                    placeholder="ex: Cadet"
                    value={newCat.nom}
                    error={catErrors.nom}
                    onChange={(e) =>
                      setNewCat((c) => ({ ...c, nom: e.target.value }))
                    }
                  />
                  <Err msg={catErrors.nom} />
                </div>
                {/* sexe */}
                <div>
                  <Label required>Sexe</Label>
                  <select
                    name="sexe"
                    value={newCat.sexe}
                    onChange={(e) =>
                      setNewCat((c) => ({ ...c, sexe: e.target.value }))
                    }
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="M">Male (M)</option>
                    <option value="F">Female (F)</option>
                    <option value="Mixte">Mixed</option>
                  </select>
                  <Err msg={catErrors.sexe} />
                </div>
                <div>
                  <Label required>Âge min</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={newCat.age_min}
                    error={catErrors.age_min}
                    onChange={(e) =>
                      setNewCat((c) => ({ ...c, age_min: e.target.value }))
                    }
                  />
                  <Err msg={catErrors.age_min} />
                </div>
                <div>
                  <Label required>Âge max</Label>
                  <Input
                    type="number"
                    placeholder="13"
                    value={newCat.age_max}
                    error={catErrors.age_max}
                    onChange={(e) =>
                      setNewCat((c) => ({ ...c, age_max: e.target.value }))
                    }
                  />
                  <Err msg={catErrors.age_max} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Label required>Disciplines autorisées</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedDiscs.length === 0 ? (
                    <span style={{ fontSize: 13, color: C.textFaint }}>
                      Aucune discipline sélectionnée à l'étape 2
                    </span>
                  ) : (
                    selectedDiscs.map((d) => (
                      <Chip
                        key={d.id}
                        label={d.nom}
                        selected={newCat.disciplines.includes(d.nom)}
                        onClick={() => toggleNewCatDisc(d.nom)}
                      />
                    ))
                  )}
                </div>
                <Err msg={catErrors.disciplines} />
              </div>

              {needsPoids(newCat.disciplines) && (
                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <Label>Poids min (kg)</Label>
                    <Input
                      type="number"
                      placeholder="ex: 60"
                      value={newCat.poids_min}
                      onChange={(e) =>
                        setNewCat((c) => ({ ...c, poids_min: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Poids max (kg)</Label>
                    <Input
                      type="number"
                      placeholder="ex: 67"
                      value={newCat.poids_max}
                      onChange={(e) =>
                        setNewCat((c) => ({ ...c, poids_max: e.target.value }))
                      }
                    />
                  </div>
                  <Err msg={catErrors.poids} />
                </div>
              )}

              <motion.button
                type="button"
                onClick={addCategory}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 14,
                  background: C.amberDim,
                  border: `1px solid ${C.amber}`,
                  color: C.amber,
                  borderRadius: 8,
                  padding: "9px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Ajouter la catégorie
              </motion.button>
            </div>
          </SectionCard>

          {/* ── BOUTON SUBMIT ── */}
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: loading ? C.surfaceHigh : C.accent,
                  border: "none",
                  borderRadius: 12,
                  color: loading ? C.textMuted : "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {loading
                  ? "Enregistrement en cours…"
                  : "✓ Enregistrer la configuration"}
              </motion.button>
            ) : (
              <motion.div
                key="recap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.success}`,
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {/* success header */}
                <div
                  style={{
                    background: C.successDim,
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: C.success,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 18,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: C.success,
                        fontSize: 15,
                      }}
                    >
                      Configuration enregistrée !
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 13 }}>
                      Voici le récapitulatif de ta configuration
                    </div>
                  </div>
                </div>

                {/* recap body */}
                <div style={{ padding: "20px 24px" }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.textMuted,
                      margin: "18px 0 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Disciplines
                  </div>
                  <RecapRow
                    label="Sélectionnées"
                    value={selectedDiscs.map((d) => d.nom).join(", ") || "—"}
                  />

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.textMuted,
                      margin: "18px 0 8px",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Catégories ({categories.length})
                  </div>
                  {categories.map((cat) => {
                    const poidsLabel = cat.poids_max
                      ? cat.poids_min
                        ? ` · ${Number(cat.poids_min)}-${Number(cat.poids_max)}kg`
                        : ` · -${Number(cat.poids_max)}kg`
                      : cat.poids_min
                        ? ` · +${Number(cat.poids_min)}kg`
                        : "";
                    return (
                      <RecapRow
                        key={cat.id}
                        label={`${cat.nom} (${cat.age_min}–${cat.age_max} ans)${poidsLabel}`}
                        value={cat.disciplines.join(", ") || "—"}
                      />
                    );
                  })}

                  <motion.button
                    onClick={() => setSubmitted(false)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginTop: 20,
                      background: "transparent",
                      border: `1px solid ${C.border}`,
                      color: C.textMuted,
                      borderRadius: 8,
                      padding: "9px 18px",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ← Modifier la configuration
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* fin */}
      </div>
    </div>
  );
}
