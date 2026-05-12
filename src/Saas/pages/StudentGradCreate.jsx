import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "../../component/ErrorGlobal";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./Message";
import { UseAuth } from "../../Api/AuthContext";
import ConfigSkeleton from "./ConfigSkeleton";
import StudentWithoutGrade from "./StudentWithoutGrade";

function StudentGradCreate() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectStudent, setSelectStudent] = useState(null);
  const { activeId } = UseAuth();
  const [grade, setGrade] = useState([]);
  const [selectCurrentGrade, setSelectCurrentGrade] = useState(null);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    student_id: null,
    current_grade_id: null,
    awarded_at: "",
    club_id: activeId,
  });
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

  useEffect(() => {
    console.log(selectCurrentGrade);
    if (selectCurrentGrade) {
      setFormData((prev) => ({
        ...prev,
        current_grade_id: selectCurrentGrade.id,
      }));
    }
  }, [selectCurrentGrade]);

  //

  //mettre a jour club_id
  useEffect(() => {
    if (selectStudent) {
      setFormData((prev) => ({ ...prev, student_id: selectStudent.id }));
    }
  }, [selectStudent]);

  useEffect(() => {
    if (selectCurrentGrade) {
      setFormData((prev) => ({
        ...prev,
        current_grade_id: selectCurrentGrade.id,
      }));
    }
  }, [selectCurrentGrade]);

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
        club_id: activeId,
      };
      const response = await Instance.post(
        "/api/student-grades/store",
        dataSend,
      );
      console.log(response);
      if (response.data.success) {
        setSelectStudent(null);
        setSelectCurrentGrade(null);
        setFormData({
          awarded_at: "",
        });
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
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
    <Container maxWidth="md">
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
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
        >
          Attribution de grade a un eleve
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <StudentWithoutGrade
            activeId={activeId}
            value={selectStudent}
            onChange={(newValue) => setSelectStudent(newValue)}
            hasError={hasError}
            getError={getError}
            label="il vous faut choisir un eleve"
          />
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
                helperText={getError("current_grade_id")}
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

          <label htmlFor="session_date">
            <Typography
              variant="h6"
              component={"h1"}
              sx={{ fontWeight: "bold" }}
            >
              date
            </Typography>
          </label>
          <TextField
            error={!!error.start_date}
            type="date"
            name="awarded_at"
            value={formData.awarded_at}
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          {hasError("awarded_at") && (
            <FormHelperText error>{getError("awarded_at")}</FormHelperText>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
            disabled={submitting}
          >
            {submitting ? "Enregistrement..." : "Association de grade"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default StudentGradCreate;
