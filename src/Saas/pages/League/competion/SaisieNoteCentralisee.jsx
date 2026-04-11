import { useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";

export default function SaisieNoteCentralisee({
  config,
  enCours,
  onAthleteSuivant,
}) {
  const nbJuges = config.nb_juges_option.valeur;
  const [notes, setNotes] = useState({}); // { 1: 7.5, 2: 8.0, ... }
  const [jugeActif, setJugeActif] = useState(1); // juge en cours de saisie
  const [valeur, setValeur] = useState(7.0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  // Reset quand athlète change
  useEffect(() => {
    setNotes({});
    setJugeActif(1);
    setValeur(7.0);
    setScore(null);
  }, [enCours?.id]);

  const toutesNotees = Object.keys(notes).length === nbJuges;

  const confirmerNote = async () => {
    setLoading(true);
    try {
      await Instance.post("/api/notes/centralise", {
        inscription_id: enCours.id,
        numero_juge: jugeActif,
        valeur: valeur,
        config_id: config.id,
      });

      const nouvellesNotes = { ...notes, [jugeActif]: valeur };
      setNotes(nouvellesNotes);

      // Passer au juge suivant
      if (jugeActif < nbJuges) {
        setJugeActif(jugeActif + 1);
        setValeur(7.0);
      } else {
        // Toutes les notes saisies → calculer score
        const res = await Instance.get(`/api/inscriptions/${enCours.id}/notes`);
        setScore(res.data.score);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const corrigerPrecedent = () => {
    if (jugeActif <= 1) return;
    const jugePrec = jugeActif - 1;
    const nouvellesNotes = { ...notes };
    delete nouvellesNotes[jugePrec];
    setNotes(nouvellesNotes);
    setJugeActif(jugePrec);
    setValeur(notes[jugePrec] || 7.0);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
      {/* Athlète en cours */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight="900">
              {enCours.athlete.prenom} {enCours.athlete.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Passage N°{enCours.ordre_passage}
            </Typography>
          </Box>
          <Chip
            label={`${Object.keys(notes).length}/${nbJuges} notes`}
            color={toutesNotees ? "success" : "primary"}
          />
        </Stack>
      </Paper>

      {/* Grille des juges */}
      <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
        {Array.from({ length: nbJuges }, (_, i) => {
          const num = i + 1;
          const estSaisi = notes[num] !== undefined;
          const estActif = jugeActif === num;
          return (
            <Paper
              key={num}
              sx={{
                p: 2,
                flex: 1,
                minWidth: 80,
                textAlign: "center",
                borderRadius: 3,
                border: "2px solid",
                borderColor: estActif
                  ? "warning.main"
                  : estSaisi
                    ? "success.main"
                    : "divider",
                bgcolor: estActif
                  ? "warning.50"
                  : estSaisi
                    ? "success.50"
                    : "background.paper",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Juge {num}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={estSaisi ? "success.main" : "text.disabled"}
              >
                {estSaisi ? notes[num].toFixed(1) : "—"}
              </Typography>
            </Paper>
          );
        })}
      </Stack>

      {/* Zone saisie — masquée si toutes notées */}
      {!toutesNotees && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Note — Juge {jugeActif}
          </Typography>

          {/* Valeur en grand */}
          <Typography
            variant="h2"
            fontWeight="900"
            textAlign="center"
            color="primary.main"
            mb={1}
          >
            {valeur.toFixed(1)}
          </Typography>

          {/* Slider */}
          <Slider
            value={valeur}
            onChange={(_, v) => setValeur(v)}
            min={0}
            max={10}
            step={0.1}
            marks={[
              { value: 0, label: "0" },
              { value: 5, label: "5" },
              { value: 10, label: "10" },
            ]}
            sx={{ mb: 2 }}
          />

          {/* Boutons rapides */}
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent="center"
            mb={3}
          >
            {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5].map((v) => (
              <Chip
                key={v}
                label={v.toFixed(1)}
                onClick={() => setValeur(v)}
                color={valeur === v ? "primary" : "default"}
                variant={valeur === v ? "filled" : "outlined"}
                sx={{ fontWeight: "bold" }}
              />
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap={2}>
            <Button
              variant="outlined"
              disabled={jugeActif === 1}
              onClick={corrigerPrecedent}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              ← Corriger Juge {jugeActif - 1}
            </Button>
            <Button
              variant="contained"
              disabled={loading}
              onClick={confirmerNote}
              sx={{ flex: 2, py: 1.5, borderRadius: 3, fontWeight: "bold" }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Confirmer Juge ${jugeActif} — ${valeur.toFixed(1)}`
              )}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Score final */}
      {toutesNotees && score !== null && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 2,
            textAlign: "center",
            bgcolor: "success.main",
          }}
        >
          <Typography color="white" variant="body2" mb={1}>
            Score final (min/max éliminés)
          </Typography>
          <Typography color="white" variant="h3" fontWeight="900">
            {score}
          </Typography>
        </Paper>
      )}

      {/* Athlète suivant — actif seulement si toutes notées */}
      <Button
        fullWidth
        variant="contained"
        color="warning"
        disabled={!toutesNotees}
        onClick={onAthleteSuivant}
        sx={{ py: 2, borderRadius: 3, fontWeight: "bold" }}
      >
        {toutesNotees
          ? "Athlète suivant →"
          : `En attente (${Object.keys(notes).length}/${nbJuges} notes)`}
      </Button>
    </Box>
  );
}
