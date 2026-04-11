import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { InfoOutlined } from "@mui/icons-material";

// Couleurs exactes de ton interface
const theme = {
  bg: "#1a1d21",
  card: "#2c3035",
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a", // Jaune
  chipBg: "rgba(255, 255, 255, 0.05)",
};

const MemberCard = ({
  initials,
  name,
  role,
  badge,
  badgeColor,
  mandate,
  avatarBg,
}) => (
  <Grid item xs={12} md={6}>
    <Paper
      elevation={0}
      sx={{
        p: 4,
        bgcolor: theme.card,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.03)",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)", bgcolor: "#32363b" },
      }}
    >
      <Avatar
        sx={{
          width: 64,
          height: 64,
          mb: 2,
          bgcolor: avatarBg || "#fff",
          color: "#1a1d21",
          fontWeight: 700,
          fontSize: "1.2rem",
        }}
      >
        {initials}
      </Avatar>

      <Typography
        variant="h6"
        sx={{ color: theme.textMain, fontWeight: 600, mb: 0.5 }}
      >
        {name}
      </Typography>

      <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
        {role}
      </Typography>

      <Chip
        label={badge}
        size="small"
        sx={{
          bgcolor: badgeColor || "#fff",
          color: "#1a1d21",
          fontWeight: 700,
          px: 1,
          mb: 2,
          height: 24,
          fontSize: "0.7rem",
        }}
      />

      <Typography
        variant="caption"
        sx={{ color: theme.textSecondary, letterSpacing: 0.5 }}
      >
        Mandat : {mandate}
      </Typography>
    </Paper>
  </Grid>
);

export default function Membres() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance.get("/api/membres/leagues");
      console.log(response);
      setMembers(response.data.members || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMembers();
  }, [getMembers]);
  return (
    <Box>
      {loading ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Paper
              key={i}
              sx={{
                p: 3,
                borderRadius: 4,
                width: 400,
                border: "1px solid #eee",
              }}
            >
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ mb: 2, borderRadius: 1 }}
              />
              <Skeleton variant="text" width="70%" height={30} />
              <Stack spacing={2} sx={{ my: 3 }}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Stack>
              <Skeleton
                variant="rectangular"
                height={50}
                sx={{ borderRadius: 3 }}
              />
            </Paper>
          ))}
        </Box>
      ) : members.length > 0 ? (
        <Grid container spacing={3} sx={{ maxWidth: "900px" }}>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              initials={member.initials}
              name={member.name}
              //role={member.role}
              badge={member.badge}
              badgeColor={member.badgeColor}
              mandate={member.mandate}
              avatarBg={member.avatarBg}
            />
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", width: "100%", mt: 4 }}>
          <InfoOutlined sx={{ fontSize: 50, color: "text.disabled" }} />
          <Typography color="text.secondary">Aucun membre trouvé.</Typography>
        </Box>
      )}
    </Box>
  );
}
