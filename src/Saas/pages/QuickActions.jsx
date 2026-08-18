import { Box, Typography, ButtonBase } from "@mui/material";
import {
  PersonAddOutlined,
  CalendarMonthOutlined,
  EmojiEventsOutlined,
  GroupOutlined,
  ReceiptLongOutlined,
  AccountTreeOutlined,
  CategoryOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";

// ─── config des actions ───────────────────────────────────────────────────────
// `roles` utilise les vraies valeurs d'`activeRole` (admin, instructeur,
// secretaire, arbitre, super_admin) — pas de rôles fictifs type "admin_club".
// `orgTypes` restreint chaque action au bon contexte (Club/Ligue/Federation),
// vu qu'un même compte "admin" peut être actif sur l'un ou l'autre.
const ACTIONS = [
  {
    key: "add_student",
    label: "Nouvel élève",
    to: "/dashboard/student/list",
    icon: PersonAddOutlined,
    color: "#1565C0",
    bg: "#E3F2FD",
    orgTypes: ["Club"],
    roles: ["admin", "super_admin", "instructeur", "secretaire"],
  },
  {
    key: "add_session",
    label: "Nouvelle session",
    to: "/dashboard/session/list",
    icon: CalendarMonthOutlined,
    color: "#2E7D32",
    bg: "#E8F5E9",
    orgTypes: ["Club"],
    roles: ["admin", "super_admin", "instructeur"],
  },
  {
    key: "members",
    label: "Membres",
    to: "/dashboard/members",
    icon: GroupOutlined,
    color: "#6A1B9A",
    bg: "#F3E5F5",
    orgTypes: ["Club"],
    roles: ["admin", "super_admin", "instructeur", "secretaire"],
  },
  {
    key: "payments",
    label: "Paiements",
    to: "/dashboard/comptabilite?tab=encaisser",
    icon: ReceiptLongOutlined,
    color: "#E65100",
    bg: "#FFF3E0",
    orgTypes: ["Club"],
    roles: ["admin", "super_admin", "secretaire"],
  },
  {
    key: "add_examen_club",
    label: "Examen grade",
    to: "/dashboard/examen",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    orgTypes: ["Club"],
    roles: ["admin", "super_admin", "instructeur"],
  },
  {
    key: "add_examen_league",
    label: "Examen grade",
    to: "/dashboard/league/examen",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    orgTypes: ["Ligue"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "add_examen_federation",
    label: "Examen grade",
    to: "/dashboard/federation/examen",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    orgTypes: ["Federation"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "competitions_league",
    label: "Compétitions",
    to: "/dashboard/league/competitions",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    orgTypes: ["Ligue"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "league_clubs",
    label: "Clubs",
    to: "/dashboard/league/clubs",
    icon: GroupOutlined,
    color: "#6A1B9A",
    bg: "#F3E5F5",
    orgTypes: ["Ligue"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "affiliations_federation",
    label: "Affiliations",
    to: "/dashboard/federation/affiliations",
    icon: GroupOutlined,
    color: "#6A1B9A",
    bg: "#F3E5F5",
    orgTypes: ["Federation"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "structure_federation",
    label: "Structure",
    to: "/dashboard/federation/structure",
    icon: AccountTreeOutlined,
    color: "#00695C",
    bg: "#E0F2F1",
    orgTypes: ["Federation"],
    roles: ["admin", "super_admin"],
  },
  {
    key: "categories_federation",
    label: "Catégories",
    to: "/dashboard/federation/categories",
    icon: CategoryOutlined,
    color: "#4527A0",
    bg: "#EDE7F6",
    orgTypes: ["Federation"],
    roles: ["admin", "super_admin"],
  },
];

// ─── bouton individuel ────────────────────────────────────────────────────────
function ActionButton({ action }) {
  const navigate = useNavigate();
  const Icon = action.icon;

  return (
    <ButtonBase
      onClick={() => navigate(action.to)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.75,
        p: 1.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.default",
        width: "100%",
        transition: "all 0.15s",
        "&:hover": {
          bgcolor: action.bg,
          borderColor: "transparent",
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        "&:active": { transform: "translateY(0)" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: action.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 18, color: action.color }} />
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "text.secondary",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {action.label}
      </Typography>
    </ButtonBase>
  );
}

// ─── composant principal ──────────────────────────────────────────────────────
function QuickActions({ cols = 3 }) {
  const { activeRole, activeType } = UseAuth();

  // Filtre les actions accessibles au rôle ET au type d'organisation actifs
  const visibleActions = ACTIONS.filter(
    (action) =>
      action.roles.includes(activeRole) &&
      action.orgTypes.includes(activeType),
  );

  if (visibleActions.length === 0) return null;

  return (
    <Box>
      <Typography
        sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", mb: 1.5 }}
      >
        Actions rapides
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 1,
        }}
      >
        {visibleActions.map((action) => (
          <ActionButton key={action.key} action={action} />
        ))}
      </Box>
    </Box>
  );
}

export default QuickActions;
