import { Box, Typography, List, ListItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorGlobal from "../../../component/ErrorGlobal";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import { useState } from "react";
import Message from "../Message";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "../ConfigSkeleton";

function EnchainementList({ enchainements, examenId, getEnch, loading }) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { activeId } = UseAuth();

  const handleDelete = async (id) => {
    setError("");
    setSuccess("");
    setError({});
    try {
      const res = await Instance.delete(
        `/api/enchainements/${examenId}/${id}?club_id=${activeId}`,
      );
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
      getEnch();
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    }
  };

  if (!enchainements) return null;
  return (
    // afficher les matiers pour examen
    <Box sx={{ mb: 2 }}>
      <Box>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error?.general} type="error" />}
      </Box>
      {loading && <ConfigSkeleton />}

      {enchainements.length > 0 ? (
        <List>
          {enchainements.map((enchainement) => (
            <ListItem
              key={enchainement.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                mb: 1,
                px: 2,
              }}
            >
              {/* Texte */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {enchainement.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Diviseur : {enchainement.diviseur}
                </Typography>
              </Box>

              {/* Action */}
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleDelete(enchainement.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: { xs: 14, md: 32 },
            mt: 2,
          }}
        >
          Aucun enchaînement trouvé. Veuillez créer un nouvel enchaînement
        </Typography>
      )}
    </Box>
  );
}

export default EnchainementList;
