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
import { useEffect } from "react";
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
import LeagueLicence from "./Saas/pages/League/LeagueLicence";
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
import AuthPage from "./Saas/pages/Auth/AuthPage.jsx";
import MentionsLegales from "./Saas/pages/legal/MentionsLegales.jsx";
import TermsOfService from "./Saas/pages/legal/TermsOfService.jsx";
import PrivacyPolicy from "./Saas/pages/legal/PrivacyPolicy.jsx";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { auth, activeRole, loading } = UseAuth();

  if (loading) return <CircularProgress />;

  if (!auth?.isLogin) return <Navigate to="/login" />;

  // Loader si roles pas encore chargés
  if (allowedRoles.length > 0 && !activeRole && !auth?.roleSuperAdmin) {
    return (
      <Box
        style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Super admin global → accès total
  const isSuperAdmin = auth?.roleSuperAdmin?.includes("super_admin");

  const isAllowed =
    isSuperAdmin ||
    allowedRoles.length === 0 ||
    allowedRoles.includes(activeRole);

  console.log("TEST ACCÈS :", {
    monRoleActuel: activeRole,
    roleSuperAdmin: auth?.roleSuperAdmin,
    listeAutorisee: allowedRoles,
    estCeQueCestDedans: allowedRoles.includes(activeRole),
    estSuperAdmin: isSuperAdmin,
  });

  return isAllowed ? <Outlet /> : <Navigate to="/403" />;
};

const GuestRoute = () => {
  const { auth } = UseAuth();

  if (auth?.isLogin) return <Navigate to="/" />;
  return <Outlet />;
};

const AppRoutes = () => {
  const STAFF_ROLES = [
    "super_admin",
    "admin_club",
    "instructeur",
    "secretaire",
  ];
  const ALL_ROLES = [...STAFF_ROLES, "parent", "karateka"];
  const SUPER_ADMIN = ["super_admin"];
  return (
    <>
      <Routes>
        <Route element={<LayoutAuth />}>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/auth/page" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/members" element={<MemberTable />} />
            <Route
              path="/dashboard/student/list"
              element={<StudentDetails />}
            />
            <Route path="/dashboard/session/list" element={<SessionList />} />
            <Route
              path="/dashboard/session/:sessionId/show"
              element={<SessionDetails />}
            />
            <Route
              path="/dashboard/payment/factures"
              element={<PaymentIndex />}
            />
            <Route path="/dashboard/caisse" element={<ParentDet />} />
            <Route path="/dashboard/dettes" element={<DebtPage />} />
            <Route
              path="/dashboard/student/attendance"
              element={<AttendanceIndex />}
            />

            <Route
              path="/dashboard/student/:examenId/candidates"
              element={<ExamenDetails />}
            />

            <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
              <Route
                path="/students-stats"
                element={<StudentStatsDashboard />}
              />
              <Route path="/examens-stats" element={<ExamenStats />} />

              <Route
                path="/grades-history"
                element={<StudentsGradesOverview />}
              />
              <Route path="/payments" element={<PaymentStat />} />
              <Route path="/sessions-stats" element={<SessionStats />} />

              <Route
                path="/dashboard/subscription"
                element={<SubscriptionsList />}
              />
              <Route path="/dashboard/add/member" element={<AddMemberForm />} />
              <Route
                path="/dashboard/student/store"
                element={<StudentForm />}
              />
              <Route path="/dashboard/course" element={<Course />} />
              <Route
                path="/dashboard/student/store"
                element={<StoreStudent />}
              />
              <Route
                path="/dashboard/instructor/store"
                element={<Instructor />}
              />
              <Route path="/dashboard/course/store" element={<Course />} />

              <Route path="/dashboard/medal/store" element={<Medal />} />

              <Route path="/dashboard/grade/store" element={<StoreGrade />} />
              <Route
                path="/dashboard/student/grade/store"
                element={<StudentGradCreate />}
              />
              <Route
                path="/dashboard/student/attendance/store"
                element={<AttendanceCreate />}
              />

              <Route
                path="/dashboard/student/examen/store"
                element={<StoreExamen />}
              />
              <Route
                path="/dashboard/student/examen/enchainement/store"
                element={<StoreEnchainement />}
              />
              <Route
                path="/dashboard/payment/settings"
                element={<PricingSettings />}
              />

              <Route
                path="/dashboard/payment/store"
                element={<PaymentForm />}
              />
              <Route path="/dashboard/catalogue" element={<InventoryPage />} />
              <Route
                path="/dashboard/inventory/prets"
                element={<EquipmentLoan />}
              />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN} />}>
              <Route path="/dashboard/clubs" element={<ClubAdmin />} />
              <Route path="/dashboard/users" element={<Users />} />
              <Route
                path="/dashboard/karateka/list"
                element={<StudentList />}
              />

              <Route path="/dashboard/plan/store" element={<Plan />} />
              <Route
                path="/dashboard/discipline/store"
                element={<StoreDisp />}
              />
            </Route>
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
          <Route element={<DashboardLeagueLayout />}>
            <Route
              path="/dashboard/league/clubs/list"
              element={<LeagueClub />}
            />
            <Route
              path="/dashboard/league/licences"
              element={<LeagueLicence />}
            />
            <Route
              path="/dashboard/league/categories"
              element={<CategoriesPage />}
            />
            <Route path="/dashboard/league/clubs" element={<MesClubs />} />
            <Route
              path="/dashboard/league/stats"
              element={<DashboardLeague />}
            />
            <Route path="/affiliations/create" element={<StoreAffiliation />} />
            <Route path="/licenses/generate" element={<LicenceForm />} />
            <Route
              path="/dashboard/league/setup"
              element={<LeagueSetupPage />}
            />
            <Route
              path="dashboard/programme-activites"
              element={<ProgrammeActivites />}
            />
            <Route
              path="dashboard/competitions"
              element={<CompetitionManager />}
            />
            <Route path="dashboard/grades" element={<GradesExamens />} />
            <Route path="dashboard/bureau" element={<BureauRoles />} />
            <Route path="dashboard/notation" element={<FicheNotationGrade />} />
            <Route path="dashboard/combat" element={<CombatDemo />} />
            <Route path="dashboard/kata" element={<KataDemo />} />
            <Route
              path="dashboard/athletes"
              element={<AdminCompetitionManagement />}
            />

            <Route
              path="dashboard/confignotation"
              element={<ConfigNotationPage />}
            />
            <Route
              path="dashboard/ConfigNotationCardDetails"
              element={<ConfigNotationCardDetails />}
            />
            <Route path="dashboard/notes" element={<SaisieNotePage />} />
            <Route path="dashboard/kumite" element={<KumiteScoreboard />} />
          </Route>
        </Route>

        <Route element={<LayoutMain />}>
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgu" element={<TermsOfService />} />
          <Route path="/confidentialite" element={<PrivacyPolicy />} />
          <Route
            path="/public/tatami/:configId"
            element={<VuePubliqueKata />}
          />
          <Route path="/public/program" element={<Program />} />
          <Route path="/clubs" element={<ClubSlider />} />
          <Route path="/club/store" element={<ClubStore />} />
          <Route path="/league/store" element={<Storeleague />} />
          <Route path="/examen-league/store" element={<StoreExamenLeague />} />
          <Route path="/examen-league" element={<LeagueExams />} />
          <Route path="/league/club" element={<LeagueClub />} />
          <Route path="/competitions" element={<InscriptionPage />} />
          <Route path="/candidature/postes" element={<CandidaturePage />} />
          <Route path="/jury/register" element={<JurySelfRegistration />} />
          <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
            <Route path="/examen" element={<ExamenIndex />} />
          </Route>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQSection />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
