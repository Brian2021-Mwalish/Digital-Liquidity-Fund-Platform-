import React from "react";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RequireAuth;
