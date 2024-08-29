import React from "react";
import "./Footer.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
    return (
        <div className="footer">
            <div className="logo">
                <h4 className="text">
                    DCT - <span>Smart Farm with IoT Processor</span>
                    <div className="icon">
                        <FontAwesomeIcon icon="fa-solid fa-diamond" />
                    </div>
                </h4>
            </div>
            <div className="bind">
                <section className="contact">
                    <div className="center">
                        <h3>Contact Our Progress</h3>
                        <div>
                            <div className="icon">
                                <a href = "https://github.com/ChromaticClouds/dashboard-progress" target="_blank">
                                    <FontAwesomeIcon icon="fa-brands fa-github" className="link"/>
                                </a>
                            </div>
                        </div>
                        <text>
                            Our purpose is improve project best. Find more information by visiting our github.
                        </text>
                    </div>
                </section>
                <section className="api">
                    <div className="center">
                        <h3>Open API Source from</h3>
                        <div>
                            <div className="icon">
                                <ul>
                                    <li>
                                        <a href="https://openweathermap.org/" target="_blank">
                                            <img src = "https://seeklogo.com/images/O/openweather-logo-3CE20F48B5-seeklogo.com.png"/>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.weather.go.kr/w/index.do" target="_blank">
                                            <img src = "../../images/기상청.png"/>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://openai.com/" target="_blank">
                                            <img src = "../../images/OpenAI.png"/>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                <section>

                </section>
            </div>
        </div>
    )
}

export default Footer;