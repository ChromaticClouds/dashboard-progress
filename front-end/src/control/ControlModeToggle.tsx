import React, { ChangeEvent } from "react";

type ControlModeToggleProps = {
  checked: boolean;
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void;
};

const ControlModeToggle = ({ checked, onToggle }: ControlModeToggleProps) => (
  <div className="control-container">
    <div className="control">
      <p style={{ color: checked ? "#3648d2" : "#978d83" }}>
        {checked ? "Manual" : "Auto"}
      </p>
      <div className="field">
        <input
          type="checkbox"
          id="check"
          checked={checked}
          onChange={onToggle}
        />
        <label htmlFor="check" className="button"></label>
      </div>
    </div>
  </div>
);

export default ControlModeToggle;
