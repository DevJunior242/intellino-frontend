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
import { useEffect, useMemo } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import LayoutMain from "./component/layouts/LayoutMain";

import Plan from "./Saas/pages/Plan";
import StoreStudent from "./Saas/pages/StoreStudent";
import Instructor from "./Saas/pages/Instructor";
import Course from "./Saas/pages/Course";
import Medal from "./Saas/pages/Medal";
import ClubStore from "./Saas/pages/ClubStore";
import Dashboard from "./Saas/pages/Dashboard";

import HomePage from "./component/HomePage";
import Contact from "./component/Contact";
import Login from "./Saas/pages/Login";
import Register from "./Saas/pages/Register";
import { AxiosInterceptor } from "./Api/AxiosInterceptor";

import Forbidden from "./Saas/pages/Forbidden";
import StoreGrade from "./Saas/pages/StoreGrade";
import StudentGradCreate from "./Saas/pages/StudentGradCreate";
import AttendanceCreate from "./Saas/pages/AttendanceReate";
import AttendanceIndex from "./Saas/pages/AttendanceIndex";
import About from "./component/About";
import FAQSection from "./component/Dashboard/FAQSection";

import NotFound from "./Saas/pages/NotFound";
import StoreExamen from "./Saas/pages/Examens/StoreExamen";
import StoreEnchainement from "./Saas/pages/Examens/StoreEnchainement";
import ExamenDetails from "./Saas/pages/Examens/ExamenDetails";
import ExamenIndex from "./Saas/pages/Examens/ExamenIndex";
import ForgotPassword from "./Saas/pages/ForgotPassword";
import ResetPassword from "./Saas/pages/ResetPassword";
import DashboardLayout from "./component/layouts/DashboardLayout";
import SubscriptionsList from "./component/Dashboard/Admin/SubscriptionsList";
import AddMemberForm from "./Saas/pages/AddMemberForm";
import SessionList from "./Saas/pages/Sessions/SessionList";
import StudentDetails from "./Saas/pages/Students/StudentDetails";
import StudentForm from "./Saas/pages/Students/StudentForm";
import StoreDisp from "./Saas/pages/StoreDisp";
import SessionDetails from "./Saas/pages/Sessions/SessionDetails";
import PaymentForm from "./Saas/pages/PaymentForm";
import PricingSettings from "./Saas/pages/PricingSettings";
import PaymentIndex from "./Saas/pages/PaymentIndex";
import EquipmentManager from "./Saas/pages/EquipmentManager";
import InventoryPage from "./Saas/pages/InventoryPage";
import MemberTable from "./Saas/pages/member/MemberTable";
import EquipmentLoan from "./Saas/pages/EquipmentLoan";
import AccountSettings from "./component/settings/AccountSetting";
import StudentsGradesOverview from "./Saas/pages/StudentsGradesOverview";
import PaymentStat from "./Saas/pages/PaymentStat";
import SessionStats from "./Saas/pages/Sessions/SessionStats";
import StudentStatsDashboard from "./Saas/pages/StudentStatsDashboard";
import ExamenStats from "./Saas/pages/Examens/ExamenStats";
import ClubSlider from "./Saas/pages/ClubSlider";
import Storeleague from "./Saas/pages/League/Storeleague";
import StoreExamenLeague from "./Saas/pages/League/StoreExamenLeague";
import LeagueExams from "./Saas/pages/League/LeagueExams";
import LeagueClub from "./Saas/pages/League/LeagueClub";
import MesClubs from "./Saas/pages/League/MesClubs";
import DashboardLeagueLayout from "./component/layouts/DashboardLeagueLayout";
import DashboardLeague from "./component/League/DashboardLeague";
import StoreAffiliation from "./Saas/pages/League/StoreAffiliation";
import LicenceForm from "./Saas/pages/League/LicenceForm";
import CategoriesPage from "./Saas/pages/League/CategoriesPage";
import LeagueSetupPage from "./Saas/pages/League/LeagueSetupPage";
import ProgrammeActivites from "./Saas/pages/League/ProgrammeActivites";
import CompetitionManager from "./Saas/pages/League/CompetitionManager";
import GradesExamens from "./Saas/pages/League/GradesExamens";
import BureauRoles from "./Saas/pages/League/BureauRoles";
import FicheNotationGrade from "./Saas/pages/League/FicheNotationGrade";
import CombatDemo from "./Saas/pages/CombaDemo";
import KataDemo from "./Saas/pages/KataDemo";
import InscriptionPage from "./Saas/pages/League/competion/InscriptionPage";
import AdminCompetitionManagement from "./Saas/pages/League/competion/AdminCompetitionManagement";
import GovernanceSettings from "./Saas/pages/GovernanceSettings";
import BureauNomination from "./Saas/pages/League/competion/BureauNomination";
import CandidaturePage from "./component/CandidaturePage";
import JurySelfRegistration from "./component/JurySelfRegistration";
import ConfigNotationPage from "./Saas/pages/League/competion/ConfigNotationPage";
import ConfigNotationCard from "./Saas/pages/League/competion/ConfigNotationCard";
import ConfigNotationCardDetails from "./Saas/pages/League/competion/ConfigNotationCardDetails";
import SaisieNotePage from "./Saas/pages/League/competion/SaisieNotePage";
import KumiteScoreboard from "./Saas/pages/League/competion/KumiteScoreboard";
import VuePubliqueKata from "./Saas/pages/League/competion/VuePubliqueKata";
import ParentDet from "./Saas/pages/ParentDet";
import DebtPage from "./Saas/pages/DebtPage";
import Program from "./Saas/pages/Program";
import StudentList from "./Saas/pages/Students/StudentList";
import Users from "./Saas/pages/Users";
import ClubAdmin from "./Saas/pages/ClubAdmin.jsx";
import MentionsLegales from "./Saas/pages/legal/MentionsLegales.jsx";
import TermsOfService from "./Saas/pages/legal/TermsOfService.jsx";
import PrivacyPolicy from "./Saas/pages/legal/PrivacyPolicy.jsx";
import ConfigSkeleton from "./Saas/pages/ConfigSkeleton.jsx";
import LicenceTable from "./Saas/pages/League/LicenceTable.jsx";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { auth, activeRole, loading } = UseAuth();

  if (loading) return <ConfigSkeleton />;
  if (!auth?.isLogin) return <Navigate to="/login" />;

  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");

  const hasAnyRole = auth?.role?.length > 0 || auth?.roleSuperAdmin?.length > 0;

  const isAllowed =
    isSuperAdmin || allowedRoles === "ANY"
      ? hasAnyRole
      : allowedRoles.includes(activeRole);

  return isAllowed ? <Outlet /> : <Navigate to="/403" />;
};

