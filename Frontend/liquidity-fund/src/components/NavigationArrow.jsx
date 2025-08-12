import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NavigationArrow({ label = "Back", to = -1 }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="nav-arrow flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 hover:bg-blue-100 text-blue-700 font-semibold shadow transition-all duration-200"
    >
      <ArrowLeft className="arrow-icon" size={22} />
      <span>{label}</span>
    </button>
  );
}
