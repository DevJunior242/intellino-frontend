import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { UseAuth } from "../Api/AuthContext";
// import ClubCount from "../Saas/pages/ClubCount";
import EastIcon from "@mui/icons-material/East";
import { grey, indigo } from "@mui/material/colors";
/* ─── DATA ─────────────────────────────────────────────────── */

const features = [
  {
    icon: "🥋",
    title: "Apprentissage Simplifié",
    desc: "Suivez les cours, notes et progressions en temps réel depuis n'importe quel appareil.",
    color: "#ff6900",
  },
  {
    icon: "📊",
    title: "Suivi des Élèves",
    desc: "Accédez aux emplois du temps, aux performances et aux historiques de chaque élève.",
    color: "#ff4081",
  },
  // {
  //   icon: "🔔",
  //   title: "Communication Directe",
  //   desc: "Recevez annonces, notifications et messages instantanément sans quitter la plateforme.",
  //   color: "#7c3aed",
  // },
  // {
  //   icon: "🏆",
  //   title: "Gestion des Compétitions",
  //   desc: "Organisez tournois, examens et ligues avec un calendrier intégré et des classements automatiques.",
  //   color: "#059669",
  // },
  {
    icon: "💳",
    title: "Abonnements Flexibles",
    desc: "Gérez les paiements et abonnements de vos membres directement depuis le tableau de bord.",
    color: "#d97706",
  },
  {
    icon: "📱",
    title: "100% Mobile",
    desc: "Interface responsive optimisée pour tous les écrans, du smartphone au grand écran.",
    color: "#0891b2",
  },
];

const stats = [
  { value: 100, suffix: "+", label: "Clubs inscrits" },
  // { value: 12000, suffix: "+", label: "Élèves actifs" },
  { value: 98, suffix: "%", label: "Satisfaction" },
  { value: 3, suffix: "x", label: "Plus rapide" },
];

const testimonials = [
  {
    name: "Maitre Hermane OUEDRAOGO",
    role: "Responsable du club SINAI Club et President DE LA LIGUE DU Centre",
    avatar: "K",
    text: "ArtsMartiaux+ a révolutionné la gestion de mon dojo. Les examens et les présences sont désormais automatisés.",
    bg: "#ff6900",
  },
  {
    name: "Maitre Corneil MARE ",
    role: "Responsable du club DAKOUPA Club et DTN DE LA FEDERATION BURKINABE DE KARATE DO",
    avatar: "M",
    text: "L'interface est intuitive et mes élèves adorent suivre leurs progrès en temps réel.",
    bg: "#7c3aed",
  },
  {
    name: "Maitre Judicael GOUENNE",
    role: "Responsable du club ELSHADAI Club DE MANGA",
    avatar: "M",
    text: "La gestion des compétitions n'a jamais été aussi simple. Je recommande vivement !",
    bg: "#059669",
  },
];

/* ─── ANIMATED COUNTER ─────────────────────────────────────── */

