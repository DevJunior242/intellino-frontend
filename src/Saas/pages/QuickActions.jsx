import { Box, Typography, ButtonBase } from "@mui/material";
import {
  PersonAddOutlined,
  CalendarMonthOutlined,
  AssignmentOutlined,
  EmojiEventsOutlined,
  GroupOutlined,
  ReceiptLongOutlined,
  EditCalendarOutlined,
  NotificationsActiveOutlined,
} from "@mui/icons-material";

// ─── config des actions par rôle ─────────────────────────────────────────────

const ACTION_PRESETS = {
  admin: [
    {
      key: "add_student",
      label: "Nouvel élève",
      icon: PersonAddOutlined,
      color: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      key: "add_session",
      label: "Nouvelle session",
      icon: CalendarMonthOutlined,
      color: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      key: "add_examen",
      label: "Examen grade",
      icon: EmojiEventsOutlined,
      color: "#BF360C",
      bg: "#FBE9E7",
    },
    {
      key: "members",
      label: "Membres",
      icon: GroupOutlined,
      color: "#6A1B9A",
      bg: "#F3E5F5",
    },
    {
      key: "payments",
      label: "Paiements",
      icon: ReceiptLongOutlined,
      color: "#E65100",
      bg: "#FFF3E0",
    },
    {
      key: "notify",
      label: "Notifier",
      icon: NotificationsActiveOutlined,
      color: "#00695C",
      bg: "#E0F2F1",
    },
  ],
  instructeur: [
    {
      key: "attendance",
      label: "Appel",
      icon: AssignmentOutlined,
      color: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      key: "add_session",
      label: "Nouvelle session",
      icon: CalendarMonthOutlined,
      color: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      key: "members",
      label: "Mes élèves",
      icon: GroupOutlined,
      color: "#6A1B9A",
      bg: "#F3E5F5",
    },
    {
      key: "add_examen",
      label: "Examen grade",
      icon: EmojiEventsOutlined,
      color: "#BF360C",
      bg: "#FBE9E7",
    },
  ],
  secretaire: [
    {
      key: "add_student",
      label: "Nouvel élève",
      icon: PersonAddOutlined,
      color: "#1565C0",
      bg: "#E3F2FD",
    },
    {
      key: "payments",
      label: "Paiements",
      icon: ReceiptLongOutlined,
      color: "#E65100",
      bg: "#FFF3E0",
    },
    {
      key: "attendance",
      label: "Appel",
      icon: AssignmentOutlined,
      color: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      key: "edit_session",
      label: "Modifier session",
      icon: EditCalendarOutlined,
      color: "#00695C",
      bg: "#E0F2F1",
    },
  ],
};

// ─── bouton individuel ────────────────────────────────────────────────────────

function ActionButton({ action, onClick }) {
  const Icon = action.icon;
  return (
    <ButtonBase
      onClick={() => onClick?.(action.key)}
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

/**
 * Props:
 *  - role    : "admin" | "instructeur" | "secretaire"
 *  - actions : optionnel — tableau custom pour surcharger le preset du rôle
 *              [{ key, label, icon, color, bg }]
 *  - onAction: (key: string) => void   callback au clic
 *  - cols    : nombre de colonnes (défaut 3)
 */
function QuickActions({ role = "admin", actions, onAction, cols = 3 }) {
  const items = actions ?? ACTION_PRESETS[role] ?? ACTION_PRESETS.admin;

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
        {items.map((action) => (
          <ActionButton key={action.key} action={action} onClick={onAction} />
        ))}
      </Box>
    </Box>
  );
}

export default QuickActions;
