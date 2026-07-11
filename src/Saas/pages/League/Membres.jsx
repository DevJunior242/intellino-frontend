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

import { Instance } from "../../../Api/Axios";
import { InfoOutlined } from "@mui/icons-material";
import ConfigSkeleton from "../ConfigSkeleton";
import { UseAuth } from "../../../Api/AuthContext";

const MemberCard = ({
  initials,
  name,
  role,
  badge,
  badgeColor,
  member,
  avatarBg,
}) => {
  return (
    <Grid item xs={12} md={6}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          border: "1px solid",
          borderColor: "divider",
          transition: "transform 0.2s, background-color 0.2s",
          "&:hover": { transform: "translateY(-4px)", bgcolor: "action.hover" },
          maxWidth: "350px",
          margin: "0 auto",
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

        {/* Nom : limite la largeur et gère le débordement */}
        <Typography
          variant="h6"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            mb: 0.5,
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "250px",
          }}
        >
          {name}
        </Typography>

        {/* Rôle : limite aussi la largeur */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2,
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "250px",
          }}
        >
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

        {member.mandate && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1, display: "block", mt: 1 }}
          >
            Mandat : {member.mandate}
          </Typography>
        )}
      </Paper>
    </Grid>
  );
};
export default function Membres({ members, loading }) {
  return (
    <Box sx={{ px: 2 }}>
      {loading ? (
        <ConfigSkeleton />
      ) : members.length > 0 ? (
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {members.map((member) => (
            <MemberCard
              key={member.id}
              initials={member.initials}
              name={member.name}
              badge={member.badge}
              badgeColor={member.badgeColor}
              mandate={member.mandate}
              avatarBg={member.avatarBg}
              member={member}
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
