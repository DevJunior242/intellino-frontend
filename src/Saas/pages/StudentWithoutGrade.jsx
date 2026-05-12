import { useEffect, useCallback, useState } from "react";
import { Autocomplete, TextField, FormHelperText } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { Save, Receipt, Person, LocalOffer, Event } from "@mui/icons-material";
import ErrorBlock from "./ErrorBlock";

const StudentWithoutGrade = ({
  activeId,
  value,
  onChange,
  hasError,
  getError,
  label = "Choisir un élève",
}) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStudents = useCallback(async () => {
    if (!activeId) return;

    setLoading(true);
    try {
      const response = await Instance(
        `/api/students/without-grade?club_id=${activeId}`,
      );
      setStudents(response.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    getStudents();
  }, [getStudents]);

  return (
    <>
      <Autocomplete
        slotProps={{
          paper: {
            sx: { backgroundColor: "background.default" },
          },
        }}
        disablePortal
        loading={loading}
        options={Array.isArray(students) ? students : []}
        getOptionLabel={(student) =>
          `${student.fullname || ""} - ${student.birthdate || ""}`
        }
        value={value}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        onChange={(e, newValue) => onChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            margin="normal"
            label={label}
            required
            error={hasError("student_id")}
            helperText={getError("student_id")}
            InputProps={{
              ...params.InputProps,
              startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
            }}
          />
        )}
      />
    </>
  );
};

export default StudentWithoutGrade;
