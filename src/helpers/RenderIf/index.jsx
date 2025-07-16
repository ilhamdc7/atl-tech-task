import React from "react";

export const RenderIf = ({ children, condition }) => {
  return condition && children;
};
