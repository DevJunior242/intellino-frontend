import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../../Api/AuthContext";
import ConfigSkeleton from "../ConfigSkeleton";

function StoreExamen({ open, handleClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [grade, setGrade] = useState([]);
  const [selectCurrentGrade, setSelectCurrentGrade] = useState(null);
  const [selectNextGrade, setSelectNextGrade] = useState(null);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const navigate = useNavigate();
  const { activeId, activeType } = UseAuth();
  const isLigueUser = activeType === "Ligue";

  //obtenir les medals
  const getGrade = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Instance(`/api/grade`);
      console.log(response);
      setGrade(response.data.grades || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    getGrade();
  }, [getGrade]);
  const [formData, setFormData] = useState({
    current_grade_id: null,
    next_grade_id: null,
    start_date: null,
    end_date: null,
    start_time: null,
    end_time: null,
  });

  useEffect(() => {
    if (selectCurrentGrade) {
      setFormData((prev) => ({
        ...prev,
        current_grade_id: selectCurrentGrade.id,
      }));
    }
  }, [selectCurrentGrade]);
  useEffect(() => {
    if (selectNextGrade) {
      setFormData((prev) => ({ ...prev, next_grade_id: selectNextGrade.id }));
    }
  }, [selectNextGrade]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
        organisateur_id: activeId,
        organisateur_type: activeType,
      };
      console.log("dataSend", dataSend);
      const response = await Instance.post("/api/examens", dataSend);
      console.log(response);
      if (response.data.success) {
        const routePrefix = isLigueUser
          ? "/dashboard/league"
          : "/dashboard/examen";
        navigate(`${routePrefix}/${response.data.data.id}/show`);
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          grade_id: null,
          date: null,
        });
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <ConfigSkeleton />;
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          p: 3,
          borderRadius: 3,
          backgroundColor: "background.default",
        },
      }}
    >
      <DialogTitle>Programmer un examen</DialogTitle>
      <DialogContent>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          sx={{
            mt: 8,
            boxShadow: 10,
            borderRadius: 2,
            p: 4,
          }}
        >
          {success && <Message text={success} type="success" />}
          {error?.general && <Message text={error.general} type="error" />}

          <form onSubmit={handleSubmit}>
            <Autocomplete
              slotProps={{
                paper: {
                  sx: { backgroundColor: "background.default" },
                },
              }}
              disablePortal
              options={Array.isArray(grade) ? grade : []}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              getOptionLabel={(grade) => `${grade.name || ""}`}
              value={selectCurrentGrade}
              onChange={(e, newValue) => setSelectCurrentGrade(newValue)}
              renderInput={(params) => (
                <TextField
                  error={hasError("current_grade_id")}
                  {...params}
                  fullWidth
                  margin="normal"
                  label="choisissez le niveau de grade actuel"
                  required
                />
              )}
            />
            {hasError("current_grade_id") && (
              <FormHelperText error>
                {getError("current_grade_id")}
              </FormHelperText>
            )}
            <Autocomplete
              slotProps={{
                paper: {
                  sx: { backgroundColor: "background.default" },
                },
              }}
              disablePortal
              options={Array.isArray(grade) ? grade : []}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              getOptionLabel={(grade) => `${grade.name || ""}`}
              value={selectNextGrade}
              onChange={(e, newValue) => setSelectNextGrade(newValue)}
              renderInput={(params) => (
                <TextField
                  error={hasError("next_grade_id")}
                  {...params}
                  fullWidth
                  margin="normal"
                  label="choisissez le niveau de grade suivant"
                  required
                />
              )}
            />
            {hasError("next_grade_id") && (
              <FormHelperText error>{getError("next_grade_id")}</FormHelperText>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                error={hasError("start_date")}
                helperText={getError("start_date")}
                type="date"
                name="start_date"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.start_date}
                onChange={handleChange}
                required
              />

              <TextField
                error={hasError("end_date")}
                helperText={getError("end_date")}
                type="date"
                name="end_date"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                error={hasError("start_time")}
                helperText={getError("start_time")}
                fullWidth
                type="time"
                name="start_time"
                label="heure de début"
                InputLabelProps={{ shrink: true }}
                value={formData.start_time}
                onChange={handleChange}
                margin="dense"
              />
              <TextField
                error={hasError("end_time")}
                helperText={getError("end_time")}
                fullWidth
                type="time"
                name="end_time"
                label="Fin"
                InputLabelProps={{ shrink: true }}
                value={formData.end_time}
                onChange={handleChange}
                margin="dense"
              />
            </Box>
            <Button
              disabled={submitting}
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              {submitting ? "Loading..." : "créer un examen"}
            </Button>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default StoreExamen;
