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
import EmailVerificationBanner from "../component/EmailVerificationBanner";

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
  federations: safeParseJSON("federations", []),
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
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);

  // Signal global émis par l'interceptor axios (Axios.jsx) sur n'importe quelle
  // route protégée par le middleware 'verified' : le composant appelant n'a pas
  // besoin de savoir gérer ce cas, on l'affiche une seule fois ici pour toute l'app.
  useEffect(() => {
    const handler = () => setEmailVerificationRequired(true);
    window.addEventListener("email-not-verified", handler);
    return () => window.removeEventListener("email-not-verified", handler);
  }, []);

  //  ////////////////////////////////////////////////////////////////////////////////
  //   EFFECTS TO INITIALIZE ACTIVE ROLE AND CLUB ID
  //////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (auth?.isLogin) {
      const savedRole = localStorage.getItem("activeRole");
      const savedId = localStorage.getItem("activeId");
      const savedType = localStorage.getItem("activeType");

      // Rôle réel de l'utilisateur pour une organisation donnée, d'après les
      // données fraîches de CE login — pas ce qui était en cache. Un compte
      // déjà connu (ex: admin d'un club) peut recevoir un nouveau rôle
      // ailleurs (ex: arbitre d'une fédération) sans que le cache
      // localStorage ne le sache jamais.
      const freshRoleFor = (id, type) => {
        const list =
          type === "Federation"
            ? auth.federations
            : type === "Ligue" || type === "League"
              ? auth.leagues
              : type === "Club"
                ? auth.clubs
                : [];
        return list?.find((org) => org.id === id)?.role?.[0] || null;
      };

      // Rang de priorité par type d'organisation — même ordre que
      // LoginController::sessionPayload() côté backend (Fédération > Ligue >
      // Club) : plus la valeur est basse, plus l'organisation est
      // prioritaire par défaut.
      const RANG_TYPE = { Federation: 0, Ligue: 1, League: 1, Club: 2 };

      let idealRole = null;
      let idealId = null;
      let idealType = "Club";

      if (
        auth.user?.current_federation_id &&
        freshRoleFor(auth.user.current_federation_id, "Federation")
      ) {
        idealId = auth.user.current_federation_id;
        idealType = "Federation";
        idealRole = freshRoleFor(idealId, idealType);
      } else if (
        auth.user?.current_league_id &&
        freshRoleFor(auth.user.current_league_id, "Ligue")
      ) {
        idealId = auth.user.current_league_id;
        idealType = "Ligue";
        idealRole = freshRoleFor(idealId, idealType);
      } else if (
        auth.user?.current_club_id &&
        freshRoleFor(auth.user.current_club_id, "Club")
      ) {
        idealId = auth.user.current_club_id;
        idealType = "Club";
        idealRole = freshRoleFor(idealId, idealType);
      }

      // 1. Cache présent : on ne le restaure QUE s'il correspond encore à un
      // rôle réel (pas périmé) ET qu'aucune organisation plus prioritaire
      // n'est apparue depuis (ex: un admin de club devenu arbitre d'une
      // ligue/fédération doit voir ce nouveau rôle par défaut, pas rester
      // bloqué sur son ancien contexte en cache indéfiniment). Une bascule
      // manuelle vers une organisation de priorité égale ou supérieure à
      // l'idéal reste elle bien respectée.
      if (savedRole && (savedId || savedRole === "super_admin")) {
        const cacheEncoreValide =
          savedRole === "super_admin" ||
          freshRoleFor(savedId, savedType) === savedRole;

        const rangCache = RANG_TYPE[savedType] ?? 99;
        const rangIdeal = idealId ? (RANG_TYPE[idealType] ?? 99) : 99;
        const cachePasDepasse = rangCache <= rangIdeal;

        if (
          cacheEncoreValide &&
          (savedRole === "super_admin" || cachePasDepasse)
        ) {
          setActiveRole(savedRole);
          setActiveId(savedId);
          setActiveType(savedType || "Club");
          setLoading(false);
          return;
        }
      }

      // 2. Sinon (pas de cache, cache périmé, ou organisation plus
      // prioritaire apparue depuis), on utilise l'idéal calculé ci-dessus.
      if (auth.roleSuperAdmin?.[0] === "super_admin") {
        setActiveRole("super_admin");
        localStorage.setItem("activeRole", "super_admin");
      } else if (idealId) {
        setActiveId(idealId);
        setActiveType(idealType);
        setActiveRole(idealRole);
        localStorage.setItem("activeId", idealId);
        localStorage.setItem("activeType", idealType);
        localStorage.setItem("activeRole", idealRole);
      }

      setLoading(false);
    } else {
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLogin, auth.clubs, auth.leagues, auth.federations]);

  const switchPortal = useCallback(
    (id, type, roleName) => {
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
    },
    [navigate],
  );

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
    if (Array.isArray(auth.federations) && auth.federations.length > 0) {
      localStorage.setItem("federations", JSON.stringify(auth.federations));
    } else {
      localStorage.removeItem("federations");
    }
  }, [auth]);

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTIONS TO UPDATE AUTH STATE
  //////////////////////////////////////////////////////////////////////////////////

  const setAuthData = useCallback(
    (
      token,
      user,
      role = [],
      clubs = [],
      leagues = [],
      federations = [],
      roleSuperAdmin = [],
    ) => {
      setAuth({
        token,
        user,
        role,
        roleSuperAdmin,
        clubs,
        leagues,
        federations,
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
        // Appel à ton contrôleur propre
        const res = await Instance.get("/api/user");
        const { user, role, clubs, leagues, federations } = res.data;

        // On distribue proprement au lieu de tout écraser dans "user" !
        setAuth((prev) => ({
          ...prev,
          user: user,
          role: Array.isArray(role) ? role : prev.role,
          clubs: Array.isArray(clubs) ? clubs : prev.clubs,
          leagues: Array.isArray(leagues) ? leagues : prev.leagues,
          federations: Array.isArray(federations)
            ? federations
            : prev.federations,
          isLogin: true,
        }));
        console.log("VERIFY USER", res.data);
      } catch (error) {
        console.error("Token expiré ou invalide au démarrage :", error);
        // On ne clear TOUT le localStorage que si c'est une vraie erreur 401/403
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          localStorage.clear();
          setAuth({
            token: null,
            user: null,
            role: [],
            roleSuperAdmin: [],
            clubs: [],
            leagues: [],
            federations: [],
            isLogin: false,
          });
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleSuperAdmin");
    localStorage.removeItem("activeRole");
    localStorage.removeItem("activeId");
    localStorage.removeItem("activeType");
    localStorage.removeItem("clubs");
    localStorage.removeItem("leagues");
    localStorage.removeItem("federations");
    setAuth({
      token: null,
      user: null,
      role: [],
      isLogin: false,
      clubs: [],
      leagues: [],
      federations: [],
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

        navigate("/login?registered=1");
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

  const StoreFederationUser = useCallback(async (userData) => {
    try {
      const res = await Instance.post("api/membres/federation", userData);
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
  // Factorisé car réutilisé par login() (compte sans 2FA) et verifyTwoFactor()
  // (étape 2 du login quand la 2FA est active) : les deux endpoints renvoient
  // exactement la même forme de réponse (voir LoginController::sessionPayload
  // côté backend).
  const applySessionData = useCallback(
    (data) => {
      const { token, user, role, clubs, leagues, federations, roleSuperAdmin } =
        data;

      const saveRoleSuperAdmin = Array.isArray(roleSuperAdmin)
        ? roleSuperAdmin
        : [];
      const saveRole = Array.isArray(role) ? role : [];
      const saveClubs = Array.isArray(clubs) ? clubs : [];
      const saveLeagues = Array.isArray(leagues) ? leagues : [];
      const saveFederations = Array.isArray(federations) ? federations : [];

      setAuthData(
        token,
        user,
        saveRole,
        saveClubs,
        saveLeagues,
        saveFederations,
        saveRoleSuperAdmin,
      );

      const hasRole =
        (Array.isArray(saveRole) && saveRole.length > 0) ||
        saveRoleSuperAdmin.length > 0;
      navigate(hasRole ? "/dashboard" : "/");

      return user;
    },
    [navigate, setAuthData],
  );

  const login = useCallback(
    async (credentials) => {
      const res = await Instance.post("api/login", credentials);

      if (res.data.two_factor) {
        // Pas de session ouverte pour l'instant : juste le jeton temporaire
        // que verifyTwoFactor() devra échanger contre la vraie session.
        return {
          success: true,
          twoFactor: true,
          challengeToken: res.data.token,
        };
      }

      if (!res.data.token) {
        throw {
          response: {
            status: 401,
            data: { message: "Identifiants incorrects" },
          },
        };
      }

      const user = applySessionData(res.data);

      return { success: true, twoFactor: false, user };
    },
    [applySessionData],
  );

  //////////////////////////////////////////////////////////////////////////////////
  //   FUNCTION TO VERIFY THE 2FA CHALLENGE (ÉTAPE 2 DU LOGIN)
  //////////////////////////////////////////////////////////////////////////////////
  const verifyTwoFactor = useCallback(
    async (challengeToken, credentials) => {
      const res = await Instance.post("api/2fa/challenge", {
        token: challengeToken,
        ...credentials,
      });

      return applySessionData(res.data);
    },
    [applySessionData],
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
      const { role, user, clubs, leagues, federations } = res.data;
      console.log("me", res.data);

      // On synchronise le localStorage IMMÉDIATEMENT avec les nouvelles données du serveur
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", JSON.stringify(role));
      if (clubs) localStorage.setItem("clubs", JSON.stringify(clubs));
      if (leagues) localStorage.setItem("leagues", JSON.stringify(leagues));
      if (federations)
        localStorage.setItem("federations", JSON.stringify(federations));

      setAuth((prev) => ({
        ...prev,
        user: user,
        role: Array.isArray(role) ? role : [],
        clubs: Array.isArray(clubs) ? clubs : prev.clubs,
        leagues: Array.isArray(leagues) ? leagues : prev.leagues,
        federations: Array.isArray(federations)
          ? federations
          : prev.federations,
        isLogin: true,
      }));
    } catch (error) {
      // Si l'authentification a expiré, on nettoie tout proprement
      localStorage.clear();
      setAuth({
        token: null,
        user: null,
        role: [],
        roleSuperAdmin: [],
        clubs: [],
        leagues: [],
        federations: [],
        isLogin: false,
      });
      navigate("/login");
    }
  }, [setAuth, navigate]);

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
      if (newData.leagues)
        localStorage.setItem("leagues", JSON.stringify(newData.leagues));
      if (newData.federations)
        localStorage.setItem(
          "federations",
          JSON.stringify(newData.federations),
        );
      return updated;
    });

    // on Gère le contexte actif (club / ligue / fédération) de façon explicite et atomique
    if (newData.activeContext) {
      const { type, id } = newData.activeContext;
      setActiveId(id);
      setActiveType(type);
      localStorage.setItem("activeId", id);
      localStorage.setItem("activeType", type);
    }

    if (newData.activeRole) {
      setActiveRole(newData.activeRole);
      localStorage.setItem("activeRole", newData.activeRole);
    }
  }, []);

  const currentClub = useMemo(() => {
    if (activeType === "Club" && activeId) {
      return auth.clubs.find((c) => c.id === activeId) || null;
    }
    return null;
  }, [activeType, activeId, auth.clubs]);

  // Si le type actif est "Ligue", on cherche l'objet complet dans le tableau auth.leagues
  const currentLeague = useMemo(() => {
    if (activeType === "Ligue" && activeId) {
      return auth.leagues.find((l) => l.id === activeId) || null;
    }
    return null;
  }, [activeType, activeId, auth.leagues]);

  // Futur : Prêt pour les fédérations le moment venu !
  const currentFederation = useMemo(() => {
    if (activeType === "Federation" && activeId) {
      return auth.federations?.find((f) => f.id === activeId) || null;
    }
    return null;
  }, [activeType, activeId, auth.federations]);

  const invitationCode = useMemo(() => {
    if (currentLeague) {
      return currentLeague.invitation_code;
    } else if (currentFederation) {
      return currentFederation.invitation_code;
    }
    return "";
  }, [currentLeague, currentFederation]);
  //////////////////////////////////////////////////////////////////////////////////
  //   USE MEMO TO RETURN AUTH CONTEXT
  //////////////////////////////////////////////////////////////////////////////////
  const value = useMemo(
    () => ({
      auth,
      register,
      StoreClubMember,
      StoreLeagueUser,
      StoreFederationUser,
      login,
      verifyTwoFactor,
      logout,
      loading,
      refreshUser,
      switchPortal,
      activeRole,
      activeId,
      activeType,
      updateAuth,
      currentClub,
      currentLeague,
      currentFederation,
      invitationCode,
    }),
    [
      auth,
      register,
      StoreClubMember,
      StoreLeagueUser,
      StoreFederationUser,
      login,
      verifyTwoFactor,
      logout,
      loading,
      refreshUser,
      switchPortal,
      activeRole,
      activeId,
      activeType,
      updateAuth,
      currentClub,
      currentLeague,
      currentFederation,
      invitationCode,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {emailVerificationRequired && (
        <EmailVerificationBanner
          onClose={() => setEmailVerificationRequired(false)}
        />
      )}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
