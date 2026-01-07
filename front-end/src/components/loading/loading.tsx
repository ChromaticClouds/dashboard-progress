import React from "react";
import "./loading.css";

export const Loading = ({ color = "white" }: { color?: string }) => {
  return (
    <div className="loading-bind">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className={`loading-box ${color}`}
        ></div>
      ))}
    </div>
  );
};
