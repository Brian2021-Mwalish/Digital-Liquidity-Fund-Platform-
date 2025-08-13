import React from "react";
import clsx from "clsx";

export function Button({ children, className, variant = "primary", ...props }) {
  const baseStyles =
    "px-4 py-2 rounded font-medium focus:outline-none transition-colors duration-200";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border border-gray-300 text-gray-800 hover:bg-gray-100 bg-transparent",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
