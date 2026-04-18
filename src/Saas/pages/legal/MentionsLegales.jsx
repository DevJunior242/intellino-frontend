import LegalLayout from "../../../component/layouts/LegalLayout";

const MentionsLegales = () => (
  <LegalLayout title="Mentions Légales">
    <h2>1. Éditeur du site</h2>
    <p>
      Le site <strong>Intellino</strong> est édité par [Ton Nom / Nom Société],
      [Statut Juridique, ex: SAS au capital de X€].
    </p>
    <p>Siège social : [Ton Adresse complète]</p>
    <p>SIRET : [Ton numéro SIRET]</p>
    <p>Contact : contact@intellino.com | +33 X XX XX XX XX</p>

    <h2>2. Directeur de la publication</h2>
    <p>[Ton Nom], en qualité de [Fondateur / Gérant].</p>

    <h2>3. Hébergement</h2>
    <p>
      Le site est hébergé par [Nom de l'hébergeur, ex: AWS Europe /
      DigitalOcean].
    </p>
    <p>Adresse de l'hébergeur : [Adresse de l'hébergeur]</p>
  </LegalLayout>
);
export default MentionsLegales;
