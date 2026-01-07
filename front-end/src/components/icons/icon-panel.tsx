import { useEffect, useState } from "react";
import { icons } from "../../data/icon";
import Tooltip from "../Tooltip/Tooltip";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AiOutlineOpenAI } from "react-icons/ai";
import { Logout } from "../Login/Logout";
import { NotificationBox } from "../Notification/NotificationBox";
import useGptReqeust from "../../Video/Prediction/hooks/useGptRequest";
import useNoticeStore from "../../hooks/notification/store/useNoticeStore";
import useClickStore from "../../hooks/store/useClickStore";
import usePredictStore from "../../Video/Prediction/hooks/store/usePredictStore";
import { useIcon } from "../../hooks/use-icon";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { IconBlock } from "@components/icons/icon-block";

export const IconPanel = (): JSX.Element => {
  const hostGpt = useGptReqeust();

  const { iconIndex, iconClick } = useIcon();

  const { notifications } = useNoticeStore();
  const { setIsOpened, setInitialClick } = useClickStore();
  const [isClicked, setIsClicked] = useState<boolean>(false); /* 노티피케이션 알림 클릭 여부 */
  const [isEntered, setIsEntered] = useState<boolean>(false);

  useEffect(() => {
    setIsOpened(isClicked);
  }, [isClicked, setIsOpened]);

  const count = Array.isArray(notifications)
    ? notifications.filter((n) => !n?.isRead).length
    : 0;

  const unreadCount = count > 99 ? "99+" : count;
  const hasUnread = count > 0;

  const { gptHosted, setGptHosted } = useClickStore();
  const { data: predictionData } = usePredictStore();

  return (
    <div className="icon-panel">
      <div className="icons-bar">
        <div className="icons">
          {icons.map((v, i) => <IconBlock icons={v} index={i}/>)}
          <div>
            <p className={`notice-count ${hasUnread ? "exist" : ""}`}>
              {unreadCount}
            </p>
            <Tooltip text="Alarm">
              <button
                className={`${isClicked ? "clicked icon" : "icon"}`}
                onClick={() => {
                  setIsClicked(!isClicked);
                  setInitialClick(true);
                }}
                onMouseEnter={() => setIsEntered(true)}
                onMouseLeave={() => setIsEntered(false)}
              >
                <FontAwesomeIcon icon={faBell} />
              </button>
            </Tooltip>
            <div className="notice">
              <NotificationBox
                popupStatus={setIsClicked}
                enterEvent={isEntered}
              />
            </div>
          </div>
          <div className="openai">
            <Tooltip text="OpenAI">
              <button
                className={gptHosted ? "clicked icon" : "icon"}
                onClick={() => {
                  setGptHosted(true);
                  hostGpt(predictionData);
                }}
              >
                <AiOutlineOpenAI />
              </button>
            </Tooltip>
          </div>
          <div className="logout">
            <Tooltip text="Logout">
              <Logout />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}