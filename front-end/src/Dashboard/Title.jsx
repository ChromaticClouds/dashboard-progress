import React, { useState, useEffect, useRef, useCallback } from "react";
import Tooltip from '../components/Tooltip/Tooltip';
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineOpenAI } from "react-icons/ai";

import useMonthEventStore from "../hooks/useMonthEvents";
import useTodoEvents from "../hooks/useTodoEvents";
import useNoticeStore from "../hooks/notification/store/useNoticeStore";
import useClickStore from "../hooks/store/useClickStore";
import useGptReqeust from "../Video/Prediction/hooks/useGptRequest";
import usePredictStore from "../Video/Prediction/hooks/store/usePredictStore";

import Expand from "../Video/Stream/Expand"
import TodoList from "../TodoList/TodoList";
import Summary from "./Summary";
import Control from "./Control";
import Chart from "./Chart2";
import Video from "../Video/Stream/Video"
import WeatherIO from "../Weather/WeatherIO";
import Footer from "../components/Footer/Footer";
import Notification from "../Notification/Notification";
import NotificationBox from "../Notification/NotificationBox";
import AILoading from "./Loading/AILoading";
import OpenAI from "../Video/Prediction/hooks/useOpenAi";
import Logout from "../Login/Logout";
import InfoContents from "../components/section/InfoContents";
import useSocket from "../hooks/socket/useSocket";
import useOpenAi from "../Video/Prediction/hooks/useOpenAi";

library.add(fas);

