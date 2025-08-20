import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useSessionTracker() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSessions = useCallback(async () => {
    const accessToken = localStorage.getItem("jwt");

    if (!accessToken) {
      setError("No access token provided. Redirecting to login...");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/sessions/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        setError("Unauthorized. Redirecting to login...");
        localStorage.removeItem("jwt");
        localStorage.removeItem("client_name");
        navigate("/login");
        return;
      }

      const data = await res.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error fetching sessions");
    }
  }, [navigate]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return { sessions, refreshSessions: fetchSessions, error };
}
