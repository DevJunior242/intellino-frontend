import LegalLayout from "../../../component/layouts/LegalLayout";

const TermsOfService = () => (
  <LegalLayout title="Conditions Générales d'Utilisation">
    <h2>1. Objet du service</h2>
    <p>
      Intellino fournit une plateforme de gestion intégrée pour les clubs
      sportifs (adhérents, cours, sessions,examens et grades).
    </p>

    <h2>2. Responsabilité de l'utilisateur</h2>
    <p>
      Le Club est responsable de la véracité des informations saisies et du
      respect des règles de sécurité lors des entraînements. Intellino fournit
      l'outil de gestion mais n'intervient pas dans l'organisation physique du
      sport.
    </p>

    <h2>3. Disponibilité du service</h2>
    <p>
      Nous nous efforçons de maintenir le service accessible 24h/24 et 7j/7,
      sauf maintenance programmée dont les clubs seront informés 48h à l'avance.
    </p>

    <h2>4. Propriété des données</h2>
    <p>
      Chaque club reste propriétaire exclusif de sa base de données membres. En
      cas de résiliation, une fonction d'exportation (CSV/Excel) est mise à
      disposition.
    </p>
  </LegalLayout>
);

export default TermsOfService;
