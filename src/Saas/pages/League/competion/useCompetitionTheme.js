import { alpha, useTheme } from "@mui/material/styles";

// Couleurs dérivées du thème actif (au lieu des valeurs violettes fixes
// #6c63ff/#0e1118/#141720/#1e2433/#dde1f0/#636b88 utilisées dans tout le
// dossier competion/), pour s'adapter au clair/sombre des dashboards
// ligue/fédération.
export default function useCompetitionTheme() {
  const t = useTheme();
  const accent = t.palette.primary.main;
  const success = t.palette.success.main;
  const warning = t.palette.warning.main;
  const danger = t.palette.error.main;
  return {
    bg: t.palette.background.default,
    surface: t.palette.background.paper,
    surfaceHigh: t.palette.background.paper,
    border: t.palette.divider,
    text: t.palette.text.primary,
    textMuted: t.palette.text.secondary,
    textFaint: t.palette.text.disabled,
    accent,
    accentDark: t.palette.primary.dark,
    accentDim: alpha(accent, 0.12),
    accentContrastText: t.palette.primary.contrastText,
    success,
    successDim: alpha(success, 0.1),
    warning,
    warningDim: alpha(warning, 0.1),
    danger,
    dangerDim: alpha(danger, 0.1),
  };
}
