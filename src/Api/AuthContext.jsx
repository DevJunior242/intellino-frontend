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
  memberships: safeParseJSON("memberships", []),
  isLogin: !!localStorage.getItem("token"),
});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(initializeAuth);
  const [activeRole, setActiveRole] = useState(null);
  const [activeClubId, setActiveClubId] = useState(null);
  const [loading, setLoading] = useState(true);

  //  ////////////////////////////////////////////////////////////////////////////////
  //   EFFECTS TO INITIALIZE ACTIVE ROLE AND CLUB ID
  //////////////////////////////////////////////////////////////////////////////////
  // useEffect(() => {
  //   if (!auth.isLogin) {
  //     setLoading(false);
  //     return;
  //   }

  //   if (auth?.isLogin && auth?.role?.length > 0) {
  //     const savedRole = localStorage.getItem("activeRole");
  //     const savedClubId = localStorage.getItem("activeClubId");

  //     if (savedRole && savedClubId) {
  //       setActiveRole(savedRole);
  //       setActiveClubId(savedClubId);
  //       setLoading(false);
  //       return;
  //     }

  //     if (auth.user?.current_club_id) {
  //       const clubId = auth.user.current_club_id;

  //       setActiveClubId(clubId);

  //       const role = auth.role?.[0] || auth.roleSuperAdmin?.[0] || null;
  //       setActiveRole(role);

  //       localStorage.setItem("activeClubId", clubId);
  //       if (role) {
  //         localStorage.setItem("activeRole", role);
  //       }
  //     }

  //     setLoading(false);
  //   }

  //   setLoading(false);
  // }, [auth, setActiveClubId, setActiveRole]);
  useEffect(() => {
    if (auth?.isLogin) {
      const savedRole = localStorage.getItem("activeRole");
      const savedClubId = localStorage.getItem("activeClubId");

      if (savedRole && (savedClubId || savedRole === "super_admin")) {
        setActiveRole(savedRole);
        if (savedClubId) setActiveClubId(savedClubId);
        setLoading(false);
        return;
      }

      const role = auth.roleSuperAdmin?.[0] || auth.role?.[0] || null;

      if (role === "super_admin") {
        setActiveRole("super_admin");
        localStorage.setItem("activeRole", "super_admin");
      } else if (auth.user?.current_club_id) {
        const clubId = auth.user.current_club_id;
        setActiveClubId(clubId);
        setActiveRole(role);

        localStorage.setItem("activeClubId", clubId);
        if (role) localStorage.setItem("activeRole", role);
      }

      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [auth, setActiveClubId, setActiveRole]);
  //////////////////////////////////////////////////////////////////////////////////
  //   EFFECTS TO SWITCH ROLE
  //////////////////////////////////////////////////////////////////////////////////

  const switchRole = useCallback((newClubId, roleName) => {
    setActiveClubId(newClubId);
    setActiveRole(roleName);
    localStorage.setItem("activeClubId", newClubId);
    localStorage.setItem("activeRole", roleName);
    // navigate("/dashboard");
  }, []);

  useEffect(() => {
    console.log("auth updated:", auth);
  }, [auth]);

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

    if (Array.isArray(auth.memberships) && auth.memberships.length > 0) {
      localStorage.setItem("memberships", JSON.stringify(auth.memberships));
    } else {
      localStorage.removeItem("memberships");
    }
  }, [auth]);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO UPDATE AUTH STATE
  //////////////////////////////////////////////////////////////////////////////////

  const setAuthData = useCallback(
    (token, user, role = [], memberships = [], roleSuperAdmin = []) => {
      setAuth({
        token,
        user,
        role,
        roleSuperAdmin,
        memberships,
        isLogin: true,
      });
    },
    [],
  );
  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTION TO CLEAR AUTH DATA
  //////////////////////////////////////////////////////////////////////////////////

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleSuperAdmin");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeClubId");
    localStorage.removeItem("memberships");
    setAuth({
      token: null,
      user: null,
      role: [],
      isLogin: false,
      memberships: [],
      roleSuperAdmin: [],
    });
    setActiveRole(null);
    setActiveClubId(null);
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
      const res = await Instance.post("api/membres/leagues", userData);
      console.log("membre enregistré avec succès", res);
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

      const { token, user, role, memberships, roleSuperAdmin } = res.data;

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
      const saveMemberships = Array.isArray(memberships) ? memberships : [];

      setAuthData(token, user, saveRole, saveMemberships, saveRoleSuperAdmin);

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
      if (newData.memberships)
        localStorage.setItem(
          "memberships",
          JSON.stringify(newData.memberships),
        );
      if (newData.role)
        localStorage.setItem("role", JSON.stringify(newData.role));

      return updated;
    });

    // on Gére le club actif immédiatement
    if (newData.user?.current_club_id) {
      const clubId = newData.user.current_club_id;
      setActiveClubId(clubId);
      localStorage.setItem("activeClubId", clubId);
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
      switchRole,
      activeRole,
      activeClubId,
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
      switchRole,
      activeRole,
      activeClubId,
      updateAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
