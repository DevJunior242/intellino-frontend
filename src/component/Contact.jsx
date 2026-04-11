import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  Card,
  CardContent,
  TextField,
  Button,
  Container,
  FormHelperText,
  IconButton,
  Stack,
} from "@mui/material";
import { tokenTheme } from "../theme";
import { Instance } from "../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "./ErrorGlobal";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
function Contact() {
  const colors = tokenTheme(useTheme().palette.mode);

  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const handeAddContact = async (e) => {
    e.preventDefault();
    setError({});

    try {
      const res = await Instance.post("api/contact", {
        title: title,
        message: message,
      });
      console.log(res);
      if (res.data.success) {
        setSuccess(res.data.message);
        setError({});
      } else {
        setError({ general: [res.data.message] });
        setSuccess(false);
      }
    } catch (error) {
      console.log(error);
      ErrorGlobal({ error, setError });
      setTimeout(() => {
        setError({});
      }, 3000);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "calc(100vh - 100px)",
        mt: 4,
        mx: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 14, md: 32 },
              fontWeight: "bold",
            }}
          >
            Contactez nous, nous sommes disponibles pour tous les besoins
            d'informations
          </Typography>

          <Paper elevation={3}>
            <Box
              component="img"
              src="https://fadd820558.cbaul-cdnwnd.com/f69949b1ff54c822a030b7842403b865/200000005-d02dbd127c/contact.jpg"
              alt=""
              sx={{
                width: { xs: "380px", md: "auto" },
                display: "block",
                maxWidth: "100%",
                height: "auto",
                borderRadius: 2,
              }}
            />
          </Paper>
        </Box>
        <Container maxWidth="sm">
          <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Contactez nous
            </Typography>
            {error.general && (
              <Typography textAlign={"center"} color={"red"}>
                {error.general}
              </Typography>
            )}
            {success && (
              <Typography textAlign={"center"} color={"green"}>
                {success}
              </Typography>
            )}
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton color="primary">
                  <PhoneIcon />
                </IconButton>
                <Typography variant="h6">+226 57 57 57 70</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton color="success">
                  <WhatsAppIcon />
                </IconButton>
                <Typography variant="h6">+226 57 57 57 70</Typography>
              </Box>
            </Stack>

            <form onSubmit={handeAddContact}>
              <TextField
                error={hasError("title")}
                type="text"
                id="outlined-basic"
                label="title"
                fullWidth
                variant="outlined"
                size="small"
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {hasError("title") && (
                <FormHelperText error>{getError("title")}</FormHelperText>
              )}
              <TextField
                error={hasError("message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                id="outlined-basic"
                label="Message"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                size="small"
                margin="normal"
                required
              />
              {hasError("message") && (
                <FormHelperText error>{getError("message")}</FormHelperText>
              )}
              <Button type="submit" variant="contained" size="small">
                Envoyer
              </Button>
            </form>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Contact;
