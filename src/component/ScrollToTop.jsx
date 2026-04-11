import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Fab, useTheme, Zoom } from "@mui/material";
import React, { useEffect, useState } from "react";
import { tokenTheme } from "../theme";

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ScrollToTTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <Zoom in={visible}>
      <Fab
        onClick={ScrollToTTop}
        aria-label="scroll back to top"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          color: colors.gray[100],
          backgroundColor: colors.primary[500],
          "&:hover": { backgroundColor: colors.indigo[700] },
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}

export default ScrollToTop;
