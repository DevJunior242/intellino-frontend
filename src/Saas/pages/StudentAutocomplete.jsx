import { useEffect, useCallback, useState } from "react";
import { Autocomplete, TextField, FormHelperText } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { Save, Receipt, Person, LocalOffer, Event } from "@mui/icons-material";

const StudentAutocomplete = ({
  activeClubId,
  value,
  onChange,
  hasError,
  getError,
  label = "Choisir un élève",
}) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getStudents = useCallback(async () => {
    if (!activeClubId) return;

    setIsLoading(true);
    try {
      const response = await Instance(`/api/students?club_id=${activeClubId}`);
      setStudents(response.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    getStudents();
  }, [getStudents]);

  return (
    <>
      <Autocomplete
        disablePortal
        loading={isLoading}
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

export default StudentAutocomplete;
