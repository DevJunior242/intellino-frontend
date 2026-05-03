import { Box, Typography, ButtonBase } from "@mui/material";
import {
  PersonAddOutlined,
  CalendarMonthOutlined,
  EmojiEventsOutlined,
  GroupOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../Api/AuthContext";

// ─── config des actions ───────────────────────────────────────────────────────
const ACTIONS = [
  {
    key: "add_student",
    label: "Nouvel élève",
    to: "/dashboard/student/list",
    icon: PersonAddOutlined,
    color: "#1565C0",
    bg: "#E3F2FD",
    roles: ["admin_club", "instructeur", "secretaire"],
  },
  {
    key: "add_session",
    label: "Nouvelle session",
    to: "/dashboard/session/list",
    icon: CalendarMonthOutlined,
    color: "#2E7D32",
    bg: "#E8F5E9",
    roles: ["admin_club", "instructeur"],
  },
  {
    key: "add_examen",
    label: "Examen grade",
    to: "/examen/store",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    roles: ["admin_club", "instructeur", "admin_league"],
  },
  {
    key: "competitions",
    label: "Compétitions",
    to: "/dashboard/competitions",
    icon: EmojiEventsOutlined,
    color: "#BF360C",
    bg: "#FBE9E7",
    roles: ["admin_league"],
  },

  {
    key: "members",
    label: "Membres",
    to: "/dashboard/members",
    icon: GroupOutlined,
    color: "#6A1B9A",
    bg: "#F3E5F5",
    roles: ["admin_club", "instructeur", "secretaire"],
  },
  {
    key: "payments",
    label: "Paiements",
    to: "/dashboard/payment/store",
    icon: ReceiptLongOutlined,
    color: "#E65100",
    bg: "#FFF3E0",
    roles: ["admin_club", "secretaire"],
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
  const { activeRole } = UseAuth();

  // Filtre les actions accessibles au rôle actif
  const visibleActions = ACTIONS.filter((action) =>
    action.roles.includes(activeRole),
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
