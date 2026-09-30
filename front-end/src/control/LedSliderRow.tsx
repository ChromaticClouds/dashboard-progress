import React from "react";

type LedSliderRowProps = {
  label: string;
  value: number;
  showValue: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  disabled: boolean;
};

const LedSliderRow = ({
  label,
  value,
  showValue,
  onChange,
  onBlur,
  disabled,
}: LedSliderRowProps) => (
  <>
    <h4 className="disc">{label}</h4>
    <div className="range">
      <div className="slider-value">
        <span
          className={showValue ? "show" : ""}
          style={{ left: `${(value / 5) * 100}%` }}
        >
          {value}
        </span>
      </div>
      <div className="field">
        <div className="value left">0</div>
        <input
          type="range"
          min="0"
          max="5"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        />
        <div className="value right">5</div>
      </div>
    </div>
  </>
);

export default LedSliderRow;
