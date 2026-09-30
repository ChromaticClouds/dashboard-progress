import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type PumpSliderRowProps = {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: IconProp;
  disabled: boolean;
};

const PumpSliderRow = ({
  label,
  value,
  onChange,
  icon,
  disabled,
}: PumpSliderRowProps) => (
  <div className="container">
    <div className="box">
      <div className="value">{value}</div>
      <div className="field">
        <div className="top">+</div>
        <input
          type="range"
          min="0"
          max="5"
          onChange={onChange}
          value={value}
          disabled={disabled}
        />
        <progress max={5} value={value}></progress>
        <div className="bottom">-</div>
      </div>
    </div>
    <div className="status">
      <FontAwesomeIcon icon={icon} className="status-icon" />
      <div className="name">{label}</div>
    </div>
  </div>
);

export default PumpSliderRow;
