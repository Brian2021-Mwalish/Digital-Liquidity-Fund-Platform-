import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch, API_BASE_URL } from "../lib/api";

const RequireAuth = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthAndMaintenance = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      const profile = localStorage.getItem("profile");

      if (access && refresh && profile) {
        setIsAuth(true);
        // Fetch user profile to check admin status
        try {
          const profileRes = await apiFetch("auth/profile/");
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setIsAdmin(profileData.is_staff || profileData.is_superuser || false);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
        // Check maintenance mode
        try {
          const res = await apiFetch("support/maintenance/");
          if (res.ok) {
            const data = await res.json();
            setMaintenanceMode(data.maintenance_mode || false);
          }
        } catch (error) {
          console.error("Error fetching maintenance status:", error);
          // If fetch fails, assume no maintenance
        }
      }
      setLoading(false);
    };

    checkAuthAndMaintenance();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">System Maintenance</h1>
          <p className="text-gray-600 mb-6">The system is currently under maintenance. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireAuth;
