import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

import Expand from "../Stream/Expand";
import Calendar from "../TodoList/Calendar";
import TodoList from "../TodoList/TodoList";
import Weather2 from "./Weather2"
import Summary from "./Summary";
import Control from "./Control";
import Chart from "./Chart2";
import Video from "../Stream/Video";
import WeatherIO from "../Weather/WeatherIO";
import Footer from "../Footer/Footer";
import Notification from "../Notification/Notification";
import NotificationBox from "../Notification/NotificationBox";
import OpenAI from "../Prediction/OpenAI";

library.add(fas);

const Title = () => {
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
            text: "Database", 
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
        threshold: 0.5,
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
     *  - # info-contents 패널의 화살표 클릭 이벤트 스테이트 저장
     */
    const [rotated, set_rotated] = useState(false);

    const rotate = () => {
        set_rotated(!rotated)
    }

    const [current, set_current] = useState({});

    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState({});
    /**
     *  - # Video 컴포넌트 및 Embed 컴포넌트의 이벤트 관리 스테이트
     */
    const [onCancel, setOnCancel] = useState(true);
    const [embed, setEmbed] = useState(<div></div>);
    const [embedError, setEmbedError] = useState(false);
    /**
     *  - # 투두 리스트 데이터 및 POST 요청성공 변화 감지
     */
    const [viewDate, setViewDate] = useState([]);
    const [viewTodo, setViewTodo] = useState([]);
    const [detectTodo, setDetectTodo] = useState([]);
    /**
     *  - # 날씨 데이터 스테이트
     */
    const [viewWeather, setViewWeather] = useState([]);
    const [viewIcon, setViewIcon]  = useState(null);
    /*-----------------------------------------------------------------------------*\
        # POST 요청 성공 시, GET 요청으로 title 컴포넌트의 todo list에 데이터 삽입 #
    \*-----------------------------------------------------------------------------*/
    const getDate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/calendar', {
                params: {
                    startDate: new Date().toDateString(),
                    endDate: new Date().toDateString()
                }
            });
            setViewTodo(response.data)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getDate();
    }, [new Date().getDate(), detectTodo]); 
    /**
     *  - # OpenWeatherMap 데이터 props로 전달하기 위한 state 선언
     */
    const [weatherMap, setWeatherMap] = useState([]);
    const [isClicked, setIsClicked] = useState(false); /* 노티피케이션 알림 클릭 여부 */
    const [isEntered, setIsEntered] = useState(false);
    /**
     *  - # Notification POST 요청 디텍션
     */
    const [noticePost, setNoticePost] = useState([]);
    const [noticeCount, setNoticeCount] = useState(() => {
        const savedCount = localStorage.getItem('noticeCount');
        return savedCount ? parseInt(savedCount, 10) : 0;
    });
    /*---------------------------------------------------------------------------------*\
        # POST 요청 성공 시, 로컬 스토리지에 영구 저장된 노티피케이션 데이터와 함께 로드 #
    \*---------------------------------------------------------------------------------*/
    const [unreadNotice, setUnreadNotice] = useState([]);

    return (
        <div>
            <Expand 
                onEmbed = { embed }
                onCancel={ setOnCancel }
                isVisible={ onCancel }
                embedError={ embedError }
            />
            <TodoList 
                setVisible = { visible }
                setCancel = { setVisible }
                setDate = { date }
                detectTodo = { setDetectTodo }
            />
            <div className = "ui-container">
                <div className = "icon-panel">
                    <div className="icons-bar">
                        <div className="icons">
                            {icons.map((icon, index) => (
                                <div key = { index } className = "icon-array">
                                    <FontAwesomeIcon
                                        icon={icon.icon}
                                        className={index === iconIndex ? "clicked_icon" : "icon"}
                                        onClick={() => iconClick(index)}
                                    />
                                </div>
                            ))}
                            <div className="notice">
                                <p className={`notice-count ${noticeCount !== 0 ? "exist" : ""}`}>
                                    {noticeCount !== 0 ? noticeCount : null}
                                </p>
                                <FontAwesomeIcon
                                    icon="fa-solid fa-bell"
                                    className={isClicked ? "clicked_icon" : "icon"}
                                    onClick={() => {
                                        setIsClicked(!isClicked);
                                        localStorage.setItem('noticeCount', '0');
                                        setNoticeCount(0);
                                        if (!isClicked) {
                                            setUnreadNotice([]);
                                            localStorage.setItem('unreadNotice', JSON.stringify([]));
                                        }
                                    }}
                                    onMouseEnter={() => setIsEntered(true)}
                                    onMouseLeave={() => setIsEntered(false)}
                                />
                                <div>
                                    <NotificationBox 
                                        popupNotification={isClicked}
                                        hostNotification={noticePost}
                                        hostMark={unreadNotice}
                                        popupStatus={setIsClicked}
                                        enterEvent={isEntered}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className = "contents-panel">
                    <div className="pop-up">
                        <Notification 
                            hostNotification={setNoticePost}
                            setNoticeCount={setNoticeCount}
                            unreadNotice={setUnreadNotice}
                        />
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
                                    viewWeather={viewWeather}
                                    viewWeatherMap={weatherMap}
                                    viewIcon = {setViewIcon}
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
                    <div className = "info-content">
                        <div className="weather-content" style = {{
                            top: rotated ? '30px' : '480px',
                            transition: 'top 0.5s ease-in-out'
                        }}>
                            <FontAwesomeIcon
                                icon="fa-solid fa-chevron-up" 
                                className="content-up"
                                onClick = { rotate }
                                style = {{
                                    transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease-in-out'
                                }} // 버튼 클릭 시, 위젯 슬라이드 업
                            />
                            <Weather2 
                                set_current={set_current} // 풍향, 풍속 데이터 전달 위함
                                viewWeather={setViewWeather}
                            />
                            <div className="calendar" style = {{ 
                                marginBottom: rotated ? "40px" : "500px"
                            }}>
                                <Calendar
                                    setVisible = { setVisible }
                                    setDate = { setDate }
                                    viewDate = { setViewDate }
                                    detectTodo = { detectTodo }
                                />
                                <div className="todo-list">
                                    <div className="todo-bar">
                                        <p>Todo-List 📅</p>
                                    </div>
                                        {viewTodo.length > 0 ? (
                                            <div className="lists sort">
                                                <div className="non-exist exist">
                                                    {viewTodo.map(todo => (
                                                        <div key={todo._id} className="todo-box">
                                                            <div className="circle">
                                                                <div className={`color ${todo.color}`}></div>
                                                            </div>
                                                            <div>
                                                                <div className="time">{todo.todo === '' ? `${todo.startTime} - ${todo.endTime}` : "All Day"}</div>
                                                                <div className="contents">
                                                                    <span className="todo-title">{todo.title}</span>
                                                                    <div></div>
                                                                    <span>{todo.todo === '' ? todo.message : todo.todo}</span>
                                                                </div>
                                                            </div>
                                                            {todo.event.text ? (
                                                                <div className={`icon-box color ${todo.color}`}>
                                                                    <div>{todo.event.text ? <FontAwesomeIcon icon={`${todo.event.icon}`}/> : null}</div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="lists">
                                                <div className="non-exist">
                                                    <FontAwesomeIcon icon="fa-solid fa-face-sad-tear" className="icon" />
                                                    <h3 className="text">No Schedule...</h3>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="info-box">
                            <h4 className="now">Now</h4>
                            <div className="main-info">
                                {viewIcon}
                            </div>
                            <span>{ current.temp }°</span>
                        </div>
                    </div>
                </div>
            </div>
            <OpenAI />
        </div>
    );
};

export default Title;