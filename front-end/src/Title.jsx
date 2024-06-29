import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

import Expand from "./Stream/Expand";
import Calendar from "./TodoList/Calendar";
import TodoList from "./TodoList/TodoList";
import Weather2 from "./Weather2"
import Summary from "./Summary";
import Control from "./Control";
import Chart from "./Chart2";
import Video from "./Stream/Video";
import WeatherIO from "./Weather/WeatherIO";

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

    const [rotated, set_rotated] = useState(false);

    const rotate = () => {
        set_rotated(!rotated)
    }

    const [current, set_current] = useState({});

    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState({});

    const [onCancel, setOnCancel] = useState(true);
    const [embed, setEmbed] = useState(<div></div>);
    const [embedError, setEmbedError] = useState(false);
    /**
     *  - # 투두 리스트 데이터 및 변화 감지
     */
    const [viewDate, setViewDate] = useState([]);
    const [viewTodo, setViewTodo] = useState([]);
    const [detectTodo, setDetectTodo] = useState([]);
    /**
     *  - # 날씨 데이터 스테이트
     */
    const [viewWeather, setViewWeather] = useState([]);
    const [viewIcon, setViewIcon] = useState(null);

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

    const [weatherMap, setWeatherMap] = useState([]);

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
                        </div>
                    </div>
                </div>
                <div className = "contents-panel">
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
                                index === 3 && <Control />
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
                        <h2>& Smart Farm &</h2>
                        <p>DCT</p>
                    </footer>
                </div>
                <div className = "info-panel">
                    <div className = "info-content">
                        <div className="weather-content" style = {{
                            top: rotated ? '0' : '460px',
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
        </div>
    );
};

export default Title;