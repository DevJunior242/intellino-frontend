import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

const faqData = [
  {
    question: "Comment ajouter un nouvel élève à un club ?",
    answer: "Dans le dashboard admin, allez dans 'Élèves', puis cliquez sur 'Ajouter un élève' et remplissez le formulaire."
  },
  {
    question: "Comment suivre la présence de mon enfant ?",
    answer: "Les parents peuvent se connecter à leur compte et accéder à l'onglet 'Présences' pour voir le suivi de leur enfant."
  },
  {
    question: "Comment créer une session ou un cours ?",
    answer: "Les instructeurs et admins peuvent aller dans 'Sessions', puis 'Créer une session', et sélectionner la date, heure et le cours."
  },
  {
    question: "Puis-je consulter l’historique des présences ?",
    answer: "Oui, toutes les présences sont historisées et consultables dans l'onglet 'Historique' du dashboard."
  },
  {
    question: "Comment gérer les abonnements des élèves ?",
    answer: "Dans la section 'Abonnements', vous pouvez voir les abonnements actifs, ajouter de nouveaux ou modifier les existants."
  },
  {
    question: "Comment changer mes informations de profil ?",
    answer: "Allez dans 'Mon compte' puis 'Profil' pour mettre à jour vos informations personnelles."
  }
];

export default function FAQSection() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: 14, md: 32 } }}>
          Foire aux questions (FAQ)
        </Typography>

        {faqData.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2,backgroundColor: "background.default" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography sx={{ fontWeight: "medium" }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "text.secondary" }}>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </motion.div>
    </Container>
  );
}
