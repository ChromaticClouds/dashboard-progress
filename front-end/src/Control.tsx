import React from "react";
import "./Control.css";

import useControlLogic from "./control/useControlLogic";
import ControlModeToggle from "./control/ControlModeToggle";
import LedControlPanel from "./control/LedControlPanel";
import WaterPumpControlPanel from "./control/WaterPumpControlPanel";
import FanControlPanel from "./control/FanControlPanel";

const Control = () => {
  const { mode, led, waterPump, fan, sensorStatus } = useControlLogic();

  return (
    <div className="board">
      <div className="sub-contents">
        <h4 className="subtitle">Control Panel</h4>
        <ControlModeToggle
          checked={mode.checked}
          onToggle={mode.handleModeToggle}
        />
        <div style={{ display: "flex" }}>
          <div>
            <LedControlPanel
              checked={mode.checked}
              sliderValues={led.sliderValues}
              showSliderValues={led.showSliderValues}
              onSliderChange={led.handleSliderChange}
              onSliderBlur={led.handleSliderBlur}
            />
          </div>
          <WaterPumpControlPanel
            checked={mode.checked}
            intensity={waterPump.intensity}
            duration={waterPump.duration}
            onIntensityChange={waterPump.handleIntensityChange}
            onDurationChange={waterPump.handleDurationChange}
            onPush={waterPump.handlePush}
            waterLevel={waterPump.waterLevel}
            isPushed={waterPump.isPushed}
            soilHumidity={waterPump.soilHumidity}
            lastWateredText={waterPump.lastWateredText}
          />
          <div className="rail-sort">
            <h4 className="disc">Linear Rail Control</h4>
            <div className="linear-rail"></div>
          </div>
        </div>
        <div className="division"></div>
        <FanControlPanel
          checked={mode.checked}
          temperatureValue={sensorStatus.sensorData.temperature ?? 0}
          humidityValue={sensorStatus.sensorData.humidity ?? 0}
          temperatureChartData={sensorStatus.temperatureChartData}
          humidityChartData={sensorStatus.humidityChartData}
          heatDisc={fan.heatDisc}
          coolDisc={fan.coolDisc}
          desiredHeat={fan.desiredHeat}
          desiredCool={fan.desiredCool}
          heaterOperate={fan.heaterOperate}
          coolerOperate={fan.coolerOperate}
          heatElementStyle={fan.heatElementStyle}
          coolElementStyle={fan.coolElementStyle}
          sliderX={fan.sliderX}
          sliderX2={fan.sliderX2}
          startDragHeat={fan.startDragHeat}
          startDragCool={fan.startDragCool}
          stopDrag={fan.stopDrag}
          handleMouseMove={fan.handleMouseMove}
          toggleHeaterPower={fan.toggleHeaterPower}
          toggleCoolerPower={fan.toggleCoolerPower}
        />
      </div>
    </div>
  );
};

export default Control;
