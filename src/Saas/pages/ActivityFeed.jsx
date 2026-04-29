import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  PersonAdd,
  EmojiEvents,
  History,
  Category,
  Schedule,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "./ConfigSkeleton";

// Configuration des icônes et couleurs par type
const activityConfig = {
  student: { icon: <PersonAdd />, color: "#4caf50", label: "Élève" },
  course: { icon: <Category />, color: "#2196f3", label: "Cours" },
  session: { icon: <Schedule />, color: "#ff9800", label: "Session" },
  examen: { icon: <EmojiEvents />, color: "#f44336", label: "Examen" },
  default: { icon: <History />, color: "#9e9e9e", label: "Action" },
};

function ActivityFeed() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const { activeId, activeType } = UseAuth();

  const getActivities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get(
        `/api/dashboard/activity?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("actitivites", response);
      setActivities(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des activités :", error);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    getActivities();
  }, [activeId, getActivities]);

  return (
    <Box sx={{ flexGrow: 1, mt: 2, backgroundColor: "background.default" }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <History color="primary" /> Dernière activité
      </Typography>
      {loading ? (
        <ConfigSkeleton />
      ) : activities.length > 0 ? (
        <Grid container spacing={2}>
          {activities.map((activity, index) => {
            const config =
              activityConfig[activity.type] || activityConfig.default;

            return (
              <Grid item xs={12} sm={6} md={4} key={activity.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      backgroundColor: "background.default",

                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* Avatar de l'utilisateur */}
                        <Tooltip title={activity?.user?.fullname}>
                          <Avatar
                            src={activity.user.photo_url}
                            sx={{
                              width: 45,
                              height: 45,
                              bgcolor: config.color,
                              fontSize: "1rem",
                            }}
                          >
                            {activity?.user?.fullname?.charAt(0)}
                          </Avatar>
                        </Tooltip>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              noWrap: true,
                              fontSize: { xs: 12, md: 16 },
                            }}
                          >
                            {activity?.user?.fullname}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {activity?.formatted_date}
                          </Typography>
                        </Box>

                        {/* Icone du type d'activité */}
                        <Box sx={{ color: config.color, display: "flex" }}>
                          {config.icon}
                        </Box>
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            mb: 1,
                            fontSize: { xs: 8, md: 10 },
                          }}
                        >
                          {activity.description}
                        </Typography>
                        <Chip
                          label={config.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            bgcolor: `${config.color}15`,
                            color: config.color,
                            fontWeight: "bold",
                            border: "none",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Aucune activité trouvée
        </Typography>
      )}
    </Box>
  );
}

export default ActivityFeed;
