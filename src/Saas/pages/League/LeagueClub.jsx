import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

const MotionCard = motion(Card);

export default function LeagueClub() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});

  const getClubsAvailable = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Instance.get("/api/clubs/getClubsAvailable");
      console.log(response);
      setClubs(response.data.clubs.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getClubsAvailable();
  }, [getClubsAvailable]);
  //add club
  const handleAddClub = async (clubId) => {
    setError({});
    setSuccess("");
    try {
      const response = await Instance.post(`/api/leagues/addClub/${clubId}`);
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
    }
  };
  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        Clubs disponibles
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              width: 40,
              height: 40,
              border: "4px solid #1976d2",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
            }}
          />
        </Box>
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
              >
                Ajouter à la ligue
              </Button>
            </CardContent>
          </MotionCard>
        ))
      ) : (
        <Typography variant="h5" mb={3}>
          Aucun club disponible
        </Typography>
      )}
    </Box>
  );
}
