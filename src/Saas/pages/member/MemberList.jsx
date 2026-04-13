import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { UseAuth } from "../../../Api/AuthContext";
import PhoneIcon from "@mui/icons-material/Phone";
import AddMemberForm from "../AddMemberForm";
import ConfigSkeleton from "../ConfigSkeleton";

const AnimatedMemberCard = ({ member, index, isSuperAdmin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "background.default",
          borderRadius: 4,
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          src={member?.avatar}
          sx={{ width: 100, height: 100, borderRadius: "50%" }}
        />
        {member?.fullname && (
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
            {member.fullname}
          </Typography>
        )}
        {member?.role && (
          <Chip
            label={member.role}
            color={member.role === "admin_club" ? "primary" : "default"}
            sx={{ mb: 1 }}
          />
        )}

        {isSuperAdmin && member?.club && (
          <Chip label={member.club} color="success" sx={{ mb: 1 }} />
        )}
        <Typography
          variant="body1"
          sx={{ display: "flex", alignItems: "center", mt: 1 }}
        >
          <IconButton>
            <PhoneIcon />
          </IconButton>
          {member.phone}
        </Typography>
      </Paper>
    </motion.div>
  );
};

function MemberList() {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const { activeRole, activeClubId, auth } = UseAuth();
  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");
  const hasAccessRoles = ["super_admin", "admin_club"];
  const allowAccess = isSuperAdmin || hasAccessRoles.includes(activeRole);

  const getMembers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await Instance(
          `/api/members?page=${page}&club_id=${activeClubId}`,
        );
        console.log(response);
        const membersData = response?.data?.members ?? { data: [] };

        setMembers(membersData.data ?? []);

        setPagination({
          currentPage: membersData.current_page,
          lastPage: membersData.last_page,
          perPage: membersData.per_page,
          total: membersData.total,
        });
      } catch (error) {
        console.error(error);
        setError(error.message || "Eureur lors de la récupération des membres");
      } finally {
        setIsLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    getMembers();
  }, [getMembers]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box sx={{ py: 10, px: 2 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 6,
          fontWeight: "bold",
          textAlign: "center",
          fontSize: { xs: 18, md: 24 },
        }}
      >
        Liste des membres du club
      </Typography>
      {allowAccess && (
        <Button
          variant="contained"
          sx={{
            mt: 2,

            textTransform: "none",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
          onClick={handleOpenModal}
        >
          Ajouter un membre
        </Button>
      )}
      <Grid container spacing={2} sx={{ pb: 2, mt: 4 }}>
        {members.map((member, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={member.id}
            sx={{ display: "flex", justifyContent: "center", mx: "auto" }}
          >
            <AnimatedMemberCard
              member={member}
              index={index}
              isSuperAdmin={isSuperAdmin}
            />
          </Grid>
        ))}
      </Grid>
      {!isLoading && members.length === 0 && (
        <Typography
          variant="h6"
          sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}
        >
          Aucun membre trouvé.
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => getMembers(value)}
            color="primary"
            shape="rounded"
          />
        )}
      </Box>
      <Dialog
        maxWidth="md"
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          "& .MuiDialog-paper": {
            p: 3,
            borderRadius: 3,
            backgroundColor: "background.default",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Formulaire de création de membre
        </DialogTitle>
        <DialogContent>
          <AddMemberForm />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end" }}>
          <Button onClick={handleCloseModal} color="error">
            Annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MemberList;
