import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PaymentsIcon from "@mui/icons-material/Payments";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import { Instance } from "../../Api/Axios";

const LICENCE_LABELS = {
  0: { label: "En attente", color: "warning" },
  1: { label: "Payée", color: "info" },
  2: { label: "Validée", color: "success" },
};

const EXAMEN_CANDIDAT_LABELS = {
  0: { label: "Inscrit", color: "info" },
  1: { label: "Absent", color: "default" },
  2: { label: "Évalué", color: "success" },
};

function WidgetCard({ title, icon, loading, children }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        children
      )}
    </Paper>
  );
}

function StudentOverviewWidgets() {
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [licence, setLicence] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [parents, setParents] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [att, pay, lic, exa, club, par] = await Promise.allSettled([
      Instance.get("/api/attendances"),
      Instance.get("/api/payments"),
      Instance.get("/api/licences/mes-licences-etudiant"),
      Instance.get("/api/examens/mes-examens"),
      Instance.get("/api/students/mon-club"),
      Instance.get("/api/students/mes-parents"),
    ]);

    setAttendances(
      att.status === "fulfilled" ? att.value.data.attendances?.data || [] : [],
    );
    setPaiements(
      pay.status === "fulfilled" ? pay.value.data.paiements?.data || [] : [],
    );
    setLicence(
      lic.status === "fulfilled" ? lic.value.data.data?.[0] || null : null,
    );
    setCandidatures(
      exa.status === "fulfilled" ? exa.value.data.candidatures || [] : [],
    );
    setResultats(
      exa.status === "fulfilled" ? exa.value.data.resultats || [] : [],
    );
    setClubs(club.status === "fulfilled" ? club.value.data.clubs || [] : []);
    setParents(
      par.status === "fulfilled" ? par.value.data.parents || [] : [],
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalPresences = attendances.filter(
    (a) => a.status === "present",
  ).length;
  const tauxPresence =
    attendances.length > 0
      ? Math.round((totalPresences / attendances.length) * 100)
      : null;

  const impayes = paiements.filter((p) => Number(p.balance) > 0).length;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Mon espace
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetCard
            title="Assiduité"
            icon={<EventAvailableIcon color="primary" />}
            loading={loading}
          >
            {attendances.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucune présence enregistrée
              </Typography>
            ) : (
              <>
                <Typography variant="h4" fontWeight="bold">
                  {tauxPresence}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalPresences} présence(s) sur les {attendances.length}{" "}
                  dernières séances
                </Typography>
              </>
            )}
          </WidgetCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <WidgetCard
            title="Paiements"
            icon={<PaymentsIcon color="primary" />}
            loading={loading}
          >
            {paiements.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucun paiement enregistré
              </Typography>
            ) : (
              <>
                <Chip
                  label={impayes > 0 ? `${impayes} impayé(s)` : "Tout est à jour"}
                  color={impayes > 0 ? "warning" : "success"}
                  size="small"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {paiements.length} paiement(s) au total
                </Typography>
              </>
            )}
          </WidgetCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <WidgetCard
            title="Licence"
            icon={<BadgeIcon color="primary" />}
            loading={loading}
          >
            {!licence ? (
              <Typography variant="body2" color="text.secondary">
                Aucune licence enregistrée
              </Typography>
            ) : (
              <>
                <Chip
                  label={LICENCE_LABELS[licence.status]?.label || "Inconnue"}
                  color={LICENCE_LABELS[licence.status]?.color || "default"}
                  size="small"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {licence.numero || "N° en attente"}
                  {licence.saison?.libele ? ` — ${licence.saison.libele}` : ""}
                </Typography>
              </>
            )}
          </WidgetCard>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <WidgetCard
            title="Examens de grade"
            icon={<SchoolIcon color="primary" />}
            loading={loading}
          >
            {candidatures.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucune candidature à un examen
              </Typography>
            ) : (
              <List dense disablePadding>
                {candidatures.slice(0, 4).map((c) => (
                  <ListItem key={c.id} disableGutters>
                    <ListItemText
                      primary={`${c.examen?.current_grade?.name || "?"} → ${c.examen?.next_grade?.name || "?"}`}
                      secondary={
                        c.examen?.start_date
                          ? new Date(c.examen.start_date).toLocaleDateString(
                              "fr-FR",
                            )
                          : ""
                      }
                    />
                    <Chip
                      label={EXAMEN_CANDIDAT_LABELS[c.status]?.label || "—"}
                      color={EXAMEN_CANDIDAT_LABELS[c.status]?.color || "default"}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {resultats.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Dernier résultat : {resultats[0].decision || "en délibération"}
              </Typography>
            )}
          </WidgetCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <WidgetCard
            title="Mon club"
            icon={<GroupsIcon color="primary" />}
            loading={loading}
          >
            {clubs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucun club rattaché
              </Typography>
            ) : (
              <List dense disablePadding>
                {clubs.map((c) => (
                  <ListItem key={c.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar src={c.logo} alt={c.name}>
                        {c.name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={c.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </WidgetCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <WidgetCard
            title="Mes parents"
            icon={<FamilyRestroomIcon color="primary" />}
            loading={loading}
          >
            {parents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucun parent rattaché
              </Typography>
            ) : (
              <List dense disablePadding>
                {parents.map((p) => (
                  <ListItem key={p.id} disableGutters>
                    <ListItemText
                      primary={p.user?.fullname || "—"}
                      secondary={p.user?.phone || p.user?.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </WidgetCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentOverviewWidgets;
