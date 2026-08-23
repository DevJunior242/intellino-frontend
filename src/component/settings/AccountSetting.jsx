import React, { useMemo, useState } from "react";
import { Box, Tabs, Tab, Typography, Container } from "@mui/material";
import Profile from "../../Saas/pages/Profile";
import UpdatePassword from "./UpdatePassword";
import TwoFactorSettings from "./TwoFactorSettings";
import DeleAccount from "./DeleAccount";
import StoreSaison from "./StoreSaison";
import OrganisationSettings from "./OrganisationSettings";
import { UseAuth } from "../../Api/AuthContext";

const AccountSettings = () => {
  const [tab, setTab] = useState("profil");

  const { activeRole, activeType, currentClub, currentLeague } = UseAuth();

  const authorized = activeRole?.toLowerCase() === "admin";

  // Un club rattaché à une ligue, ou une ligue rattachée à une fédération,
  // hérite automatiquement de la saison de son parent (voir
  // ResolvesActiveSaison côté backend) — seule l'entité indépendante peut
  // gérer ses propres saisons.
  const isIndependentOrg =
    activeType === "Club"
      ? !currentClub?.league_id
      : activeType === "Ligue"
        ? !currentLeague?.federation_id
        : true; // Federation : toujours indépendante

  const authorizedToAccessSaisons = authorized && isIndependentOrg;

  const tabs = useMemo(
    () =>
      [
        { value: "profil", label: "Profil Public" },
        { value: "securite", label: "Sécurité & Réglages" },
        authorized &&
          activeType && { value: "organisation", label: "Organisation" },
        authorizedToAccessSaisons && { value: "saisons", label: "Saisons" },
      ].filter(Boolean),
    [authorized, activeType, authorizedToAccessSaisons],
  );

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mon Compte
      </Typography>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          backgroundColor: "#020224",
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="scrollable tabs"
          sx={{
            width: "100%",
            "& .MuiTabs-flexContainer": {
              justifyContent: "center",
            },
            "& .MuiTabs-indicator": { height: 3 },
            "& .MuiTab-root": {
              color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#fff",
            },
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {tab === "profil" && (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Profile />
        </Box>
      )}

      {tab === "securite" && (
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            gap: 3,
            pt: 5,
            minHeight: "100px",
            width: "100%",
          }}
        >
          <UpdatePassword />
          <TwoFactorSettings />
          <DeleAccount />
        </Container>
      )}

      {tab === "organisation" && authorized && activeType && (
        <Box sx={{ p: 2 }}>
          <OrganisationSettings />
        </Box>
      )}

      {tab === "saisons" && authorizedToAccessSaisons && (
        <Box sx={{ p: 2 }}>
          <StoreSaison />
        </Box>
      )}
    </Box>
  );
};

export default AccountSettings;
