import LegalLayout from "../../../component/layouts/LegalLayout";

const PrivacyPolicy = () => (
  <LegalLayout
    title="Politique de Confidentialité"
    subtitle="Votre vie privée et la sécurité de vos données sportives sont notre priorité."
  >
    <h2>1. Collecte des données</h2>
    <p>
      Nous collectons les données nécessaires à la gestion de votre club : nom,
      prénom, email, téléphone, grade, et historique de paiement.
    </p>

    <h2>2. Étanchéité des données (Principe SaaS)</h2>
    <p>
      <strong>Important :</strong> Intellino garantit une séparation stricte des
      bases de données. Les administrateurs du Club A n'ont techniquement aucun
      accès aux données du Club B.
    </p>

    <h2>3. Données des mineurs</h2>
    <p>
      Conformément au RGPD, la collecte de données concernant des mineurs de
      moins de 15 ans nécessite l'accord explicite du représentant légal via
      l'interface du club.
    </p>

    <h2>4. Vos droits</h2>
    <p>
      Vous disposez d'un droit d'accès, de rectification et de suppression de
      vos données personnelles. Pour l'exercer, contactez d'abord
      l'administrateur de votre club ou notre support.
    </p>
  </LegalLayout>
);

export default PrivacyPolicy;
