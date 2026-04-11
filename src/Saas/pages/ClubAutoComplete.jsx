import { useEffect, useCallback, useState } from "react";
import { Autocomplete, TextField, FormHelperText } from "@mui/material";
import { Instance } from "../../Api/Axios";
import { Save, Receipt, Person, LocalOffer, Event } from "@mui/icons-material";

const ClubAutoComplete = ({
  value,
  onChange,
  hasError,
  getError,
  label = "Choisir un élève",
}) => {
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getClubs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Instance(`/api/clubs/getClubs`);
      setClubs(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getClubs();
  }, [getClubs]);

  return (
    <>
      <Autocomplete
        disablePortal
        loading={isLoading}
        options={Array.isArray(clubs) ? clubs : []}
        getOptionLabel={(club) => `${club.name || ""}`}
        value={value}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        onChange={(e, newValue) => onChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            margin="normal"
            label={label}
            error={hasError("to_club_id")}
            helperText={getError("to_club_id")}
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

export default ClubAutoComplete;
