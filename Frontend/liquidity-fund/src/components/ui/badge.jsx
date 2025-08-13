import React from "react";
import clsx from "clsx";

export function Badge({ children, color = "blue", className }) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={clsx(
        "px-2 py-0.5 text-xs font-semibold rounded-full",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