const Title = () => {
    const { events } = useMonthEventStore();
    const { getTodayTodos } = useTodoEvents();

    const [iconIndex, setIconIndex] = useState(parseInt(localStorage.getItem('icon-index')) || 0);

    /** 객체 형태로 아이콘 데이터 저장 */
    const icons = [
        { 
            icon: ["fas", "home"], 
            text: "Home", 
            sectionId: "jump_to1" 
        },
        { 
            icon: ["fas", "cloud"], 
            text: "Weather", 
            sectionId: "jump_to2" 
        },
        { 
            icon: ["fas", "chart-simple"], 
            text: "Chart", 
            sectionId: "jump_to3" 
        },
        { 
            icon: ["fas", "toggle-on"],
            text: "Control", 
            sectionId: "jump_to4" 
        },
        { 
            icon: ["fas", "video"], 
            text: "Video", 
            sectionId: "jump_to5" 
        },
    ];

    const sectionRefs = useRef([]);

    // 아이콘 클릭 핸들러
    const iconClick = (index) => {
        const sectionElement = sectionRefs.current[index];
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "smooth" });
        }
        localStorage.setItem('icon-index', index);
    };

    const setSectionRef = useCallback((node, index) => {
        if (node) {
            sectionRefs.current[index] = node;
        }
    }, []);

    let options = {
        threshold: 0.4,
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const visibleEntries = entries.filter(entry => entry.isIntersecting);
            if (visibleEntries.length > 0) {
                const firstVisibleEntry = visibleEntries[0];
                const index = sectionRefs.current.indexOf(firstVisibleEntry.target);
                if (index !== -1) {
                    setIconIndex(index);
                    localStorage.setItem('icon-index', index);
                }
            }
        }, options);

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            sectionRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [sectionRefs]);
    /**
     *  - # Video 컴포넌트 및 Embed 컴포넌트의 이벤트 관리 스테이트
     */
    const [onCancel, setOnCancel] = useState(true);
    const [embed, setEmbed] = useState(<div></div>);
    const [embedError, setEmbedError] = useState(false);
    /*-----------------------------------------------------------------------------*\
        # POST 요청 성공 시, GET 요청으로 title 컴포넌트의 todo list에 데이터 삽입 #
    \*-----------------------------------------------------------------------------*/
    useEffect(() => {
        getTodayTodos(new Date(), new Date());
    }, [events]); 
    /**
     *  - # OpenWeatherMap 데이터 props로 전달하기 위한 state 선언
     */
    const [weatherMap, setWeatherMap] = useState([]);
    
    const [isClicked, setIsClicked] = useState(false); /* 노티피케이션 알림 클릭 여부 */
    const [isEntered, setIsEntered] = useState(false);
    /** 
     * 노티피케이션 이벤트 관리 
     */
    const { setIsOpened, setInitialClick } = useClickStore();

    useEffect(() => {
        setIsOpened(isClicked);
    }, [isClicked, setIsOpened]);

    const { notifications } = useNoticeStore();

    const unreadCount = () => {
        const count = notifications.filter(notification => !notification.isRead).length;

        if (count > 99) {
            return '99+';
        }

        return count;
    }

    const count = unreadCount();

    const hasUnread = typeof count === "number" ? count !== 0 : count === "99+";
    /**
     * AI 요청 처리
     */
    useOpenAi();

    const { gptHosted, setGptHosted } = useClickStore();

    const { data: predictionData } = usePredictStore();
    const hostGpt = useGptReqeust();

    return (
        <div>
            <Expand 
                onEmbed = { embed }
                onCancel={ setOnCancel }
                isVisible={ onCancel }
                embedError={ embedError }
            />
            <TodoList />
            <div className = "ui-container">
                <div className = "icon-panel">
                    <div className="icons-bar">
                        <div className="icons">
                            {icons.map((icon, index) => (
                                <div key = { index } className = "icon-array">
                                    <Tooltip text={icon.text}>
                                        <FontAwesomeIcon
                                            icon={icon.icon}
                                            className={index === iconIndex ? "clicked_icon" : "icon"}
                                            onClick={() => iconClick(index)}
                                        />
                                    </Tooltip>
                                </div>
                            ))}
                            <div className="notice">
                                <p className={`notice-count ${hasUnread ? "exist" : ""}`}>
                                    {count}
                                </p>
                                <Tooltip text="Alarm">
                                    <FontAwesomeIcon
                                        icon="fa-solid fa-bell"
                                        className={`${isClicked ? "clicked_icon" : "icon"} bell`}
                                        onClick={() => {
                                            setIsClicked(!isClicked);
                                            setInitialClick(true);
                                        }}
                                        onMouseEnter={() => setIsEntered(true)}
                                        onMouseLeave={() => setIsEntered(false)}
                                    />
                                </Tooltip>
                                <div>
                                    <NotificationBox
                                        popupStatus={setIsClicked}
                                        enterEvent={isEntered}
                                    />
                                </div>
                            </div>
                            <div className="openai">
                                <Tooltip text="OpenAI">
                                    <AiOutlineOpenAI 
                                        className={gptHosted ? "clicked_icon" : "icon"}
                                        onClick={(e) => {
                                            setGptHosted(true);
                                            hostGpt(predictionData)
                                        }}
                                    />
                                </Tooltip>
                            </div>
                            <div className="logout">
                                <Tooltip text = "Logout">
                                    <Logout />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <div className = "contents-panel">
                    <div className="loading-bar">
                        <AILoading />
                    </div>
                    <div className="pop-up">
                        <Notification />
                    </div>
                    {icons.map((icon, index) => (
                        <div
                            key={index}
                            className={`${icon.text.toLowerCase()}-dashboard content`}
                            id={icon.sectionId}
                            ref={(node) => setSectionRef(node, index)}
                        >
                            {
                                index === 0 && <Summary />
                            }
                            {
                                index === 1 && <WeatherIO 
                                    viewWeatherMap={weatherMap}
                                />
                            }
                            {
                                index === 2 && <Chart 
                                    viewWeatherMap={setWeatherMap}
                                />
                            }
                            {
                                index === 3 && <Control

                                />
                            }
                            {
                                index === 4 && <Video 
                                    setEmbed={setEmbed} 
                                    onCancel={setOnCancel} 
                                    setEmbedError={setEmbedError} 
                                />
                            }
                        </div>
                    ))}
                    <footer>
                        <Footer />
                    </footer>
                </div>
                <div className = "info-panel">
                    <InfoContents />
                </div>
            </div>
        </div>
    );
};

export default Title;