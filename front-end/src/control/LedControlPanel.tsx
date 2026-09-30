import React from "react";
import LedSliderRow from "./LedSliderRow";

type LedControlPanelProps = {
  checked: boolean;
  sliderValues: number[];
  showSliderValues: boolean[];
  onSliderChange: (
    index: number,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderBlur: (index: number) => () => void;
};

const LedControlPanel = ({
  checked,
  sliderValues,
  showSliderValues,
  onSliderChange,
  onSliderBlur,
}: LedControlPanelProps) => (
  <div>
    <LedSliderRow
      label="LED1 Control"
      value={sliderValues[0]}
      showValue={showSliderValues[0]}
      onChange={onSliderChange(0)}
      onBlur={onSliderBlur(0)}
      disabled={!checked}
    />
    <LedSliderRow
      label="LED2 Control"
      value={sliderValues[1]}
      showValue={showSliderValues[1]}
      onChange={onSliderChange(1)}
      onBlur={onSliderBlur(1)}
      disabled={!checked}
    />
    <LedSliderRow
      label="LED3 Control"
      value={sliderValues[2]}
      showValue={showSliderValues[2]}
      onChange={onSliderChange(2)}
      onBlur={onSliderBlur(2)}
      disabled={!checked}
    />
  </div>
);

export default LedControlPanel;
