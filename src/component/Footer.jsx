import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Divider,
  Link,
  Grid,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import { motion } from "framer-motion";
import { tokenTheme } from "../theme";

const footerLinks = [
  {
    title: "Navigation",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Disciplines", href: "/disciplines" },
      { label: "Cours & Horaires", href: "/cours" },
      { label: "Événements", href: "/evenements" },
    ],
  },
  {
    title: "À Propos",
    links: [
      { label: "Notre Histoire", href: "/histoire" },
      { label: "Nos Instructeurs", href: "/instructeurs" },
      { label: "Galerie", href: "/galerie" },
      { label: "Actualités", href: "/actualites" },
    ],
  },
  {
    title: "Rejoindre",
    links: [
      { label: "Inscription", href: "/inscription" },
      { label: "Tarifs & Abonnements", href: "/tarifs" },
      { label: "Essai Gratuit", href: "/essai" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socialLinks = [
  { icon: <FacebookIcon />, href: "#", label: "Facebook" },
  { icon: <InstagramIcon />, href: "#", label: "Instagram" },
  { icon: <YouTubeIcon />, href: "#", label: "YouTube" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Footer() {
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.gray[900] ?? "#0f0f0f",
        color: "#e5e5e5",
        borderTop: `2px solid ${colors.redAccent?.[500] ?? "#c0392b"}`,
        mt: 0,
        pt: 2,
        pb: 30,
        px: { xs: 3, md: 8 },
        position: "relative",
        overflow: "hidden",
        // Subtle background texture
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.015) 40px, rgba(255,255,255,0.015) 41px)",
          pointerEvents: "none",
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* Top section: Brand + Links */}
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand / Logo block */}
          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <SportsKabaddiIcon
                  sx={{
                    fontSize: 34,
                    color: colors.redAccent?.[400] ?? "#e74c3c",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                    letterSpacing: 3,
                    color: "#ffffff",
                    lineHeight: 1,
                  }}
                >
                  ArtsMartiaux
                  <Box
                    component="span"
                    sx={{ color: colors.redAccent?.[400] ?? "#e74c3c" }}
                  >
                    +
                  </Box>
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: colors.gray?.[400] ?? "#888",
                  lineHeight: 1.8,
                  maxWidth: 240,
                  fontSize: "0.82rem",
                }}
              >
                Discipline, respect et dépassement de soi. Rejoignez notre
                communauté et forgez votre caractère par la pratique des arts
                martiaux.
              </Typography>

              {/* Social icons */}
              <Stack direction="row" spacing={0.5} mt={2.5}>
                {socialLinks.map(({ icon, href, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IconButton
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      size="small"
                      sx={{
                        color: colors.gray?.[400] ?? "#888",
                        border: `1px solid ${colors.gray?.[700] ?? "#333"}`,
                        borderRadius: "6px",
                        p: "6px",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          color: "#fff",
                          borderColor: colors.redAccent?.[500] ?? "#c0392b",
                          backgroundColor: `${colors.redAccent?.[900] ?? "#2c0a0a"}`,
                        },
                      }}
                    >
                      {icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* Navigation link columns */}
          {footerLinks.map(({ title, links }) => (
            <Grid item xs={6} sm={4} md={2.5} key={title}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="overline"
                  sx={{
                    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                    letterSpacing: 3,
                    fontSize: "0.78rem",
                    color: colors.redAccent?.[400] ?? "#e74c3c",
                    mb: 1.5,
                    display: "block",
                  }}
                >
                  {title}
                </Typography>
                <Stack spacing={1}>
                  {links.map(({ label, href }) => (
                    <motion.div
                      key={label}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Link
                        href={href}
                        underline="none"
                        sx={{
                          color: colors.gray?.[400] ?? "#888",
                          fontSize: "0.83rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          transition: "color 0.2s ease",
                          "&:hover": {
                            color: "#ffffff",
                          },
                          "&::before": {
                            content: '"›"',
                            opacity: 0,
                            transform: "translateX(-4px)",
                            transition: "all 0.2s ease",
                            color: colors.redAccent?.[400] ?? "#e74c3c",
                          },
                          "&:hover::before": {
                            opacity: 1,
                            transform: "translateX(0)",
                          },
                        }}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Divider */}
        <motion.div variants={itemVariants}>
          <Divider
            sx={{
              borderColor: colors.gray?.[700] ?? "#2a2a2a",
              my: 4,
            }}
          />
        </motion.div>

        {/* Bottom bar */}
        <motion.div variants={itemVariants}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography
              variant="caption"
              sx={{ color: colors.gray?.[500] ?? "#555", fontSize: "0.75rem" }}
            >
              © {year} ArtsMartiaux+ — Tous droits réservés
            </Typography>

            <Stack direction="row" spacing={2}>
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "Confidentialité", href: "/confidentialite" },
                { label: "CGU", href: "/cgu" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  underline="hover"
                  sx={{
                    color: colors.gray?.[500] ?? "#555",
                    fontSize: "0.72rem",
                    transition: "color 0.2s",
                    "&:hover": { color: "#ccc" },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Stack>
          </Stack>
        </motion.div>
      </motion.div>
    </Box>
  );
}

export default Footer;
