import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Instance } from "./Axios";

export const AxiosInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirecting = useRef(false);

  useEffect(() => {
    const interceptor = Instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          if (isRedirecting.current) return Promise.reject(error);

          if (location.pathname === "/login") {
            return Promise.reject(error);
          }

          isRedirecting.current = true;
          localStorage.clear();
          window.location.replace("/login");
          return;
        }

        if (status === 403) navigate("/403");
        if (status === 404) navigate("/404");

        return Promise.reject(error);
      },
    );

    return () => Instance.interceptors.response.eject(interceptor);
  }, [navigate, location.pathname]);

  return null;
};
