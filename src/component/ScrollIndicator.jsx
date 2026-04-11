import { motion, useScroll } from "motion/react";
 import { Box, useTheme } from "@mui/material";
import React from "react";
import { tokenTheme } from "../theme";

function ScrollIndicator() {
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);

  const { scrollYProgress } = useScroll();

  return (
    <>
      <Box
        id="scroll-indicator"
        component={motion.div}
        style={{
          scaleX: scrollYProgress,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          originX: 0,
          backgroundColor: colors.orange[600],
        }}
      />
    </>
  );
}

export default ScrollIndicator;
