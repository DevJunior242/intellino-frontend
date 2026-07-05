import { Business, VerifiedUser, Star } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Tooltip,
  Container,
  Paper,
  Button,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";

import { UseAuth } from "../../Api/AuthContext";
import { deepPurple } from "@mui/material/colors";

const MeClub = () => {
  const { auth } = UseAuth();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        justifyContent: "center",
        pt: 5,
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          p: 4,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="h6">Clubs suivis</Typography>
        <List sx={{ width: "100%", borderRadius: 2 }}>
          {auth?.memberships?.map((membership) => (
            <ListItem
              key={membership.id}
              sx={{
                border: "1px solid #f0f0f0",
                borderRadius: 2,
                mb: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ bgcolor: deepPurple[100], color: deepPurple[500] }}
                >
                  <Business />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<strong>{membership?.name}</strong>}
                secondary={
                  <Box
                    component="span"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <VerifiedUser
                      sx={{ fontSize: 14, color: "primary.main" }}
                    />
                    {membership.role.replace("_", " ")}
                  </Box>
                }
              />

              {auth?.user?.current_club_id === membership?.id && (
                <Tooltip title="Club Actif">
                  <Star color="warning" />
                </Tooltip>
              )}
            </ListItem>
          ))}
        </List>
        <Button variant="text" sx={{ mt: 2 }}>
          + Rejoindre un autre club
        </Button>
      </Paper>
    </Container>
  );
};

export default MeClub;
