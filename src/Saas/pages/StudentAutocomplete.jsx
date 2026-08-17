import { useEffect, useRef, useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { Person } from "@mui/icons-material";

// Recherche serveur paginée/debattue (300ms) au lieu de télécharger tout le
// roster du club dès l'ouverture — un club avec des centaines/milliers
// d'élèves rendait le sélecteur lent à charger pour un seul champ texte.
// L'organisateur (club/ligue/fédération) est déduit côté backend de la
// session connectée, pas de ce composant — `activeId` n'est conservé que
// pour compatibilité de la signature du composant.
const StudentAutocomplete = ({
  value,
  onChange,
  hasError,
  getError,
  label = "Choisir un élève",
  clubId = null,
}) => {
  const [options, setOptions] = useState(value ? [value] : []);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await Instance.get("/api/students/search", {
          params: { q: inputValue || undefined, club_id: clubId || undefined },
        });
        const results = res.data?.students || [];
        // Garde l'option déjà sélectionnée visible même si elle sort du lot
        // de résultats courant (évite qu'Autocomplete la fasse disparaître).
        setOptions(
          value && !results.some((s) => s.id === value.id)
            ? [value, ...results]
            : results,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [open, inputValue, clubId, value]);

  return (
    <Autocomplete
      slotProps={{
        paper: {
          sx: { backgroundColor: "background.default" },
        },
      }}
      disablePortal
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={loading}
      filterOptions={(x) => x} // le filtrage se fait côté serveur, pas ici
      options={options}
      getOptionLabel={(student) =>
        `${student.fullname || ""} - ${student.birthdate || ""}`
      }
      value={value}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      onChange={(e, newValue) => onChange(newValue)}
      onInputChange={(e, newInputValue) => setInputValue(newInputValue)}
      noOptionsText={inputValue ? "Aucun élève trouvé" : "Tapez pour rechercher un élève"}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          margin="normal"
          label={label}
          required
          error={hasError("student_id")}
          helperText={getError("student_id")}
          InputProps={{
            ...params.InputProps,
            startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={16} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default StudentAutocomplete;
