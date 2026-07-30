import {
  CssBaseline,
  ThemeProvider,
  Box,
  CircularProgress,
} from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import LayoutAuth from "./component/layouts/LayoutAuth";
import ScrollToTop from "./component/ScrollToTop";

import AuthContext, { AuthProvider, UseAuth } from "./Api/AuthContext";
import { useEffect, lazy, Suspense } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import LayoutMain from "./component/layouts/LayoutMain";
import DashboardLayout from "./component/layouts/DashboardLayout";
import DashboardGeneralLayout from "./component/layouts/DashboardGeneralLayout";
import { AxiosInterceptor } from "./Api/AxiosInterceptor";
import LoadingScreen from "./component/LoadingScreen.jsx";

// Pages chargées à la demande (un chunk séparé par page, téléchargé au moment de la navigation)
const Plan = lazy(() => import("./Saas/pages/Plan"));
const StoreStudent = lazy(() => import("./Saas/pages/StoreStudent"));
const Instructor = lazy(() => import("./Saas/pages/Instructor"));
const Course = lazy(() => import("./Saas/pages/Course"));
const Medal = lazy(() => import("./Saas/pages/Medal"));
const ClubStore = lazy(() => import("./Saas/pages/ClubStore"));
const Dashboard = lazy(() => import("./Saas/pages/Dashboard"));

const HomePage = lazy(() => import("./component/HomePage"));
const Contact = lazy(() => import("./component/Contact"));
const Login = lazy(() => import("./Saas/pages/Login"));
const Register = lazy(() => import("./Saas/pages/Register"));

const Forbidden = lazy(() => import("./Saas/pages/Forbidden"));
const StoreGrade = lazy(() => import("./Saas/pages/StoreGrade"));
const StudentGradCreate = lazy(() => import("./Saas/pages/StudentGradCreate"));
const AttendanceCreate = lazy(() => import("./Saas/pages/AttendanceReate"));
const AttendanceIndex = lazy(() => import("./Saas/pages/AttendanceIndex"));
const About = lazy(() => import("./component/About"));
const FAQSection = lazy(() => import("./component/Dashboard/FAQSection"));

const NotFound = lazy(() => import("./Saas/pages/NotFound"));
const StoreExamen = lazy(() => import("./Saas/pages/Examens/StoreExamen"));
const StoreEnchainement = lazy(
  () => import("./Saas/pages/Examens/StoreEnchainement"),
);
const ExamenDetails = lazy(() => import("./Saas/pages/Examens/ExamenDetails"));
const ExamenIndex = lazy(() => import("./Saas/pages/Examens/ExamenIndex"));
const ForgotPassword = lazy(() => import("./Saas/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Saas/pages/ResetPassword"));
const SubscriptionsList = lazy(
  () => import("./component/Dashboard/Admin/SubscriptionsList"),
);
const AddMemberForm = lazy(() => import("./Saas/pages/AddMemberForm"));
const SessionList = lazy(() => import("./Saas/pages/Sessions/SessionList"));
const StudentDetails = lazy(
  () => import("./Saas/pages/Students/StudentDetails"),
);
const StudentForm = lazy(() => import("./Saas/pages/Students/StudentForm"));
const StoreDisp = lazy(() => import("./Saas/pages/StoreDisp"));
const SessionDetails = lazy(
  () => import("./Saas/pages/Sessions/SessionDetails"),
);
const PaymentForm = lazy(() => import("./Saas/pages/PaymentForm"));
const PricingSettings = lazy(() => import("./Saas/pages/PricingSettings"));
const PaymentIndex = lazy(() => import("./Saas/pages/PaymentIndex"));
const EquipmentManager = lazy(() => import("./Saas/pages/EquipmentManager"));
const InventoryPage = lazy(() => import("./Saas/pages/InventoryPage"));
const MemberTable = lazy(() => import("./Saas/pages/member/MemberTable"));
const EquipmentLoan = lazy(() => import("./Saas/pages/EquipmentLoan"));
const AccountSettings = lazy(
  () => import("./component/settings/AccountSetting"),
);
const StudentsGradesOverview = lazy(
  () => import("./Saas/pages/StudentsGradesOverview"),
);
const PaymentStat = lazy(() => import("./Saas/pages/PaymentStat"));
const SessionStats = lazy(() => import("./Saas/pages/Sessions/SessionStats"));
const StudentStatsDashboard = lazy(
  () => import("./Saas/pages/StudentStatsDashboard"),
);
const ExamenStats = lazy(() => import("./Saas/pages/Examens/ExamenStats"));
const ClubSlider = lazy(() => import("./Saas/pages/ClubSlider"));
const Storeleague = lazy(() => import("./Saas/pages/League/Storeleague"));
const StoreExamenLeague = lazy(
  () => import("./Saas/pages/League/StoreExamenLeague"),
);
const LeagueExams = lazy(() => import("./Saas/pages/League/LeagueExams"));
const LeagueClub = lazy(() => import("./Saas/pages/League/LeagueClub"));
const MesClubs = lazy(() => import("./Saas/pages/League/MesClubs"));
const DashboardLeague = lazy(
  () => import("./component/League/DashboardLeague"),
);
const StoreAffiliation = lazy(
  () => import("./Saas/pages/League/StoreAffiliation"),
);
const LicenceForm = lazy(() => import("./Saas/pages/League/LicenceForm"));
const CategoriesPage = lazy(() => import("./Saas/pages/League/CategoriesPage"));
const SubDisciplinePage = lazy(
  () => import("./Saas/pages/League/SubDisciplinePage"),
);
const ProgrammeActivites = lazy(
  () => import("./Saas/pages/League/ProgrammeActivites"),
);
const CompetitionManager = lazy(
  () => import("./Saas/pages/League/CompetitionManager"),
);
const GradesExamens = lazy(() => import("./Saas/pages/League/GradesExamens"));
const BureauRoles = lazy(() => import("./Saas/pages/League/BureauRoles"));
const BureauRolesFederation = lazy(
  () => import("./Saas/pages/Fede/BureauRolesFederation"),
);
const FicheNotationGrade = lazy(
  () => import("./Saas/pages/League/FicheNotationGrade"),
);

