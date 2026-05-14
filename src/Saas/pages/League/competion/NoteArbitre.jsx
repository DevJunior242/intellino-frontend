import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import echo from "../../../../echo";

export default function NoteArbitre({
  ordrePassageId,
  onNotesChange,
  configId,
}) {
  console.log("NoteArbitre rendu avec ordrePassageId:", ordrePassageId);

  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fonction pour récupérer les notes depuis l'API
  const fetchNotes = useCallback(async () => {
    if (!ordrePassageId) {
      setNotes([]);
      onNotesChange([]);
      return;
    }

    try {
      const res = await Instance.get(
        `/api/inscriptions/${ordrePassageId}/notes`,
      );
      const notesData = res?.data?.data || [];
      setNotes(notesData);
      onNotesChange(notesData); // Transmet les notes au parent
      setScore(res?.data?.score ?? null);
    } catch (err) {
      console.error("Erreur lors de la récupération des notes:", err);
      // En cas d'erreur, on transmet les notes actuelles (ou un tableau vide)
      onNotesChange(notes.length > 0 ? notes : []);
    }
  }, [ordrePassageId, onNotesChange, notes]);

  // Chargement initial ou lors du changement d'athlète
  useEffect(() => {
    if (!ordrePassageId) {
      setNotes([]);
      onNotesChange([]);
      return;
    }

    // Réinitialisation des données
    setNotes([]);
    onNotesChange([]);
    setScore(null);

    // Récupération initiale des notes
    fetchNotes();
    setIsInitialLoad(false);
  }, [ordrePassageId, fetchNotes, onNotesChange]);

  // Écoute des mises à jour en temps réel via WebSocket
  useEffect(() => {
    if (!ordrePassageId || !configId) return;
    const channel = echo.channel(`tatami.${configId}`);

    const handler = (e) => {
      if (e.ordrePassageId === ordrePassageId) fetchNotes();
    };
    channel.listen(".note.ajoutee", handler);

    return () => {
      channel.stopListening(".note.ajoutee", handler);
    };
  }, [ordrePassageId, configId, fetchNotes]);

  // Pas de rendu : ce composant est purement logique
  return null;
}
