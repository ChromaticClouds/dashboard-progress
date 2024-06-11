import React, { useState, useEffect, useRef } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Calendar from "./TodoList/Calendar";
import TodoList from "./ToDoList/ToDoList";
import Weather2 from "./Weather2"
import Summary from "./Summary";
import Control from "./Control";
import Chart from "./Chart2";

library.add(fas);

const Title = () => {
    const [icon_index, set_icon_index] = useState(parseInt(localStorage.getItem('icon-index')));

    /** 객체 형태로 아이콘 데이터 저장 */
    const icons = [
        { 
            icon: ["fas", "home"], 
            text: "Home", 
            sectionId: "jump_to1" 
        },
        { 
            icon: ["fas", "toggle-on"],
            text: "Control", 
            sectionId: "jump_to2" 
        },
        { 
            icon: ["fas", "chart-simple"], 
            text: "Statistics", 
            sectionId: "jump_to3" 
        },
        { 
            icon: ["fas", "video"], 
            text: "Videos", 
            sectionId: "jump_to4" 
        },
        { 
            icon: ["fas", "server"], 
            text: "Database", 
            sectionId: "jump_to5" 
        }
    ];

    // 아이콘 클릭 핸들러
    const icon_click = (index) => {
        const sectionId = icons[index].sectionId;
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "smooth" });
        }
        localStorage.setItem('icon-index', index);
    };

    useEffect(() => {
        let detect = document.querySelectorAll(".detect");

        let observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Array.from(detect).indexOf(entry.target);
                    set_icon_index(index)
                }
            });
        });

        detect.forEach((c) => {
            observer.observe(c);
        });
    
        return () => {
            detect.forEach((c) => {
                observer.unobserve(c);
            });
        };
    }, []);

    const [rotated, set_rotated] = useState(false);

    const rotate = () => {
        set_rotated(!rotated)
    }

    const [current, set_current] = useState({});

    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState({});

    return (
        <div>
            <TodoList 
                setVisible = { visible }
                setCancel = { setVisible }
                setDate = { date }
            />
            <div className = "ui-container">
                <div className = "icon-panel">
                    <div className="icons-bar">
                        <div className="icons">
                            {icons.map((icon, index) => (
                                <div key = { index } className = "icon-array">
                                    <FontAwesomeIcon
                                        icon={icon.icon}
                                        className={index === icon_index ? "clicked_icon" : "icon"}
                                        onClick={() => icon_click(index)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className = "contents-panel">
                    <div className = "summary-dashboard content" id="jump_to1">
                        <Summary />
                        <div className = "detect"></div>
                    </div>
                    <div className="control-dashboard content" id="jump_to2">
                        <Control />
                        <div className = "detect"></div>
                    </div>
                    <div className="chart-dashboard content" id="jump_to3">
                        <Chart />
                        <div className = "detect"></div>
                    </div>
                    <div className="video-dashboard content" id="jump_to4">
                        video-dashboard
                        <div className = "detect"></div>
                    </div>
                    <div className="db-dashboard content" id="jump_to5">
                        <div className = "detect"></div>
                        db-dashboard
                    </div>
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
                            <Weather2 set_current={set_current} />
                            <div className="calendar" style = {{ 
                                marginBottom: rotated ? "40px" : "500px"
                            }}>
                                <Calendar
                                    setVisible = { setVisible }
                                    setDate = { setDate }
                                />
                                <div className="other-list">

                                </div>
                            </div>
                        </div>
                        <div className="info-box">
                            <h4 className="now">Now</h4>
                            <div className="main-info">
                                <img src = { current.pty == null ? current.icon : current.icon2 } className = "info-icon"/>
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