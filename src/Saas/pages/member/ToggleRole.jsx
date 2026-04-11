import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import RoleAutoComplete from "../RoleAutoComplete";
import Message from "../Message";
import ErrorGlobal from "../../../component/ErrorGlobal";
import { Instance } from "../../../Api/Axios";

function ToggleRole({
  open,
  handleClose,
  member,
  setMembers,
  activeClubId,
  onRefresh,
}) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    role_id: "",
  });
  useEffect(() => {
    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        role_id: selectedRole ? selectedRole.id : null,
      }));
    }
  }, [selectedRole]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({
      ...prev,
      role_id: role ? role.id : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      const dataSend = {
        ...formData,
        club_id: activeClubId,
      };
      const data = await Instance.post(`/api/members/${member.id}`, dataSend);
      console.log(data);
      if (data.success) {
        setSuccess(data.message);
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      }
      handleClose();
      onRefresh();
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Change Role</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText>
            changer le role pour {member.fullname}
          </DialogContentText>
          <DialogContentText>
            {success && <Message text={success} type="success" />}
            {error.general && <Message text={error.general} type="error" />}
          </DialogContentText>
          <RoleAutoComplete
            label="Rôle"
            name="role_id"
            value={selectedRole}
            onChange={handleRoleChange}
            required
            hasError={hasError}
            getError={getError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ToggleRole;
