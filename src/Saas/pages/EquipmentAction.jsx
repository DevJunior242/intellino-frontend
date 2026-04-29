import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";
import Message from "./Message";

export default function EditStudent({ open, handleClose, data, setData }) {
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const { activeId } = UseAuth();
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quantity_returned: data?.quantity_returned ?? 0,
    quantity_lost: data?.quantity_lost ?? 0,
    quantity_damaged: data?.quantity_damaged ?? 0,
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  console.log("data", data);

  const handleReturn = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const dataSend = {
        ...formData,
        club_id: activeId,
      };
      console.log("SEND", dataSend);

      const res = await Instance.post(
        `/api/inventory/loans/${data.id}/return`,
        dataSend,
      );

      console.log(res);
      if (res.data.success) {
        const updateLoan = res.data?.data;
        setData((prev) =>
          prev.map((item) => {
            if (item.id === updateLoan.id) {
              return { ...item, ...updateLoan };
            }
            return item;
          }),
        );

        setSuccess(res.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        handleClose();
      } else {
        setError(res.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{ backgroundColor: "background.default" }}
    >
      <DialogTitle>quantité pretéé {data?.quantity_loaned}</DialogTitle>

      {success && <Message text={success} type="success" />}
      {error?.general && <Message text={error.general} type="error" />}
      <form onSubmit={handleReturn}>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            error={hasError("quantity_returned")}
            helperText={getError("quantity_returned")}
            label="Quantité retournée"
            name="quantity_returned"
            value={formData.quantity_returned}
            onChange={handleChange}
            type="number"
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            error={hasError("quantity_lost")}
            helperText={getError("quantity_lost")}
            label="Quantité perdue"
            name="quantity_lost"
            value={formData.quantity_lost}
            onChange={handleChange}
            type="number"
            required
            inputProps={{ min: 0 }}
          />
          <TextField
            error={hasError("quantity_damaged")}
            helperText={getError("quantity_damaged")}
            label="Quantité détruite"
            name="quantity_damaged"
            value={formData.quantity_damaged}
            onChange={handleChange}
            type="number"
            required
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
