import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { Icon } from "../icon/Icon";

type WaterStatusCardProps = {
  waterLevel: number;
  isPushed: boolean;
  onPush: () => void;
  soilHumidity: number;
  lastWateredText: string;
};

const WaterStatusCard = ({
  waterLevel,
  isPushed,
  onPush,
  soilHumidity,
  lastWateredText,
}: WaterStatusCardProps) => (
  <div className="container sort">
    <div className="circle">
      <div className="skill">
        <div className="outer">
          <div className="inner">
            <div className={isPushed ? "pushed" : "number"} onClick={onPush}>
              {waterLevel.toFixed(1)} %<div className="disc">Water Level</div>
            </div>
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="280px"
          height="280px"
        >
          <defs>
            <linearGradient id="GradientColor">
              <stop offset="0%" stopColor="#4353a6" />
              <stop offset="100%" stopColor="#3da0be" />
            </linearGradient>
          </defs>
          <circle
            cx="130"
            cy="130"
            r="115"
            strokeLinecap="round"
            style={{ strokeDashoffset: `${waterLevel * 7.22 + 100 * 7.22}` }}
          ></circle>
        </svg>
      </div>
    </div>
    <div className="status-container">
      <div className="status-manage">
        <div className="status-box class1">
          <FontAwesomeIcon
            icon={["fas", "seedling"] as IconProp}
            className="status-icon"
          />
        </div>
        <div className="text-box">
          <p>soil humidity</p>
          <span>{soilHumidity} %</span>
        </div>
      </div>
      <div className="line"></div>
      <div className="status-manage">
        <div className="status-box class2">
          <Icon iconName="ClockHistory" className="status-icon" />
        </div>
        <div className="text-box">
          <p>watered</p>
          <span>{lastWateredText}</span>
        </div>
      </div>
    </div>
  </div>
);

export default WaterStatusCard;
