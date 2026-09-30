import React from "react";
import PumpSliderRow from "./PumpSliderRow";
import WaterStatusCard from "./WaterStatusCard";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type WaterPumpControlPanelProps = {
  checked: boolean;
  intensity: number;
  duration: number;
  onIntensityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPush: () => void;
  waterLevel: number;
  isPushed: boolean;
  soilHumidity: number;
  lastWateredText: string;
};

const WaterPumpControlPanel = ({
  checked,
  intensity,
  duration,
  onIntensityChange,
  onDurationChange,
  onPush,
  waterLevel,
  isPushed,
  soilHumidity,
  lastWateredText,
}: WaterPumpControlPanelProps) => (
  <div className="control-panel-sort">
    <h4 className="disc">Waterpump Control</h4>
    <div className="waterpump">
      <PumpSliderRow
        label="intensity"
        value={intensity}
        onChange={onIntensityChange}
        icon={["fas", "bolt"] as IconProp}
        disabled={!checked}
      />
      <PumpSliderRow
        label="duration"
        value={duration}
        onChange={onDurationChange}
        icon={["fas", "hourglass-end"] as IconProp}
        disabled={!checked}
      />
      <WaterStatusCard
        waterLevel={waterLevel}
        isPushed={isPushed}
        onPush={onPush}
        soilHumidity={soilHumidity}
        lastWateredText={lastWateredText}
      />
    </div>
  </div>
);

export default WaterPumpControlPanel;
