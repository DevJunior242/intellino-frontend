import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import EquipmentManager from "./EquipmentManager";
import EquipmentTable from "./EquipmentTable";
import { Link } from "react-router-dom";

const InventoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  //activeClubId
  const { activeClubId } = UseAuth();
  // La fonction qui rafraîchit les données
  const fetchInventory = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await Instance.get(
          `/api/inventory/equipments?page=${page}&club_id=${activeClubId}`,
        );
        console.log("equipements", res.data);
        const equipment = res.data.equipments || [];
        setData(equipment?.data || []);
        setPagination({
          currentPage: equipment.current_page,
          lastPage: equipment.last_page,
          perPage: equipment.per_page,
          total: equipment.total,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      } finally {
        setLoading(false);
      }
    },
    [activeClubId],
  );

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <Box>
      {/* On passe la fonction au formulaire */}
      <EquipmentManager
        onRefresh={fetchInventory}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
      {/* lien vers les materiels pretés */}
      <Box>
        <Link to="/dashboard/inventory/prets">
          <Button variant="contained" sx={{ mt: 2 }}>
            Voir les matériels pretés
          </Button>
        </Link>
      </Box>
      {/* Le tableau se mettra à jour dès que data change */}
      <EquipmentTable
        data={data}
        onRefresh={fetchInventory}
        pagination={pagination}
        fetchInventory={fetchInventory}
        isLoading={loading}
      />
    </Box>
  );
};
export default InventoryPage;
