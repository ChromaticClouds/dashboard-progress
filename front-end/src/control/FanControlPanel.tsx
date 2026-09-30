import React from "react";
import BulletChart from "../../chart/BulletChart";
import BulletChart2 from "../../chart/BulletChart2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type FanControlPanelProps = {
  checked: boolean;
  temperatureValue: number;
  humidityValue: number;
  temperatureChartData: Array<unknown>;
  humidityChartData: Array<unknown>;
  heatDisc: number[];
  coolDisc: number[];
  desiredHeat: () => number;
  desiredCool: () => number;
  heaterOperate: boolean;
  coolerOperate: boolean;
  heatElementStyle: (grade: number) => string;
  coolElementStyle: (grade: number) => string;
  sliderX: number;
  sliderX2: number;
  startDragHeat: (event: React.MouseEvent<HTMLDivElement>) => void;
  startDragCool: (event: React.MouseEvent<HTMLDivElement>) => void;
  stopDrag: () => void;
  handleMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  toggleHeaterPower: () => void;
  toggleCoolerPower: () => void;
};

const FanControlPanel = ({
  checked,
  temperatureValue,
  humidityValue,
  temperatureChartData,
  humidityChartData,
  heatDisc,
  coolDisc,
  desiredHeat,
  desiredCool,
  heaterOperate,
  coolerOperate,
  heatElementStyle,
  coolElementStyle,
  sliderX,
  sliderX2,
  startDragHeat,
  startDragCool,
  stopDrag,
  handleMouseMove,
  toggleHeaterPower,
  toggleCoolerPower,
}: FanControlPanelProps) => (
  <div
    className="fan-container"
    onMouseMove={handleMouseMove}
    onMouseUp={stopDrag}
  >
    <div className="sort">
      <div>
        <div className="name">Temperature & Humidity Status</div>
        <div className="sort">
          <div className="container">
            <div className="temp-bar bar-box">
              <div className="status">
                <p>temperature</p>
                <div className="value">{temperatureValue} °C</div>
              </div>
              <div className="chart">
                <div className="length">
                  <BulletChart data={temperatureChartData} />
                </div>
              </div>
            </div>
            <div className="humid-bar bar-box">
              <div className="status">
                <p>humidity</p>
                <div className="value">{humidityValue} %</div>
              </div>
              <div className="chart">
                <div className="length">
                  <BulletChart2 data={humidityChartData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="border">
          <div className="name">Fan Control</div>
          <div className="sort">
            <div className="heater device">
              <div className="disc">
                <p>Heater</p>
                <span className="set-value">{desiredHeat().toFixed(0)} °C</span>
              </div>
              <div className={heaterOperate ? "button-on" : "button-off"}>
                <button
                  className={
                    heaterOperate ? "inner-button-on" : "inner-button-off"
                  }
                  disabled={!checked}
                >
                  <FontAwesomeIcon
                    icon={["fas", "arrows-rotate"] as IconProp}
                    style={{ transform: "rotate(45deg)" }}
                    onClick={toggleHeaterPower}
                    className={heaterOperate ? "rotate-on" : ""}
                  />
                </button>
              </div>
              <div className="temperature-graduation">
                {heatDisc.map((grade, index) => (
                  <span
                    key={index}
                    className="temperature-element"
                    style={{ transform: `${heatElementStyle(grade)}` }}
                  >
                    <div className="point">
                      <span className="number">{grade}</span>
                      <span className="line">|</span>
                    </div>
                  </span>
                ))}
              </div>
              <div className="lower-container">
                <div
                  className="slider-container"
                  style={{ transform: `translate3d(${sliderX}px, 0, 0)` }}
                >
                  <svg
                    width="150"
                    height="30"
                    viewBox="0 0 150 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M74.3132 0C47.0043 2.44032e-05 50.175 30 7.9179 30H144.27C99.4571 30 101.622 -2.44032e-05 74.3132 0Z"
                      transform="translate(-7.38794 -0.1)"
                      fill="#9ecddb"
                    />
                  </svg>
                  <div className="slider-button" onMouseDown={startDragHeat}>
                    <FontAwesomeIcon
                      icon={["fas", "thermometer-empty"] as IconProp}
                      className="slider-icon"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="cooling-fan device">
              <div className="disc">
                <p>Cooling Fan</p>
                <span className="set-value">{desiredCool().toFixed(0)} °C</span>
              </div>
              <div className={coolerOperate ? "button-on" : "button-off"}>
                <button
                  className={
                    coolerOperate ? "inner-button-on" : "inner-button-off"
                  }
                  disabled={!checked}
                >
                  <FontAwesomeIcon
                    icon={["fas", "arrows-rotate"] as IconProp}
                    style={{ transform: "rotate(45deg)" }}
                    onClick={toggleCoolerPower}
                    className={coolerOperate ? "rotate-on" : ""}
                  />
                </button>
              </div>
              <div className="temperature-graduation">
                {coolDisc.map((grade, index) => (
                  <span
                    key={index}
                    className="temperature-element"
                    style={{ transform: `${coolElementStyle(grade)}` }}
                  >
                    <div className="point">
                      <span className="number">{grade}</span>
                      <span className="line">|</span>
                    </div>
                  </span>
                ))}
              </div>
              <div className="lower-container">
                <div
                  className="slider-container"
                  style={{ transform: `translate3d(${sliderX2}px, 0, 0)` }}
                >
                  <svg
                    width="150"
                    height="30"
                    viewBox="0 0 150 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M74.3132 0C47.0043 2.44032e-05 50.175 30 7.9179 30H144.27C99.4571 30 101.622 -2.44032e-05 74.3132 0Z"
                      transform="translate(-7.38794 -0.1)"
                      fill="#9ecddb"
                    />
                  </svg>
                  <div className="slider-button" onMouseDown={startDragCool}>
                    <FontAwesomeIcon
                      icon={["fas", "thermometer-empty"] as IconProp}
                      className="slider-icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FanControlPanel;
