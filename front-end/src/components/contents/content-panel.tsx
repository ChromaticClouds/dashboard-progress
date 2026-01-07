import React, { useEffect, useState } from "react";
import Footer from "./Footer/Footer";
import Summary from "../dashboard/Summary";
import Chart from "../dashboard/Chart2";
import Control from "../dashboard/Control";
import Video from "../../Video/Stream/Video";
import Notification from "../Notification/Notification";
import AILoading from "../loading/AILoading";
import { icons } from "../../data/icon";
import { useIcon } from "../../hooks/use-icon";
import { WeatherIO } from "../weather/weather-io";

export const ContentPanel = (): JSX.Element => {
  const { setSectionRef } = useIcon();

  const [onCancel, setOnCancel] = useState(true);
  const [embed, setEmbed] = useState<JSX.Element>(<></>);
  const [embedError, setEmbedError] = useState(false);

  const elements = [
    <Summary />,
    <WeatherIO />,
    <Chart />,
    <Control />,
    <Video
      setEmbed={setEmbed}
      onCancel={setOnCancel}
      setEmbedError={setEmbedError}
    />,
  ];

  return (
    <div className="contents-panel">
      <div className="loading-bar">
        <AILoading />
      </div>
      <div className="pop-up">
        <Notification />
      </div>
      {icons.map((icon, index) => {
        return (
          <div
            key={index}
            className={`${icon.text.toLowerCase()}-dashboard content`}
            ref={(node) => setSectionRef(node, index)}
          >
            {elements[index]}
          </div>
        );
      })}
      <Footer />
    </div>
  );
};
