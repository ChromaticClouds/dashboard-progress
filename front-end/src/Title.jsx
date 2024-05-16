import React, { useState, useEffect } from "react";
import "./Title.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Weather2 from "./Weather2"
import Summary from "./Summary";
import Control from "./Control";

library.add(fas);

const Title = () => {
    const [icon_index, set_icon_index] = useState(parseInt(localStorage.getItem('icon-index'))); // 현재 활성화된 아이콘의 인덱스

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
                        chart-dashboard
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
                        <img src = "../images/smartfarm.png" className = "info-pic"/>
                        <div className="weather-content">
                            <Weather2 />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Title;