const InscriptionPage = lazy(
  () => import("./Saas/pages/League/competion/InscriptionPage"),
);
const CandidaturePage = lazy(() => import("./component/CandidaturePage"));
const JurySelfRegistration = lazy(
  () => import("./component/JurySelfRegistration"),
);
const ConfigNotationPage = lazy(
  () => import("./Saas/pages/League/competion/ConfigNotationPage"),
);
const ConfigNotationCard = lazy(
  () => import("./Saas/pages/League/competion/ConfigNotationCard"),
);
const ConfigNotationCardDetails = lazy(
  () => import("./Saas/pages/League/competion/ConfigNotationCardDetails"),
);
const SaisieNotePage = lazy(
  () => import("./Saas/pages/League/competion/SaisieNotePage"),
);
const KumiteScoreboard = lazy(
  () => import("./Saas/pages/League/competion/KumiteScoreboard"),
);
const VuePubliqueKata = lazy(
  () => import("./Saas/pages/League/competion/VuePubliqueKata"),
);
const ParentDet = lazy(() => import("./Saas/pages/ParentDet"));
const DebtPage = lazy(() => import("./Saas/pages/DebtPage"));
const Program = lazy(() => import("./Saas/pages/Program"));
const StudentList = lazy(() => import("./Saas/pages/Students/StudentList"));
const Users = lazy(() => import("./Saas/pages/Users"));
const ClubAdmin = lazy(() => import("./Saas/pages/ClubAdmin.jsx"));
const MentionsLegales = lazy(
  () => import("./Saas/pages/legal/MentionsLegales.jsx"),
);
const TermsOfService = lazy(
  () => import("./Saas/pages/legal/TermsOfService.jsx"),
);
const PrivacyPolicy = lazy(
  () => import("./Saas/pages/legal/PrivacyPolicy.jsx"),
);
const LicenceTable = lazy(() => import("./Saas/pages/League/LicenceTable.jsx"));
const Arbitres = lazy(() => import("./Saas/pages/League/Arbitres.jsx"));
const Config = lazy(() => import("./Saas/pages/League/competion/Config.jsx"));
const AdminKeyGenerator = lazy(
  () => import("./Saas/pages/AdminKeyGenerator.jsx"),
);
const VuePubliqueKumite = lazy(
  () => import("./Saas/pages/League/competion/VuePubliqueKumite.jsx"),
);
const TakeoverLeagueForm = lazy(
  () => import("./Saas/pages/League/Mandat/TakeoverLeagueForm.jsx"),
);
const TakeoverKeyGenerator = lazy(
  () => import("./Saas/pages/TakeoverKeyGenerator.jsx"),
);
const StageIndex = lazy(() => import("./Saas/pages/StageIndex.jsx"));
const StageSubscribeIndex = lazy(
  () => import("./Saas/pages/StageSubscribeIndex.jsx"),
);
const ExamenSubscribeIndex = lazy(
  () => import("./Saas/pages/Examens/ExamenSubscribeIndex.jsx"),
);
const CreateFederationForm = lazy(
  () => import("./Saas/pages/Fede/CreateFederationForm.jsx"),
);
const FederationStructure = lazy(
  () => import("./Saas/pages/Fede/Federationstructure.jsx"),
);
const LicenceTypeIndex = lazy(
  () => import("./Saas/pages/Fede/Licencetypeindex.jsx"),
);
const LicenceIndex = lazy(() => import("./Saas/pages/LicenceIndex.jsx"));
const LeagueFederationAffiliation = lazy(
  () => import("./Saas/pages/Fede/LeagueFederationAffiliation.jsx"),
);
const AdminFederationDashboard = lazy(
  () => import("./Saas/pages/Fede/AdminFederationDashboard.jsx"),
);
const AffiliationTarifIndex = lazy(
  () => import("./Saas/pages/Fede/AffiliationTarifIndex.jsx"),
);
const PaymentMethodIndex = lazy(
  () => import("./Saas/pages/Paiement/Paymentmethodindex.jsx"),
);

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth, activeRole, loading } = UseAuth();

  if (loading) return <LoadingScreen fullscreen />;
  if (!auth?.isLogin) return <Navigate to="/login" />;

  // Si aucun rôle n'est requis
  if (!allowedRoles) {
    return <Outlet />;
  }

  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");

  const isAllowed = isSuperAdmin || allowedRoles.includes(activeRole);

  return isAllowed ? <Outlet /> : <Navigate to="/403" />;
};