const GuestRoute = () => {
  const { auth } = UseAuth();

  if (auth?.isLogin) return <Navigate to="/" />;
  return <Outlet />;
};
const STAFF_LEAGUE_ROLES = ["super_admin", "admin_league", "arbitre_league"];
const STAFF_CLUB_ROLES = [
  "super_admin",
  "admin_club",
  "instructeur",
  "secretaire",
  "admin_league",
];

const CAN_CREATE = ["super_admin", "admin_league", "admin_club", "instructeur"];

const SUPER_ADMIN = ["super_admin"];
const ALL_CLUB_ROLES = [...STAFF_CLUB_ROLES, "parent", "karateka"];

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
        <Route path="/reset-password/:token" element={<ResetPassword />} />
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
          <Route path="payment/settings" element={<PricingSettings />} />
          <Route path="payment/store" element={<PaymentForm />} />
          <Route path="catalogue" element={<InventoryPage />} />
          <Route path="inventory/prets" element={<EquipmentLoan />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={ALL_CLUB_ROLES} />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<MemberTable />} />
          <Route
            path="student/:examenId/candidates"
            element={<ExamenDetails />}
          />
          <Route path="session/list" element={<SessionList />} />
          <Route path="session/:sessionId/show" element={<SessionDetails />} />
          <Route path="student/attendance" element={<AttendanceIndex />} />
          <Route path="payment/factures" element={<PaymentIndex />} />
          <Route path="grades-history" element={<StudentsGradesOverview />} />
          <Route path="examen" element={<ExamenIndex />} />
          <Route path="competition" element={<InscriptionPage />} />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["parent", "karateka"]} />}
        >
          <Route path="caisse" element={<ParentDet />} />
        </Route>
        {/* ROUTES STRICTEMENT SUPER ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN} />}>
          <Route path="clubs" element={<ClubAdmin />} />
          <Route path="users" element={<Users />} />
          <Route path="karateka/list" element={<StudentList />} />
          <Route path="plan/store" element={<Plan />} />
          <Route path="discipline/store" element={<StoreDisp />} />
        </Route>
      </Route>

      {/* ROUTES LIGUE (Accessibles si activeRole est admin_league ou super_admin) */}
      <Route path="/dashboard/league" element={<DashboardLeagueLayout />}>
        {" "}
        <Route element={<ProtectedRoute allowedRoles={["admin_league"]} />}>
          <Route path="category" element={<LeagueSetupPage />} />

          <Route path="stats" element={<DashboardLeague />} />
          <Route path="programme-activites" element={<ProgrammeActivites />} />
          <Route path=":examenId/candidates" element={<ExamenDetails />} />
          <Route path="clubs/list" element={<LeagueClub />} />
          <Route path="licences" element={<LicenceTable />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="clubs" element={<MesClubs />} />
          <Route path="affiliations/create" element={<StoreAffiliation />} />
          <Route path="licenses/generate" element={<LicenceForm />} />
          <Route path="competitions" element={<CompetitionManager />} />
          <Route path="grades" element={<GradesExamens />} />
          <Route path="bureau" element={<BureauRoles />} />
          <Route path="notation" element={<FicheNotationGrade />} />
          <Route path="confignotation" element={<ConfigNotationPage />} />
          <Route
            path="ConfigNotationCardDetails"
            element={<ConfigNotationCardDetails />}
          />
          <Route path="notes" element={<SaisieNotePage />} />
          <Route path="kumite" element={<KumiteScoreboard />} />
          <Route path="athletes" element={<AdminCompetitionManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={STAFF_LEAGUE_ROLES} />}>
        <Route path="programme-activites" element={<ProgrammeActivites />} />
        <Route path="competitions" element={<CompetitionManager />} />
        <Route path="grades" element={<GradesExamens />} />
        <Route path="bureau" element={<BureauRoles />} />
      </Route>

      {/* ROUTES PUBLIQUES ET GÉNÉRALES */}
      <Route element={<LayoutMain />}>
        {/* Accès si connecté (n'importe quel rôle) */}
        <Route element={<ProtectedRoute allowedRoles="ANY" />}>
          <Route path="/settings" element={<AccountSettings />} />
        </Route>
        {/* <Route element={<ProtectedRoute allowedRoles={CAN_CREATE} />}>
          <Route path="/examen/store" element={<StoreExamen />} />
        </Route> */}
        {/* non connecté  */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQSection />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgu" element={<TermsOfService />} />
        <Route path="/confidentialite" element={<PrivacyPolicy />} />
        <Route path="/club/store" element={<ClubStore />} />
        <Route path="/league/store" element={<Storeleague />} />
        <Route path="/club/store" element={<ClubStore />} />

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
            <AppRoutes />
            <ScrollToTop />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
export default App;
