import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    const profile = localStorage.getItem("profile");

    if (access && refresh && profile) {
      setIsAuth(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
