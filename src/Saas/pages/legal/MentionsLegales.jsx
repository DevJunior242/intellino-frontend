import LegalLayout from "../../../component/layouts/LegalLayout";

const MentionsLegales = () => (
  <LegalLayout title="Mentions Légales">
    <h2>1. Éditeur du site</h2>
    <p>
      Le site <strong>Intellino SaaS</strong> est édité par [INTELLINO], [SARL
      au capital de 1 000 000].
    </p>
    <p>Siège social : [Ouaga 2000]</p>
    <p>Contact : contact@intellino.tech | +226 56 56 56 70 / 58 11 68 11</p>
    {/* 
    <h2>2. Directeur de la publication</h2>
    <p>[Ton Nom], en qualité de [Fondateur / Gérant].</p> */}

    {/* <h2>3. Hébergement</h2>
    <p>
      Le site est hébergé par [Nom de l'hébergeur, ex: AWS Europe /
      DigitalOcean].
    </p>
    <p>Adresse de l'hébergeur : [Adresse de l'hébergeur]</p> */}
  </LegalLayout>
);
export default MentionsLegales;