function AnimatedCounter({ target, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── SECTION WRAPPER ───────────────────────────────────────── */

const Section = ({ children, sx = {} }) => (
  <Box
    component={motion.section}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    sx={{ width: "100%", ...sx }}
  >
    {children}
  </Box>
);

/* ─── MAIN ──────────────────────────────────────────────────── */

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        bgcolor: "#0a0a0a",
        color: "white",
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────── */}
      <Box
        ref={heroRef}
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          px: { xs: 3, md: 8 },
          py: { xs: 8, md: 0 },
        }}
      >
        {/* Background glow */}
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,105,0,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,64,129,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        {/* Text */}
        <motion.div
          style={{ flex: 1, zIndex: 1 }}
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Chip
            label="🚀 Plateforme SaaS N°1 des Arts Martiaux"
            sx={{
              bgcolor: "rgba(255,105,0,0.15)",
              color: "#ff6900",
              border: "1px solid rgba(255,105,0,0.3)",
              mb: 3,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.4rem", md: "3.8rem" },
              lineHeight: 1.1,
              letterSpacing: "-1px",
              mb: 3,
            }}
          >
            Gérez votre club
            <Box
              component="span"
              sx={{
                display: "block",
                background: "linear-gradient(90deg, #ff6900, #ff4081)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              d'arts martiaux
            </Box>
            sans effort.
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
              color: "rgba(255,255,255,0.6)",
              maxWidth: 480,
              lineHeight: 1.7,
              mb: 5,
            }}
          >
            Compétitions, examens, présences, abonnements — tout centralisé dans
            une plateforme pensée pour les sensei modernes.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              component={Link}
              to="/club/store"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.8,
                fontWeight: 700,
                fontSize: "1rem",
                borderRadius: "50px",
                background: "linear-gradient(135deg, #ff6900, #ff4081)",
                boxShadow: "0 8px 32px rgba(255,105,0,0.35)",
                textTransform: "none",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(255,105,0,0.5)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Créer un club
              <EastIcon sx={{ ml: 2, fontSize: "1.2rem" }} />
            </Button>

            {/* <Button
              component={Link}
              to="/league/store"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.8,
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "50px",
                borderColor: "rgba(255,255,255,0.2)",
                color: "white",
                textTransform: "none",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  borderColor: "#ff6900",
                  bgcolor: "rgba(255,105,0,0.08)",
                },
                transition: "all 0.3s ease",
              }}
            >
              ligue
            </Button> */}
          </Box>
        </motion.div>

        {/* Hero image */}
        {!isMobile && (
          <motion.div
            style={{ flex: 1, zIndex: 1, y: heroY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2 }}
          >
            <Box
              sx={{
                width: "100%",
                height: 440,
                borderRadius: "24px",
                backgroundImage:
                  "url('https://www.greatersudbury.ca/sites/sudburyen/cache/file/25E33F1B-FD30-3B9C-1AAA4B6692E55EFE_carouselimage.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                ml: 6,
                position: "relative",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.07), 0 32px 64px rgba(0,0,0,0.6)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "24px",
                  background:
                    "linear-gradient(135deg, rgba(255,105,0,0.15) 0%, transparent 60%)",
                },
              }}
            />
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            translateX: "-50%",
          }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <Box
            sx={{
              width: 28,
              height: 44,
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: 1,
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 10,
                bgcolor: "#ff6900",
                borderRadius: "2px",
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* ── STATS ────────────────────────────────────────────── */}
      <Section>
        <Box
          sx={{
            py: 6,
            px: { xs: 3, md: 8 },
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background:
              "linear-gradient(90deg, rgba(255,105,0,0.05) 0%, rgba(255,64,129,0.05) 100%)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            gap: 4,
          }}
        >
          {/* <ClubCount /> */}

          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: { xs: "2.2rem", md: "3rem" },
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #ff6900, #ff4081)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.9rem",
                    mt: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <Section sx={{ py: { xs: 8, md: 14 }, px: { xs: 3, md: 8 } }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            sx={{
              color: "#ff6900",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              mb: 2,
            }}
          >
            Fonctionnalités
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Tout ce dont vous avez besoin
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              mt: 2,
              maxWidth: 540,
              mx: "auto",
              fontSize: "1.05rem",
              lineHeight: 1.7,
            }}
          >
            Une suite complète d'outils pour gérer, former et développer votre
            club d'arts martiaux.
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {features.map((f, i) => (
            <Grid
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mx: "auto",
                borderRadius: 2,
              }}
              minHeight={200}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={i}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px",
                    cursor: "default",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.06)",
                      borderColor: f.color + "44",
                      boxShadow: `0 16px 48px ${f.color}18`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      bgcolor: f.color + "22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      mb: 3,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: 14, md: 16 },
                      mb: 1.5,
                      color: "white !important",
                    }}
                  >
                    {f.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {f.desc}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <Section
        sx={{
          py: { xs: 8, md: 14 },
          px: { xs: 3, md: 8 },
          background:
            "linear-gradient(180deg, transparent, rgba(255,105,0,0.04), transparent)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            sx={{
              color: "#ff6900",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              mb: 2,
            }}
          >
            Témoignages
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              letterSpacing: "-0.5px",
            }}
          >
            Ils nous font confiance
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {testimonials.map((t, i) => (
            <Grid
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
                mx: "auto",
                borderRadius: 2,
              }}
              minHeight={200}
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={i}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.03)",
                    borderRadius: 2,
                    borderLeft: `4px solid ${t.bg}`,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '"\u201C"',
                      position: "absolute",
                      top: 8,
                      left: 16,
                      fontSize: "5rem",
                      lineHeight: 1,
                      color: t.bg + "30",
                      fontFamily: "Georgia, serif",
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.95rem",
                      lineHeight: 1.8,
                      mb: 4,
                      fontStyle: "italic",
                    }}
                  >
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: t.bg,
                        fontWeight: 700,
                        width: 44,
                        height: 44,
                      }}
                    >
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: 12, md: 14 },
                          color: grey[100],
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {t.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <Section>
        <Box
          sx={{
            mx: { xs: 2, md: 8 },
            mb: 10,
            p: { xs: 5, md: 10 },
            borderRadius: "28px",
            background: "linear-gradient(135deg, #ff6900 0%, #ff4081 100%)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -80,
              left: -40,
              width: 280,
              height: 280,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.05)",
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              position: "relative",
              zIndex: 1,
            }}
          >
            Prêt à transformer votre club ?
          </Typography>
          <Typography
            sx={{
              mt: 2,
              mb: 5,
              opacity: 0.85,
              fontSize: { xs: "1rem", md: "1.2rem" },
              position: "relative",
              zIndex: 1,
              maxWidth: 480,
              mx: "auto",
            }}
          >
            Rejoignez plus de 500 clubs qui font confiance à ArtsMartiaux+ pour
            gérer leur quotidien.
          </Typography>
          <Button
            component={Link}
            to="/club/store"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontWeight: 700,
              fontSize: "1.05rem",
              borderRadius: "50px",
              bgcolor: "white",
              color: "#ff6900",
              textTransform: "none",
              position: "relative",
              zIndex: 1,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.92)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Commencer gratuitement
            <EastIcon sx={{ ml: 2, fontSize: "1.2rem" }} />
          </Button>
        </Box>
      </Section>
    </Box>
  );
}

export default HomePage;
