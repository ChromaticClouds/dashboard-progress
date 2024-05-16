import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import "./Control.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Control = () => {
    const socket = io.connect("http://localhost:5000");

    const [monitoring, set_monitoring_data] = useState([]);
    const [checked, set_checked] = useState(localStorage.getItem('check-slider') === 'true');
    const [value1, set_value1] = useState(localStorage.getItem('slider-data1') || 0);
    const [value2, set_value2] = useState(localStorage.getItem('slider-data2') || 0);
    const [value3, set_value3] = useState(localStorage.getItem('slider-data3') || 0); 
    const [show_value1, set_show_value1] = useState(false);
    const [show_value2, set_show_value2] = useState(false);
    const [show_value3, set_show_value3] = useState(false);
    const [intensity, set_intenstiy] = useState(localStorage.getItem('intensity-data') || 0);
    const [duration, set_duration] = useState(localStorage.getItem('duration-data') || 0);

    const [push, set_push] = useState(false);
    const [sensor_data, set_sensor_data] = useState({});
    const [water_lev, set_water_lev] = useState(0);

    const pushed = () => {
        set_push(true);
        console.log(sensor_data);
        setTimeout(() => {
            set_push(false);
        }, 100)
    }

    socket.on('sensor data', (data) => {
        set_sensor_data(data);
        set_water_lev(data.distance);
    })

    const water_level = water_lev;

    const is_checked = (e) => {
        const checked_value = e.target.checked;
        set_checked(checked_value);
        localStorage.setItem('check-slider', checked_value);
    }

    const slider_changed_1 = (input) => {
        const new_value = input.target.value;
        set_value1(new_value);
        set_show_value1(true);
        localStorage.setItem('slider-data1', new_value);
    };
    const slider_changed_2 = (input) => {
        const new_value = input.target.value;
        set_value2(new_value);
        set_show_value2(true);
        localStorage.setItem('slider-data2', new_value);
    };
    const slider_changed_3 = (input) => {
        const new_value = input.target.value;
        set_value3(new_value);
        set_show_value3(true);
        localStorage.setItem('slider-data3', new_value);
    };

    const get_intensity = (input) => {
        const intensity_value = input.target.value;
        set_intenstiy(intensity_value);
        localStorage.setItem('intensity-data', intensity_value);
    }
    const get_duration = (input) => {
        const duration_value = input.target.value;
        set_duration(duration_value);
        localStorage.setItem('duration-data', duration_value);
    }

    useEffect(() => {
        socket.emit("monitoring req");
        socket.emit("sensor data req");

        const repeat = setInterval(() => {
            socket.emit("monitoring req");
            socket.emit("sensor data req");
        }, 2000);

        return () => {
            clearInterval(repeat);
        }
    }, [])

    useEffect(() => {
        socket.on("monitoring rec", (data) => {
            set_monitoring_data(data);
        })
        socket.on("sensor data", (data) => {
            set_sensor_data(data);
        })

        return () => {
            socket.off("monitoring rec");
            socket.off("sensor data");
        };
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
                socket.emit("led value req", value1);
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [value1])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
                socket.emit("led value req2", value2);
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [value2])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
                socket.emit("led value req3", value3);
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [value3])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
                socket.emit("intensity req", intensity);
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [intensity])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
                socket.emit("duration req", duration);
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [duration])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (checked) {
                socket.emit("control on");
            }
            else {
                socket.emit("control off");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [checked])

    const slider_blurred_1 = () => {
        set_show_value1(false);
    }
    const slider_blurred_2 = () => {
        set_show_value2(false);
    }
    const slider_blurred_3 = () => {
        set_show_value3(false);
    }

    const slider_value_style1 = {
        left: `${(value1 / 5) * 100}%`,
    };
    const slider_value_style2 = {
        left: `${(value2 / 5) * 100}%`,
    };
    const slider_value_style3 = {
        left: `${(value3 / 5) * 100}%`,
    };

    return (
        <div>
            <h4 className = 'subtitle'>Control Panel</h4>
            <div className = 'control'>
                <div className = 'field'>
                    <div className = 'value left'>OFF</div>
                    <input
                        type = "checkbox"
                        id = "check"
                        checked = { checked }
                        onChange = { is_checked }
                    ></input>
                    <label for = "check" className = 'button'></label>
                    <div className = 'value right'>ON</div>
                </div>
            </div>
            <div style = { { display: "flex" } }>
                <div>
                    <h4 className = 'disc'>LED1 Control</h4>
                    <div className = 'range'>
                        <div className = 'slider-value'>
                            <span className = { show_value1 ? "show" : "" } style = { slider_value_style1 }>{ value1 }</span>
                        </div>
                        <div className="field">
                            <div className='value left'>0</div>
                            <input 
                                type = "range" 
                                min = "0" 
                                max = "5" 
                                value = { value1 } 
                                onChange = { slider_changed_1 } 
                                onBlur = { slider_blurred_1 }
                                disabled = { !checked }></input>
                            <div className = "value right">5</div>
                        </div>
                    </div>
                    <h4 className = 'disc'>LED2 Control</h4>
                    <div className = 'range'>
                        <div className = 'slider-value'>
                            <span className = { show_value2 ? "show" : "" } style = { slider_value_style2 }>{ value2 }</span>
                        </div>
                        <div className="field">
                            <div className='value left'>0</div>
                            <input 
                                type = "range" 
                                min = "0" 
                                max = "5" 
                                value = { value2 } 
                                onChange = { slider_changed_2 } 
                                onBlur = { slider_blurred_2 }
                                disabled = { !checked }></input>
                            <div className = "value right">5</div>
                        </div>
                    </div>
                    <h4 className = 'disc'>LED3 Control</h4>
                    <div className = 'range'>
                        <div className = 'slider-value'>
                            <span className = { show_value3 ? "show" : "" } style = { slider_value_style3 }>{ value3 }</span>
                        </div>
                        <div className="field">
                            <div className='value left'>0</div>
                            <input 
                                type = "range" 
                                min = "0" 
                                max = "5" 
                                value = { value3 } 
                                onChange = { slider_changed_3 } 
                                onBlur = { slider_blurred_3 }
                                disabled = { !checked }></input>
                            <div className = "value right">5</div>
                        </div>
                    </div>
                </div>
                <div className = 'control-panel-sort'>
                    <h4 className = 'disc'>Waterpump Control</h4>
                    <div className = 'waterpump'>
                        <div className = 'container'>
                        <div className = 'box'>
                                <div className = 'value'>{ intensity }</div>
                                <div className = 'field'>
                                    <div className = 'top'>+</div>
                                    <input
                                        type = "range"
                                        min = "0"
                                        max = "5"
                                        onChange = { get_intensity }
                                        value = { intensity }
                                        disabled = { !checked }
                                    ></input>
                                    <progress
                                        min = "0"
                                        max = "5"
                                        value = { intensity }
                                    ></progress>
                                    <div className = 'bottom'>-</div>
                                </div>
                            </div>
                            <div className = 'status'>
                                <FontAwesomeIcon icon="fa-solid fa-bolt" className = 'status-icon'/>
                                <div className = 'name'>intensity</div>
                            </div>
                        </div>
                        <div className = 'container'>
                            <div className = 'box'>
                                <div className = 'value'>{ duration }</div>
                                <div className = 'field'>
                                    <div className = 'top'>+</div>
                                    <input
                                        type = "range"
                                        min = "0"
                                        max = "5"
                                        onChange = { get_duration }
                                        value = { duration }
                                        disabled = { !checked }
                                    ></input>
                                    <progress
                                        min = "0"
                                        max = "5"
                                        value = { duration }
                                    ></progress>
                                    <div className = 'bottom'>-</div>
                                </div>
                            </div>
                            <div className = 'status'>
                                <FontAwesomeIcon icon="fa-solid fa-hourglass-end" className = 'status-icon'/>
                                <div className = 'name'>duration</div>
                            </div>
                        </div>
                        <div className = 'circle'>
                            <div className = 'skill'>
                                <div className="outer">
                                    <div className="inner">
                                        <div className = { push ? "pushed" : "number" } onClick = { pushed }>
                                            { water_level }%
                                        </div>
                                    </div>
                                </div>
                                <svg xmlns = "http://www.w3.org/2000/svg" version = "1.1" width = "280px" height = "280px">
                                    <defs>
                                        <linearGradient id ="GradientColor">
                                            <stop offset = "0%" stopColor = '#DA22FF' />
                                            <stop offset = "100%" stopColor = '#9733EE' />
                                        </linearGradient>
                                    </defs>
                                    <circle cx = "130" cy = "130" r = "115" strokeLinecap = 'round' style = { { strokeDashoffset: `${722.2 - water_level * 7.22}`} }></circle>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Control;
