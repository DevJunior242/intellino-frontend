import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { Instance } from "./Axios";

const AuthContext = createContext();

export const UseAuth = () => {
  return useContext(AuthContext);
};
//////////////////////////////////////////////////////////////////////////////////
//   HELPER FUNCTION TO SAFELY PARSE JSON
//////////////////////////////////////////////////////////////////////////////////
const safeParseJSON = (item, defaultValue = null) => {
  try {
    const value = localStorage.getItem(item);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
};

//////////////////////////////////////////////////////////////////////////////////
//   HELPER FUNCTION TO INITIALIZE AUTH STATE FROM LOCALSTORAGE
//////////////////////////////////////////////////////////////////////////////////
const initializeAuth = () => ({
  token: localStorage.getItem("token"),
  user: safeParseJSON("user"),
  role: safeParseJSON("role", []),
  roleSuperAdmin: safeParseJSON("roleSuperAdmin", []),
  clubs: safeParseJSON("clubs", []),
  leagues: safeParseJSON("leagues", []),
  isLogin: !!localStorage.getItem("token"),
});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(initializeAuth);
  const [activeRole, setActiveRole] = useState(null);
  const [activeId, setActiveId] = useState(
    localStorage.getItem("activeId") || null,
  );
  const [activeType, setActiveType] = useState(
    localStorage.getItem("activeType") || "Club",
  );
  const [loading, setLoading] = useState(true);

  //  ////////////////////////////////////////////////////////////////////////////////
  //   EFFECTS TO INITIALIZE ACTIVE ROLE AND CLUB ID
  //////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (auth?.isLogin) {
      const savedRole = localStorage.getItem("activeRole");
      const savedId = localStorage.getItem("activeId");
      const savedType = localStorage.getItem("activeType");

      // 1. Si on a déjà des données en cache, on les restaure
      if (savedRole && (savedId || savedRole === "super_admin")) {
        setActiveRole(savedRole);
        setActiveId(savedId);
        setActiveType(savedType || "Club");
        setLoading(false);
        return;
      }

      // 2. Sinon, on initialise selon la priorité : SuperAdmin > Ligue > Club
      let role = auth.roleSuperAdmin?.[0] || auth.role?.[0] || null;
      let targetId = null;
      let targetType = "Club";

      if (role === "super_admin") {
        setActiveRole("super_admin");
        localStorage.setItem("activeRole", "super_admin");
      }
      // Priorité à la Ligue si elle est active dans le profil user
      else if (auth.user?.current_league_id) {
        targetId = auth.user.current_league_id;
        targetType = "Ligue";
      } else if (auth.user?.current_club_id) {
        targetId = auth.user.current_club_id;
        targetType = "Club";
      }

      if (targetId) {
        setActiveId(targetId);
        setActiveType(targetType);
        setActiveRole(role);
        localStorage.setItem("activeId", targetId);
        localStorage.setItem("activeType", targetType);
        localStorage.setItem("activeRole", role);
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [auth]);

  const switchPortal = useCallback((id, type, roleName) => {
    const normalizedRole = Array.isArray(roleName)
      ? (roleName[0] ?? null)
      : roleName;
    setActiveId(id);
    setActiveType(type);
    setActiveRole(normalizedRole);
    localStorage.setItem("activeId", id);
    localStorage.setItem("activeType", type);
    localStorage.setItem("activeRole", normalizedRole);

    if (type === "Ligue") {
      navigate("/dashboard/league/stats");
    } else {
      navigate("/dashboard");
    }
  }, []);
  //////////////////////////////////////////////////////////////////////////////////
  //   EFFECTS TO SYNC AUTH STATE WITH LOCALSTORAGE
  //////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (!auth) return;

    if (auth.token) {
      localStorage.setItem("token", auth.token);
    } else {
      localStorage.removeItem("token");
    }

    if (auth.user) {
      localStorage.setItem("user", JSON.stringify(auth.user));
    } else {
      localStorage.removeItem("user");
    }

    if (Array.isArray(auth.role) && auth.role.length > 0) {
      localStorage.setItem("role", JSON.stringify(auth.role));
    } else {
      localStorage.removeItem("role");
    }

    if (Array.isArray(auth.roleSuperAdmin) && auth.roleSuperAdmin.length > 0) {
      localStorage.setItem(
        "roleSuperAdmin",
        JSON.stringify(auth.roleSuperAdmin),
      );
    } else {
      localStorage.removeItem("roleSuperAdmin");
    }

    if (Array.isArray(auth.clubs) && auth.clubs.length > 0) {
      localStorage.setItem("clubs", JSON.stringify(auth.clubs));
    } else {
      localStorage.removeItem("clubs");
    }
    if (Array.isArray(auth.leagues) && auth.leagues.length > 0) {
      localStorage.setItem("leagues", JSON.stringify(auth.leagues));
    } else {
      localStorage.removeItem("leagues");
    }
  }, [auth]);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO UPDATE AUTH STATE
  //////////////////////////////////////////////////////////////////////////////////

  const setAuthData = useCallback(
    (token, user, role = [], clubs = [], leagues = [], roleSuperAdmin = []) => {
      setAuth({
        token,
        user,
        role,
        roleSuperAdmin,
        clubs,
        leagues,
        isLogin: true,
      });
    },
    [],
  );
  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTION TO CLEAR AUTH DATA
  //////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuth((prev) => ({ ...prev, isLogin: false }));
        setLoading(false);
        return;
      }

      try {
        // appel sécurisé
        const res = await Instance.get("/api/user");

        setAuth((prev) => ({
          ...prev,
          user: res.data,
          isLogin: true,
        }));
      } catch (error) {
        // token mort
        localStorage.clear();

        setAuth({
          token: null,
          user: null,
          role: [],
          roleSuperAdmin: [],
          clubs: [],
          leagues: [],
          isLogin: false,
        });
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleSuperAdmin");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeId");
    localStorage.removeItem("clubs");
    localStorage.removeItem("leagues");
    setAuth({
      token: null,
      user: null,
      role: [],
      isLogin: false,
      clubs: [],
      leagues: [],
      roleSuperAdmin: [],
    });
    setActiveRole(null);
    setActiveId(null);
    setActiveType(null);
  }, []);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO REGISTER USER
  //////////////////////////////////////////////////////////////////////////////////
  const register = useCallback(
    async (userData) => {
      try {
        const res = await Instance.post("api/register", userData);

        navigate("/login");
        return { success: true, user: res?.data?.user };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    [navigate],
  );

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO ADMINISTER USER
  //////////////////////////////////////////////////////////////////////////////////
  const StoreClubMember = useCallback(async (userData) => {
    try {
      const res = await Instance.post("api/members", userData);
      console.log("member enregistré avec succès", res);
      return {
        success: res.data.success,
        message: res.data.message,
        user: res.data.user,
      };
    } catch (error) {
      console.error("erreur l'ors de enregistrement des membres:", error);
      throw error;
    }
  }, []);
  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO UPDATE CLUB MEMBER
  //////////////////////////////////////////////////////////////////////////////////
  const StoreLeagueUser = useCallback(async (userData) => {
    try {
      const res = await Instance.post("api/membres/league", userData);
      return {
        success: res.data.success,
        message: res.data.message,
        user: res.data.user,
      };
    } catch (error) {
      console.error("erreur l'ors de enregistrement des membres:", error);
      throw error;
    }
  }, []);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO LOGIN USER
  //////////////////////////////////////////////////////////////////////////////////
  const login = useCallback(
    async (credentials) => {
      const res = await Instance.post("api/login", credentials);
      console.log(res);

      const { token, user, role, clubs, leagues, roleSuperAdmin } = res.data;

      if (!token) {
        throw {
          response: {
            status: 401,
            data: { message: "Identifiants incorrects" },
          },
        };
      }

      const saveRoleSuperAdmin = Array.isArray(roleSuperAdmin)
        ? roleSuperAdmin
        : [];
      const saveRole = Array.isArray(role) ? role : [];
      const saveClubs = Array.isArray(clubs) ? clubs : [];
      const saveLeagues = Array.isArray(leagues) ? leagues : [];

      setAuthData(
        token,
        user,
        saveRole,
        saveClubs,
        saveLeagues,
        saveRoleSuperAdmin,
      );

      const hasRole =
        (Array.isArray(saveRole) && saveRole.length > 0) ||
        saveRoleSuperAdmin.length > 0;
      navigate(hasRole ? "/dashboard" : "/");

      return { success: true, user };
    },
    [navigate, setAuthData],
  );

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO LOGOUT USER
  //////////////////////////////////////////////////////////////////////////////////
  const logout = useCallback(async () => {
    try {
      await Instance.post("api/logout");
      clearAuthData();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear auth data even if logout request fails
      clearAuthData();
      navigate("/login");
    }
  }, [navigate, clearAuthData]);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO REFRESH USER
  //////////////////////////////////////////////////////////////////////////////////
  const refreshUser = useCallback(async () => {
    try {
      const res = await Instance.get("api/user");
      const { role, user } = res.data;
      console.log(res.data);
      setAuth((prev) => ({
        ...prev,
        role: Array.isArray(role) ? role : [],
        user: user,
        isLogin: true,
      }));
    } catch (error) {
      console.error("refreshUser error:", error);
    }
  }, [setAuth]);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTION TO UPDATE AUTH STATE
  //////////////////////////////////////////////////////////////////////////////////

  const updateAuth = useCallback((newData) => {
    setAuth((prev) => {
      const updated = { ...prev, ...newData };

      if (newData.user)
        localStorage.setItem("user", JSON.stringify(newData.user));
      if (newData.token) localStorage.setItem("token", newData.token);
      if (newData.clubs)
        localStorage.setItem("clubs", JSON.stringify(newData.clubs));
      if (newData.role)
        localStorage.setItem("role", JSON.stringify(newData.role));

      return updated;
    });

    // on Gére le club actif immédiatement
    if (newData.user?.current_club_id) {
      const clubId = newData.user.current_club_id;
      setActiveId(clubId);
      localStorage.setItem("activeId", clubId);
    }

    if (newData.activeRole) {
      setActiveRole(newData.activeRole);
      localStorage.setItem("activeRole", newData.activeRole);
    }
  }, []);

  //////////////////////////////////////////////////////////////////////////////////
  //   USE MEMO TO RETURN AUTH CONTEXT
  //////////////////////////////////////////////////////////////////////////////////
  const value = useMemo(
    () => ({
      auth,
      register,
      StoreClubMember,
      StoreLeagueUser,
      login,
      logout,
      loading,
      refreshUser,
      switchPortal,
      activeRole,
      activeId,
      activeType,
      updateAuth,
    }),
    [
      auth,
      register,
      StoreClubMember,
      StoreLeagueUser,
      login,
      logout,
      loading,
      refreshUser,
      switchPortal,
      activeRole,
      activeId,
      activeType,
      updateAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
