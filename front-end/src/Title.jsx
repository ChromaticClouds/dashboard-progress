import React, { useState, useEffect, useRef } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

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


    const [current_date, set_current_date] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().getMonth().toLocaleString('en-GB', { month: 'long'})
    });

    const [prev_last_days, set_prev_last_days] = useState([]);
    const [days, set_days] = useState([]);
    const [next_init_days, set_next_init_days] = useState([]);
    const [active_day, set_active_day] = useState(new Date().getDate());

    const [month_change_style, set_month_change_style] = useState({ zIndex: -1 });
    const [scale, set_scale] = useState(1.3);

    const month_list = Array.from(Array(12), (_, i) => new Date(current_date.year, i).getMonth() + 1);

    const prev_month = () => {
        set_current_date((prev) => {
            let new_month = prev.month - 1;
            let new_year = prev.year;
            if (new_month < 0) {
                new_month = 11;
                new_year -= 1;
            }
            let new_string_month = new Date(new_year, new_month).toLocaleString('en-GB', { month: 'long'})

            return { year: new_year, month: new_month, string_month: new_string_month }
        })
    }

    const next_month = () => {
        set_current_date((next) => {
            let new_month = next.month + 1;
            let new_year = next.year;
            if (new_month > 11) {
                new_month = 0;
                new_year += 1;
            }
            let new_string_month = new Date(new_year, new_month).toLocaleString('en-GB', { month: 'long'})

            return { year: new_year, month: new_month, string_month: new_string_month }
        })
    }

    useEffect(() => {
        const date = new Date(current_date.year, current_date.month)
        const current_year = date.getFullYear();
        const current_month = date.getMonth();
        const current_string_month = date.toLocaleString('en-GB', { month: 'long'});

        set_active_day(new Date().getDate());

        set_current_date({
            year: current_year,
            month: current_month,
            string_month: current_string_month,
        })

        let last_date_of_prev = new Date(current_year, current_month, 0).getDate();
        let first_date_of_month = new Date(current_year, current_month, 1);
        let last_date_of_month = new Date(current_year, current_month + 1, 0).getDate();
        let day_of_week = first_date_of_month.getDay();

        const prev_month_days = [];
        for (let i = day_of_week -1; i >= 0; i--) {
            prev_month_days.push(last_date_of_prev - i);
        }
        set_prev_last_days(prev_month_days);

        const days_array = Array.from(Array(last_date_of_month), (_, i) => i + 1);
        set_days(days_array);

        const next_month_days = [];
        const total_days = 42;
        for (let i = 1; i <= total_days - (prev_month_days.length + days_array.length); i++) {
            next_month_days.push(i);
        }
        set_next_init_days(next_month_days)
    }, [current_date.year, current_date.month])

    const host_month = (value) => {
        set_current_date({
            year: current_date.year,
            month: value,
            string_month: new Date(current_date.year, value).toLocaleString('en-GB', { month: 'long' })
        })

        set_month_change_style({ zIndex: -1 })
    }

    const current_date_click = () => {
        set_month_change_style({ zIndex: 1 });
        set_scale(1);
    }

    return (
        <div>
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
                        <div className="weather-content">
                            <Weather2 />
                            <div className="calender-container">
                                <header>
                                    <p className = "current-date" onClick = { current_date_click }>{ current_date.string_month } { current_date.year }</p>
                                    <div className = "chevron-icons">
                                        <span><FontAwesomeIcon icon="fa-solid fa-chevron-left" onClick = { prev_month }/></span>
                                        <span><FontAwesomeIcon icon="fa-solid fa-chevron-right" onClick = { next_month }/></span>
                                    </div>
                                </header>
                                <div className = "calender">
                                    <ul className="week">
                                        <li>Sun</li>
                                        <li>Mon</li>
                                        <li>Tue</li>
                                        <li>Wed</li>
                                        <li>Thu</li>
                                        <li>Fri</li>
                                        <li>Sat</li>
                                    </ul>
                                    <ul className="days">
                                        {prev_last_days.map((o, i) => (
                                            <li key = {i} className = "inactive">{o}</li>
                                        ))}
                                        {days.map((o, i) => (
                                            <li key = {i} className = { current_date.year === new Date().getFullYear() && current_date.month === new Date().getMonth() && o === active_day ? "active" : ""  }>{o}</li>
                                        ))}
                                        {next_init_days.map((o, i) => (
                                            <li key = {i} className = "inactive">{o}</li>
                                        ))}
                                    </ul> 
                                </div>
                                <div className = "month-change" style = { month_change_style }>
                                    <p>{ current_date.year }</p>
                                    <div className = "month-list" style = { { transform: `scale(${ scale })` } }>
                                        { month_list.map((month) => (
                                            <div key = { month }>
                                                <div 
                                                    className = { 
                                                        current_date.year === new Date().getFullYear() && 
                                                        month === new Date().getMonth() + 1 
                                                        ? "active-month" 
                                                        : "inactive-month"
                                                    }
                                                    onClick = { () => { host_month(month - 1), set_scale(1.3) } }
                                                >
                                                    { month }
                                                </div>
                                            </div>
                                        )) }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <img src = "../images/smartfarm.png" className = "info-pic"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Title;