import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Stack,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

export default function MandatForm() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [form, setForm] = useState({
    start_at: "",
    end_at: "",
    actif: false,
  });
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      const response = await Instance.post("/api/mandats", form);

      if (response.data.success) {
        setSuccess(response.data.message);
        setTimeout(() => setSuccess(""), 5000);
        setForm({
          start_at: "",
          end_at: "",
          actif: false,
        });
      }
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    }
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        L'activation d'un nouveau mandat archivera automatiquement le mandat
        précédent.
      </Alert>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}
      <form onSubmit={handleSave}>
        <Stack direction="row" spacing={2}>
          <TextField
            name="start_at"
            label="Date de début"
            error={hasError("start_at")}
            helperText={getError("start_at")}
            type="date"
            value={form.start_at}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <TextField
            name="end_at"
            label="Date de fin"
            error={hasError("end_at")}
            helperText={getError("end_at")}
            type="date"
            value={form.end_at}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={form.actif}
              onChange={(e) => setForm({ ...form, actif: e.target.checked })}
            />
          }
          label="Définir comme mandat actuel (Actif)"
        />
        <Button type="submit" variant="contained" color="primary" size="large">
          Créer le Cycle de Mandat
        </Button>
      </form>
    </Stack>
  );
}
