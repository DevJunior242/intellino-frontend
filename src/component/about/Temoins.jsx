import { useTheme } from "@emotion/react";
import React from "react";
import { tokens } from "../../theme";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
const items = [
  {
    title: "Toe Abdoul",
    description:
      "Bonjour, je m'appelle Junior, j'ai deja acherter ce produit et je le recommande, il est top, merci beaucoup, je suis tres content",
    img: "https://dev-portfolio-kappa-seven.vercel.app/avatar.png",
  },
  {
    title: "Combari Dieudonne",
    description:
      "Bonjour, je m'appelle Junior, j'ai deja acherter ce produit et je le recommande, il est top, merci beaucoup, je suis tres content",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSShDy_RQOuyva21Dl8GJQJ9xJqbpdWFcYoIg&s",
  },
  {
    title: "Kabore Simon",
    description:
      " Bonjour je m'appelle Junior, j'ai deja acherter ce produit et je le recommande, il est top, merci beaucoup, je suis tres content",
    img: "https://assets.realmadrid.com/is/image/realmadrid/2025%20MASTANTUONO_550x650?$Mobile$&fit=wrap&wid=420",
  },
 
];

function Temoins() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "calc(100vh - 100px)",
        mx: 2,
        gap: 4,

      }}
    >
      <Typography
        variant="h2"
        color={colors.gray[100]}
        fontWeight="bold"
        textAlign="center"
        mt={4}
      >
        Je vous presente quelque temoins
      </Typography>
      <Grid container spacing={2} sx={{ pb: 2, borderRadius: 2, boxShadow: 3 }}>
        {items.map((item, i) => (
          <Grid
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              borderRadius: 2,
              mx:'auto',
            }}
            minHeight={200}
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
            key={i}
          >
            <Card
              sx={{
                width: "500px",

                boxShadow: 3,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <CardMedia
                component={motion.div}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.5 }}
                sx={{ height: 500, objectFit: "cover" }}
                image={item.img}
                title={item.title}
              />

              <Box sx={{ position: "relative" }}>
                <CardContent sx={{ backgroundColor: "background.default" }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{ color: colors.gray[100] }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.gray[100] }}>
                    {item.description}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Temoins;
