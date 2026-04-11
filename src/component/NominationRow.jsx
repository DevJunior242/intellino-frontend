import {
  Card,
  Stack,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Box,
  MenuItem,
} from "@mui/material";

export default function NominationRow({
  poste,
  candidats,
  onNominationChange,
}) {
  console.log("candidats", candidats);
  return (
    <Card
      variant="outlined"
      sx={{ p: 2, mb: 2, borderLeft: "5px solid #1a237e" }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {poste.title}{" "}
        {poste.parent_id && <small style={{ color: "gray" }}>(Adjoint)</small>}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        <TextField
          select
          fullWidth
          label="Choisir l'élu"
          onChange={(e) =>
            onNominationChange(poste.id, { user_id: e.target.value })
          }
        >
          {candidats
            .filter((c) => c.poste_id === poste.id)
            .map((c) => (
              <MenuItem key={c.user_id} value={c.user_id}>
                {/* On accède aux infos du user lié au candidat */}
                {c.user.fullname.toUpperCase()} {c.user.phone}
              </MenuItem>
            ))}
        </TextField>
      </Stack>
    </Card>
  );
}
