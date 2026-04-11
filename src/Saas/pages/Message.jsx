 import { Alert, Stack } from "@mui/material";

function Message({ text, type }) {
  if (!text) return null;
  return (
    <Stack sx={{ width: "100%" }} spacing={2}>
      <Alert severity={type}>{text}</Alert>
    </Stack>
  );
}

export default Message;
