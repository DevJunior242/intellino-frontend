import React from "react";
import { Container, Typography, Box, Divider, Paper } from "@mui/material";
import { motion } from "framer-motion";

const LegalLayout = ({ title, subtitle, children }) => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: "primary.main",
                fontSize: { xs: 14, md: 32 },
              }}
            >
              {title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Dernière mise à jour : {new Date().toLocaleDateString()}
            </Typography>
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  fontStyle: "italic",
                  fontSize: { xs: 14, md: 16 },
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Divider sx={{ mb: 4 }} />
          <Box
            sx={{
              "& h2": {
                mt: 4,
                mb: 2,
                fontSize: { xs: 14, md: "1.5rem" },
                fontWeight: 600,
                color: "text.primary",
              },
              "& p": { mb: 2, lineHeight: 1.7, color: "text.secondary" },
              "& ul": { mb: 2, pl: 4 },
            }}
          >
            {children}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LegalLayout;
