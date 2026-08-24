import React, { useMemo, useState } from "react";
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ApercuTab from "./ApercuTab";
import EncaisserTab from "./EncaisserTab";
import TarifsTab from "./TarifsTab";
import DettesTab from "./DettesTab";
import HistoriqueTab from "./HistoriqueTab";
import PaymentMethodIndex from "../Paiement/Paymentmethodindex";
import MonAbonnement from "../MonAbonnement";
import CreditCardIcon from "@mui/icons-material/CreditCard";

const TABS = [
  { value: "apercu", label: "Aperçu", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { value: "encaisser", label: "Encaisser", icon: <PaymentsOutlinedIcon fontSize="small" /> },
  { value: "tarifs", label: "Tarifs", icon: <TuneOutlinedIcon fontSize="small" /> },
  { value: "dettes", label: "Dettes", icon: <MoneyOffOutlinedIcon fontSize="small" /> },
  { value: "historique", label: "Factures", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { value: "moyens", label: "Moyens de paiement", icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { value: "abonnement", label: "Mon abonnement", icon: <CreditCardIcon fontSize="small" /> },
];

export default function ClubComptabilite() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = TABS.some((t) => t.value === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "apercu";
  const [tab, setTab] = useState(initialTab);
  const [prefill, setPrefill] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const goTo = (value, opts = {}) => {
    setTab(value);
    setSearchParams({ tab: value }, { replace: true });
    if (opts.prefill !== undefined) setPrefill(opts.prefill);
  };

  const handleSolder = (debt) => {
    goTo("encaisser", {
      prefill: {
        student: debt.student,
        pricing_plan_id: debt.pricing_plan_id,
        amount_remaining: debt.balance,
      },
    });
  };

  const handleEncaissementDone = () => {
    setPrefill(null);
    setRefreshKey((k) => k + 1);
    goTo("apercu");
  };

  const content = useMemo(() => {
    switch (tab) {
      case "encaisser":
        return <EncaisserTab prefill={prefill} onDone={handleEncaissementDone} />;
      case "tarifs":
        return <TarifsTab />;
      case "dettes":
        return <DettesTab key={refreshKey} onSolder={handleSolder} />;
      case "historique":
        return <HistoriqueTab key={refreshKey} />;
      case "moyens":
        return <PaymentMethodIndex />;
      case "abonnement":
        return <MonAbonnement />;
      case "apercu":
      default:
        return <ApercuTab key={refreshKey} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, prefill, refreshKey]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <AccountBalanceWalletOutlinedIcon fontSize="large" color="primary" />
        Comptabilité
      </Typography>

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3, bgcolor: "background.paper" }}
      >
        <Tabs
          value={tab}
          onChange={(e, value) => goTo(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 1 }}
        >
          {TABS.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={t.label}
              icon={t.icon}
              iconPosition="start"
              sx={{ textTransform: "none", minHeight: 56 }}
            />
          ))}
        </Tabs>
      </Paper>

      {content}
    </Box>
  );
}
