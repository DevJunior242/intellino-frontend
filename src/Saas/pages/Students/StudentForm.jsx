import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { differenceInYears } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Instance } from "../../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import ErrorGlobal from "../../../component/ErrorGlobal";
import dayjs from "dayjs";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";
import ConfigSkeleton from "../ConfigSkeleton";
const StudentForm = () => {
  const [createAccount, setCreateAccount] = useState(false);
  const [isOwnResponsible, setIsOwnResponsible] = useState(false);
  const [birthdate, setbirthdate] = useState(null);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [studentParent, setStudentParent] = useState([]);
  const [success, setSuccess] = useState("");
  const [selectParent, setSelectParent] = useState(null);

  const getErrorText = (fieldKey) => {
    const errorArray = error[fieldKey];
    return Array.isArray(errorArray) ? errorArray.join(", ") : errorArray;
  };
  const hasError = (field) => !!error?.[field];
  const { activeRole, activeClubId } = UseAuth();
  console.log("activeRole", activeRole);
  console.log("activeClubId", activeClubId);
  const [formData, setFormData] = useState({
    fullname: "",
    birthdate: "",
    sex: "",
    user_id: null,
    email: "",
    phone: "",
    photo: "",
    club_id: activeClubId,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const isMinor =
    birthdate && differenceInYears(new Date(), birthdate.toDate()) < 18;
  const handleDateChange = (newValue) => {
    setbirthdate(newValue);
    const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : "";

    setFormData((prev) => ({
      ...prev,
      birthdate: formattedDate,
    }));

    if (newValue && differenceInYears(new Date(), newValue.toDate()) < 18) {
      setIsOwnResponsible(false);
    }
  };
  const getParents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance(
        `/api/parents-users?club_id=${activeClubId}`,
      );
      console.log(response);
      setStudentParent(response.data.parentUsers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    getParents();
  }, [getParents]);

  //parent selectionné
  useEffect(() => {
    if (selectParent) {
      setFormData((prev) => ({
        ...prev,
        user_id: selectParent.id,
      }));
    }
  }, [selectParent]);

  //handlesubmit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("is_own_responsible", isOwnResponsible ? 1 : 0);
      payload.append("create_account", createAccount ? 1 : 0);
      payload.append("fullname", formData.fullname);
      payload.append("birthdate", formData.birthdate);
      payload.append("sex", formData.sex);
      payload.append("club_id", activeClubId);

      if (createAccount) {
        payload.append("email", formData.email);
        payload.append("phone", formData.phone);
      }
      if (!isOwnResponsible) {
        payload.append("user_id", formData.user_id || "");
      }
      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const url = "/api/parent-eleven/store";

      const response = await Instance.post(url, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response);

      if (response.data.success) {
        setSelectParent(null);
        setFormData({
          fullname: "",
          birthdate: "",
          sex: "",
          email: "",
          phone: "",
          photo: "",
        });
        setSuccess(response.data.message);
        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ConfigSkeleton />;
  }
  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 600,
        mx: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Formulaire d'enregistrement de l'élève
      </Typography>
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}

      <Box sx={{ backgroundColor: "background.default" }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6">Identité de l'élève</Typography>

          <TextField
            error={hasError("fullname")}
            helperText={getErrorText("fullname")}
            name="fullname"
            label="Nom complet"
            fullWidth
            value={formData.fullname}
            onChange={handleChange}
            margin="normal"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: hasError("birthdate"),
                  helperText: getErrorText("birthdate"),
                },
              }}
              name="birthdate"
              label="Date de naissance"
              value={formData.birthdate ? new dayjs(formData.birthdate) : null}
              onChange={handleDateChange}
              // slotProps={{ textField: { fullWidth: true } }}
              maxDate={dayjs()}
            />
          </LocalizationProvider>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="sex-label">Sexe</InputLabel>
            <Select
              sx={{
                backgroundColor: "background.default",
                borderRadius: 2,
                "& .MuiSelect-select": {
                  padding: "12px",
                },
              }}
              error={hasError("sex")}
              labelId="sex-label"
              name="sex"
              label="Sexe"
              value={formData.sex}
              onChange={handleChange}
              helperText={!!getErrorText("sex")}
            >
              <MenuItem value="" disabled>
                Sélectionner
              </MenuItem>
              <MenuItem value="M">Masculin</MenuItem>
              <MenuItem value="F">Féminin</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={preview} sx={{ width: 56, height: 56 }} />
            <TextField
              type="file"
              error={hasError("photo")}
              helperText={getErrorText("photo")}
              label="Photo"
              name="photo"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
              />
            }
            label="L'élève a besoin d'un accès personnel (Email)"
          />

          {createAccount && (
            <Box sx={{ gap: 2 }}>
              <TextField
                error={hasError("email")}
                helperText={getErrorText("email")}
                name="email"
                value={formData.email}
                label="Email de l'élève"
                fullWidth
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                error={hasError("phone")}
                helperText={getErrorText("phone")}
                name="phone"
                value={formData.phone}
                label="Numéro de téléphone"
                fullWidth
                onChange={handleChange}
                margin="normal"
              />
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={isOwnResponsible}
                disabled={isMinor}
                onChange={(e) => setIsOwnResponsible(e.target.checked)}
              />
            }
            label="L'élève est son propre responsable légal"
          />

          {!isOwnResponsible && (
            <Autocomplete
              disablePortal
              options={Array.isArray(studentParent) ? studentParent : []}
              getOptionLabel={(studentParent) =>
                `${studentParent.fullname || ""} - ${studentParent.phone || ""}`
              }
              value={selectParent}
              onChange={(e, newValue) => {
                setSelectParent(newValue);
                console.log("Nouveau parent sélectionné :", newValue);
              }}
              renderInput={(params) => (
                <TextField
                  error={!!getErrorText("user_id")}
                  {...params}
                  fullWidth
                  margin="normal"
                  label="il vous faut choisir un parent"
                  required={!isOwnResponsible}
                  helperText={getErrorText("user_id")}
                />
              )}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{ mt: 3 }}
          >
            {submitting ? "enregistrement..." : "Enregistrer Élève et Parent"}
          </Button>
        </form>
      </Box>
    </Paper>
  );
};
export default StudentForm;
