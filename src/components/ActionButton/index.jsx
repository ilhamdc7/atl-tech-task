import React from "react";

export const ActionButton = ({ children, color, onClick }) => {
  return (
    <button
      style={{
        background: color,
        borderRadius: "50%",
        width: "10vh",
        height: "10vh",
        borderStyle: "none",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
