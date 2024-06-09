import React, { useState, useEffect, useRef } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Calender from "./Calendar/Calendar";
import Weather2 from "./Weather2"
import Summary from "./Summary";
import Control from "./Control";
import Chart from "./Chart2";

library.add(fas);

const Title = () => {
    const [icon_index, set_icon_index] = useState(parseInt(localStorage.getItem('icon-index')));

    // 아이콘 배열
    const icons = [
        { icon: ["fas", "home"], text: "Home", sectionId: "jump_to1" },
        { icon: ["fas", "toggle-on"], text: "Control", sectionId: "jump_to2" },
        { icon: ["fas", "chart-simple"], text: "Statistics", sectionId: "jump_to3" },
        { icon: ["fas", "video"], text: "Videos", sectionId: "jump_to4" },
        { icon: ["fas", "server"], text: "Database", sectionId: "jump_to5" }
    ];

    // 아이콘 클릭 핸들러
    const icon_click = (index) => {
        set_icon_index(index);
        const sectionId = icons[index].sectionId;
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: "auto" });
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

    const [current, set_current] = useState({})
    const [isvisible, set_isvisible] = useState(false);

    const [current_date, set_current_date] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    });

    const [clicked_date, set_clicked_date] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
    })

    const [date_clicked, set_date_clicked] = useState({
        year: new Date().getFullYear(),
        month: 1,
        day: 1,
    })

    const [day, set_day] = useState('');

    useEffect(() => {
        let week = '';
        let getDay = new Date(clicked_date.year, clicked_date.month - 1, clicked_date.day).getDay();

        switch (getDay) {
            case 0:
                week = 'Sun'
                break;
            case 1:
                week = 'Mon'
                break;
            case 2:
                week = 'Tue'
                break;
            case 3: 
                week = 'Wed'
                break;
            case 4:
                week = 'Thu'
                break;
            case 5:
                week = 'Fri'
                break;
            case 6:
                week = 'Sat'
                break;
        }

        set_day(week);
    }, [clicked_date])

    return (
        <div>
            <div 
                className="todolist-window" 
                style={{
                    visibility: isvisible ? "visible" : "hidden"
                }}
                onClick={() => set_isvisible(!isvisible)}
            >
                <div className="sort">
                    <div className="bar">
                        <p>ToDoList - { clicked_date.year }
                            /{ clicked_date.month }
                            /{ clicked_date.day < 10 
                            ? '0' + clicked_date.day 
                            : clicked_date.day }</p>
                        <FontAwesomeIcon 
                            icon="fa-solid fa-xmark" 
                            className="window-icon"
                            onClick={() => set_isvisible(!isvisible)}
                        />
                    </div>
                    <div className="book-cover"
                        onClick={(e) => {e.stopPropagation()}}
                    >
                        <div className="calender-box">
                            <Calender
                                setDate = { set_current_date }
                                className="calender"
                                setVisible = { set_date_clicked }
                                dateChange = { current_date }
                                setClickDate = { set_clicked_date }
                            />
                        </div>
                        <div className="calender-box todo-lists">
                            <div className="todo-list">
                                <input
                                    className="title"
                                    placeholder="Title"
                                    autoComplete="off"
                                ></input>
                                <div className="date-list">
                                    <div>
                                        { day }
                                        , { clicked_date.month < 10 ? '0' + clicked_date.month : clicked_date.month }/
                                        { clicked_date.day < 10 ? '0' + clicked_date.day : clicked_date.day }
                                    </div>
                                    <div>
                                        { day }
                                        , { clicked_date.month < 10 ? '0' + clicked_date.month : clicked_date.month }/
                                        { clicked_date.day < 10 ? '0' + clicked_date.day : clicked_date.day }
                                    </div>
                                </div>
                                <input
                                    type="time"
                                ></input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                            <Calender
                                rotate = { rotated }
                                setDate = { set_current_date }
                                dateChange = { current_date }
                                clicked = { isvisible } // 빈 공간 또는 'X' 클릭 스테이트를 넘겨줌
                                setVisible = { set_isvisible } // 날짜 클릭 후, 팝업창을 띄울 스테이트 저장
                                setClickDate = { set_clicked_date }
                            />
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