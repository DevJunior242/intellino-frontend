import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import ConfigSkeleton from "../ConfigSkeleton";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../../Api/AuthContext";
import ErrorBlock from "../ErrorBlock";
import AddclubManuel from "./AddClubManuel";

const MotionCard = motion(Card);

export default function LeagueClub() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const [errorClub, setErrorClub] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();
  const { activeId } = UseAuth();

  const getClubsAvailable = async () => {
    setLoading(true);
    -setErrorClub("");
    try {
      const response = await Instance.get(
        `/api/clubs/getClubsAvailable?organisateur_id=${activeId}`,
      );
       setClubs(response.data.clubs.data || []);
    } catch (error) {
       setErrorClub(
        "Une erreur est survenue lors de la récupération des clubs disponibles",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getClubsAvailable();
  }, []);
  //add club
  const handleAddClub = async (clubId) => {
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const response = await Instance.post(`/api/leagues/addClub/${clubId}`, {
        organisateur_id: activeId,
      });
      console.log(response);
      if (response?.data?.success) {
        setSuccess(response.data.message);
        getClubsAvailable();
        setError({});
      } else {
        setError({ general: response.data.message });
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };
  if (errorClub)
    return (
      <ErrorBlock
        message="Impossible de charger les clubs disponibles"
        onRetry={getClubsAvailable}
      />
    );
  return (
    <Box p={3}>
      {/* button return */}
      <Button
        variant="outlined"
        sx={{
          mb: 4,
          px: 4,
          py: 1.5,
          color: "text.primary",
          borderColor: "divider",
          textTransform: "none",
          borderRadius: 2,
          fontSize: "1rem",
          "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" },
        }}
        onClick={() => navigate("/dashboard/league/clubs")}
      >
        Retour à la liste des clubs
      </Button>
      <Button
        variant="outlined"
        sx={{
          mb: 4,
          ml: 2,
          px: 4,
          py: 1.5,
          color: "text.primary",
          borderColor: "divider",
          textTransform: "none",
          borderRadius: 2,
          fontSize: "1rem",
          "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" },
        }}
        onClick={handleOpen}
      >
        Ajouter manuellement un club
      </Button>
      <Typography variant="h5" mb={3}>
        Clubs disponibles
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      {loading ? (
        <ConfigSkeleton />
      ) : clubs.length > 0 ? (
        clubs.map((club) => (
          <MotionCard
            key={club.id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
            sx={{ mb: 2 }}
          >
            <CardContent
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Box>
                <Typography fontWeight={600}>{club.name}</Typography>
                <Typography variant="body2">{club.city}</Typography>
              </Box>

              <Button
                variant="contained"
                onClick={() => handleAddClub(club.id)}
                disabled={submitting}
              >
                {submitting ? "Ajout en cours..." : "Ajouter à la ligue"}
              </Button>
            </CardContent>
          </MotionCard>
        ))
      ) : (
        <Typography variant="h5" mb={3}>
          Aucun club disponible
        </Typography>
      )}

      <AddclubManuel open={open} handleClose={handleClose} />
    </Box>
  );
}