const GuestRoute = () => {
  const { auth } = UseAuth();

  if (auth?.isLogin) return <Navigate to="/" />;
  return <Outlet />;
};
const STAFF_LEAGUE_ROLES = ["super_admin", "admin", "arbitre"];
const STAFF_CLUB_ROLES = [
  "super_admin",
  "admin",
  "instructeur",
  "secretaire",
  "admin",
];

const CAN_CREATE = ["super_admin", "admin", "admin", "instructeur"];

const SUPER_ADMIN = ["super_admin"];
const ALL_CLUB_ROLES = [...STAFF_CLUB_ROLES, "parent", "karateka"];

const STAFF_FEDERATION_ROLES = ["admin", "arbitre", "secretaire", "admin"];
const ALL_FEDERATION_ROLES = [...STAFF_FEDERATION_ROLES];

const AppRoutes = () => {
  return (
    <Routes>
      {/* ROUTES INVITES (Login, Register...) */}
      <Route element={<LayoutAuth />}>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ROUTES DASHBOARD (STAFF & CLUB) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route element={<ProtectedRoute allowedRoles={STAFF_CLUB_ROLES} />}>
          <Route path="student/list" element={<StudentDetails />} />
          <Route path="student/store" element={<StoreStudent />} />
          <Route path="dettes" element={<DebtPage />} />
          <Route path="students-stats" element={<StudentStatsDashboard />} />
          <Route path="examens-stats" element={<ExamenStats />} />
          <Route path="payments" element={<PaymentStat />} />
          <Route path="sessions-stats" element={<SessionStats />} />
          <Route path="add/member" element={<AddMemberForm />} />
          <Route path="course/store" element={<Course />} />
          <Route path="grade/store" element={<StoreGrade />} />
          <Route path="student/grade/store" element={<StudentGradCreate />} />
          <Route
            path="student/attendance/store"
            element={<AttendanceCreate />}
          />
          <Route
            path="student/examen/enchainement/store"
            element={<StoreEnchainement />}
          />
          <Route path="licences" element={<LicenceIndex />} />

          <Route path="payment/settings" element={<PricingSettings />} />
          <Route path="payment/store" element={<PaymentForm />} />
          <Route path="catalogue" element={<InventoryPage />} />
          <Route path="inventory/prets" element={<EquipmentLoan />} />
          <Route path="stages/ma-ligue" element={<StageSubscribeIndex />} />
          <Route path="payment-methods" element={<PaymentMethodIndex />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={ALL_CLUB_ROLES} />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MemberTable />} />
          <Route path="examen/:examenId/show" element={<ExamenDetails />} />
          <Route path="session/list" element={<SessionList />} />
          <Route path="session/:sessionId/show" element={<SessionDetails />} />
          <Route path="student/attendance" element={<AttendanceIndex />} />
          <Route path="payment/factures" element={<PaymentIndex />} />
          <Route path="grades-history" element={<StudentsGradesOverview />} />
          <Route path="examen" element={<ExamenIndex />} />
          <Route path="examens/disponibles" element={<ExamenSubscribeIndex />} />
          <Route path="competition" element={<InscriptionPage />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["parent", "karateka"]} />}
        >
          <Route path="caisse" element={<ParentDet />} />
        </Route>
        {/* ROUTES STRICTEMENT SUPER ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN} />}>
          <Route path="activation-keys" element={<AdminKeyGenerator />} />
          <Route
            path="activation-keys/takeover"
            element={<TakeoverKeyGenerator />}
          />

          <Route path="clubs" element={<ClubAdmin />} />
          <Route path="users" element={<Users />} />
          <Route path="karateka/list" element={<StudentList />} />
          <Route path="plan/store" element={<Plan />} />
          <Route path="discipline/store" element={<StoreDisp />} />
        </Route>
      </Route>
      {/* federation */}
      <Route path="/dashboard/federation" element={<DashboardGeneralLayout />}>
        <Route
          element={<ProtectedRoute allowedRoles={STAFF_FEDERATION_ROLES} />}
        >
          <Route path="stats" element={<AdminFederationDashboard />} />
          <Route path="licences" element={<LicenceTypeIndex />} />
          <Route path="affiliations" element={<AffiliationTarifIndex />} />
          <Route path="invitation" element={<LeagueFederationAffiliation />} />
          <Route path="structure" element={<FederationStructure />} />
          <Route path="payment-methods" element={<PaymentMethodIndex />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="configCategory" element={<SubDisciplinePage />} />
          <Route path="activity" element={<ProgrammeActivites />} />
          <Route path="bureau" element={<BureauRolesFederation />} />
          <Route path=":examenId/show" element={<ExamenDetails />} />
        </Route>
      </Route>

      {/* ROUTES LIGUE (Accessibles si activeRole est admin ou super_admin) */}
      <Route path="/dashboard/league" element={<DashboardGeneralLayout />}>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="examen" element={<ExamenIndex />} />
          {/* stages */}
          <Route path="stage" element={<StageIndex />} />
          {/* programme d'activités */}
          {/* <Route path="activity" element={<ProgrammeActivites />} /> */}
          <Route path="examen/:examenId/show" element={<ExamenDetails />} />
          <Route path="clubs/list" element={<LeagueClub />} />
          <Route path="licences" element={<LicenceTable />} />
          <Route path="categories" element={<CategoriesPage />} />

          <Route path="clubs" element={<MesClubs />} />
          <Route path="affiliations/create" element={<StoreAffiliation />} />
          <Route path="licenses/generate" element={<LicenceForm />} />
          <Route path="grades" element={<GradesExamens />} />
          <Route path="notation" element={<FicheNotationGrade />} />
          <Route path="confignotation" element={<ConfigNotationPage />} />
          <Route path="bureau" element={<BureauRoles />} />

          <Route path="notes" element={<SaisieNotePage />} />
          <Route path="kumite" element={<KumiteScoreboard />} />
          <Route path="payment-methods" element={<PaymentMethodIndex />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={STAFF_LEAGUE_ROLES} />}>
          <Route path="stats" element={<DashboardLeague />} />
          <Route
            path="ConfigNotationCardDetails"
            element={<ConfigNotationCardDetails />}
          />
          <Route path="activity" element={<ProgrammeActivites />} />

          <Route path="competitions" element={<Config />} />
        </Route>
      </Route>

      {/* ROUTES PUBLIQUES ET GÉNÉRALES */}
      <Route element={<LayoutMain />}>
        {/* Accès si connecté (n'importe quel rôle) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<AccountSettings />} />
          <Route
            path="/activation/takeover/:leagueId"
            element={<TakeoverLeagueForm />}
          />
        </Route>

        {/* non connecté  */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/public/tatami/:configId" element={<VuePubliqueKata />} />
        <Route
          path="/public/tatami/:configId/kumite"
          element={<VuePubliqueKumite />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQSection />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgu" element={<TermsOfService />} />
        <Route path="/confidentialite" element={<PrivacyPolicy />} />
        <Route path="/club/store" element={<ClubStore />} />
        <Route path="/league/store" element={<Storeleague />} />
        <Route path="/club/store" element={<ClubStore />} />
        <Route path="/federation/create" element={<CreateFederationForm />} />
        {/* <Route path="/examen-league" element={<LeagueExams />} /> */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AxiosInterceptor />

          <Box
            sx={{
              bgcolor: "background.default",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Suspense fallback={<LoadingScreen fullscreen />}>
              <AppRoutes />
            </Suspense>
            <ScrollToTop />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
