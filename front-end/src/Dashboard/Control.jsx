import React, { useCallback, useEffect, useState } from 'react';
import io from "socket.io-client";
import "./Control.css";

import BulletChart from '../../chart/BulletChart';
import BulletChart2 from '../../chart/BulletChart2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon } from "../Icon/Icon";

let socket;
const Control = ({ forceControl }) => {
    useEffect(() => {
        socket = io.connect("http://localhost:5000");

        return () => {
            socket.disconnect();
        }
    }, [])

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

    const [recent_date, set_recent_date] = useState(new Date());

    const [push, set_push] = useState(false);
    const [sensor_data, set_sensor_data] = useState({});
    const [water_lev, set_water_lev] = useState(0);
    const [temp, set_temp] = useState(0);
    const [humid, set_humid] = useState(0);

    const [watering, setWatering] = useState(false);

    const pushed = () => {
        set_push(true);
        setTimeout(() => {
            set_push(false);
        }, 100);

        setWatering(prevState => {
            const newState = !prevState;
            socket.emit('watering req', {
                onWatering: newState
            });
            return newState;
        });
    }

    let now = new Date();
    let recent = new Date(recent_date);
    const print_date = () => {
        const millis = now - recent;

        const dif_minutes = parseInt(millis / 1000 / 60);
        const dif_hours = parseInt(dif_minutes / 60);
        const dif_days = parseInt(dif_hours / 24);
        const dif_years = parseInt(dif_days / 365);

        let result;
        if (dif_minutes <= 59) {
            result = dif_minutes == 0 ? "just before" : dif_minutes + " minutes ago";
        }
        else if (dif_hours <= 23) {
            result = dif_hours + " hours ago";
        }
        else if (dif_days <= 364) {
            result = dif_days + " days ago";
        }
        else {
            result = dif_years + " years ago";
        }

        return result;
    }

    useEffect(() => {
        socket.on('sensor data', (data) => {
            if (data) {
                set_sensor_data(data);
                set_water_lev(data.water_level);
                set_temp(data.temperature);
                set_humid(data.humidity);
            }
        })
    }, []);

    const water_level = water_lev ? water_lev : 0;

    // LED 슬라이더 3개 value 스테이트 저장
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
    
    // 펌프 스테이트 저장
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
        socket.emit("recent watering req");

        const repeat = setInterval(() => {
            socket.emit("monitoring req");
            socket.emit("sensor data req");
            socket.emit("recent watering req");
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
        socket.on("recent watering rec", (data) => {
            set_recent_date(data);
        })
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

    // 온도 디스플레이 표시용
    const temperature = [
        {
            "ranges": [ 0, 15, 17, 23, 25, 30, 40 ],
            "measures": [ temp ],
            "markers": [ 28 ]
        }
    ]
    // 습도 디스플레이 표시용
    const humidity = [
        {
            "ranges": [ 0, 40, 65, 80, 100 ],
            "measures": [ humid ],
            "markers": [ 55 ]
        }
    ]

    const [heat_disc] = useState([15, 20, 25, 30, 35]);
    const [cool_disc] = useState([15, 18, 21, 24, 27]);
    
    const slider_min_x = 0;
    const slider_max_x = 240;

    /** 드래그 이벤트 저장 스테이트 */
    const [dragging_h, set_dragging_h] = useState(false);
    const [initial_mouse_x, set_initial_mouse_x] = useState(0);
    const [slider_x, set_slider_x] = useState(() => {
        const saved = localStorage.getItem('slider_x');
        return saved !== null ? Number(saved) : 0;
    });
    const [initial_slider_x, set_initial_slider_x] = useState(0);
    
    const [dragging_c, set_dragging_c] = useState(false);
    const [initial_mouse_x2, set_initial_mouse_x2] = useState(0);
    const [slider_x2, set_slider_x2] = useState(() => {
        const saved = localStorage.getItem('slider_x2');
        return saved !== null ? Number(saved) : 0;
    });
    const [initial_slider_x2, set_initial_slider_x2] = useState(0);

    const start_drag_h = (e) => {
        set_dragging_h(true);
        set_initial_mouse_x(e.clientX);
        set_initial_slider_x(slider_x);
    }
    const start_drag_c = (e) => {
        set_dragging_c(true);
        set_initial_mouse_x2(e.clientX);
        set_initial_slider_x2(slider_x2);
    }

    const stop_drag = () => {
        set_dragging_h(false);
        set_dragging_c(false);
    }

    const mouse_move = (e) => {
        if (dragging_h) {
            const drag_amount = e.clientX - initial_mouse_x;
            const target_x = initial_slider_x + drag_amount;

            set_slider_x(Math.max(Math.min(target_x, slider_max_x), slider_min_x))
        }
        if (dragging_c) {
            const drag_amount = e.clientX - initial_mouse_x2;
            const target_x = initial_slider_x2 + drag_amount;

            set_slider_x2(Math.max(Math.min(target_x, slider_max_x), slider_min_x))
        }
    }

    // 슬라이더 스테이트 변경 될 때마다 재렌더링 방지
    const desired_heat = useCallback(() => {
        const temp_range_start = 15;
        const temp_range = 20;
        return (slider_x / slider_max_x * temp_range) + temp_range_start
    }, [slider_x, slider_max_x]);
    const desired_cool = useCallback(() => {
        const temp_range_start = 15;
        const temp_range = 12;
        return (slider_x2 / slider_max_x * temp_range) + temp_range_start
    }, [slider_x2, slider_max_x])

    const [desire_heat, set_desire_heat] = useState(desired_heat);
    const [desire_cool, set_desire_cool] = useState(desired_cool);

    useEffect(() => {
        set_desire_heat(desired_heat());
    }, [desired_heat])
    useEffect(() => {
        set_desire_cool(desired_cool());
    }, [desired_cool])

    // 설정한 온도를 소수점 제거해서 전송
    useEffect(() => {
        socket.emit("heater temp req", desire_heat.toFixed(0));
    }, [desire_heat]);
    useEffect(() => {
        socket.emit("cooler temp req", desire_cool.toFixed(0));
    }, [desire_cool]);

    // 설정한 온도를 클라이언트 내부 저장소에 저장
    useEffect(() => {
        localStorage.setItem('slider_x', slider_x);
    }, [slider_x]);
    useEffect(() => {
        localStorage.setItem('slider_x2', slider_x2);
    }, [slider_x2]);

    // 슬라이더 애니메이션 CSS 조절
    const heat_element_style = (temp_number) => {
        const near_distance = 3;
        const lift_distance = 12;

        const diff = Math.abs(desired_heat() - temp_number);
        const dist_y = (diff / near_distance) - 1

        const element_y = Math.min(dist_y * lift_distance, 0);
        return `translate3d(0, ${ element_y }px, 0)`
    }
    const cool_element_style = (temp_number) => {
        const near_distance = 3;
        const lift_distance = 12;

        const diff = Math.abs(desired_cool() - temp_number);
        const dist_y = (diff / near_distance) - 1

        const element_y = Math.min(dist_y * lift_distance, 0);
        return `translate3d(0, ${ element_y }px, 0)`
    }
    
    // 온도 제어 전원 여부 기억
    const [heater_operate, set_heater_operate] = useState(() => {
        const saved = localStorage.getItem('heater-power');
        return saved === 'true';
    });
    const [cooler_operate, set_cooler_operate] = useState(() => {
        const saved = localStorage.getItem('cooler-power');
        return saved === 'true';
    })

    // 히터, 쿨러 전원여부 스테이트 저장 및 전송
    const heater_rotate = () => {
        set_heater_operate(prevState => {
            const newState = !prevState;
            return newState;
        });
    };
    const cooler_rotate = () => {
        set_cooler_operate(prevState => {
            const newState = !prevState;
            return newState;
        })
    }

    // 히터, 쿨러 전원여부 클라이언트 저장소에 저장
    useEffect(() => {
        socket.emit("cooler temp req", desire_cool.toFixed(0));
        localStorage.setItem('heater-power', heater_operate);
    }, [heater_operate])
    useEffect(() => {
        socket.emit("cooler temp req", desire_cool.toFixed(0));
        localStorage.setItem('cooler-power', cooler_operate);
    }, [cooler_operate])

    const is_checked = (e) => { // 전체 센서 이벤트 제어
        const checked_value = e.target.checked;
        set_checked(checked_value);
        localStorage.setItem('check-slider', checked_value);
    }
    
    useEffect(() => {
        if (!checked) {
            set_heater_operate(true);
            set_cooler_operate(true);
        } else {
            set_heater_operate(false);
            set_cooler_operate(false);
        }
    }, [checked]);

    useEffect(() => {
        socket.emit("heater power req", {
            power: heater_operate
        });
    }, [heater_operate]);
    
    useEffect(() => {
        socket.emit("cooler power req", {
            power: cooler_operate
        });
    }, [cooler_operate]);

    return (
        <div className = 'board' onMouseMove = { mouse_move } onMouseUp = { stop_drag }>
            <div className = 'sub-contents'>
                <h4 className = 'subtitle'>Control Panel</h4>
                <div className = 'control-container'>
                    <div className = 'control'>
                        <p style = { { color: checked ? "#3648d2" : "#978d83" } }>{ checked ? "Manual" : "Auto"}</p>
                        <div className = 'field'>
                            <input
                                type = "checkbox"
                                id = "check"
                                checked = { checked }
                                onChange = { is_checked }
                            ></input>
                            <label for = "check" className = 'button'></label>
                        </div>
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
                            <div className = 'container sort'>
                                <div className='white-circle'>
                                    <span className='power'>{checked ? (watering ? "ON" : "OFF") : "AUTO"}</span>
                                </div>
                                <div className = 'circle'>
                                    <div className = 'skill'>
                                        <div className="outer">
                                            <div className="inner">
                                                <div className = { push ? "pushed" : "number" } onClick = { checked ? pushed : null }>
                                                    { water_level.toFixed(1) } %
                                                    <div className = 'disc'>Water Level</div>
                                                </div>
                                            </div>
                                        </div>
                                        <svg xmlns = "http://www.w3.org/2000/svg" version = "1.1" width = "280px" height = "280px">
                                            <defs>
                                                <linearGradient id ="GradientColor">
                                                    <stop offset = "0%" stopColor = '#4353a6' />
                                                    <stop offset = "100%" stopColor = '#3da0be' />
                                                </linearGradient>
                                            </defs>
                                            <circle cx = "130" cy = "130" r = "115" strokeLinecap = 'round' style = { { strokeDashoffset: `${ water_level * 7.22 + 100 * 7.22 }`} }></circle>
                                        </svg>
                                    </div>
                                </div>
                                <div className = 'status-container'>
                                    <div className = 'status-manage'>
                                        <div className = 'status-box class1'>
                                            <FontAwesomeIcon 
                                                icon="fa-solid fa-seedling"
                                                className = "status-icon"
                                            />
                                        </div>
                                        <div className = 'text-box'>
                                            <p>soil humidity</p>
                                            <span>{ sensor_data ? sensor_data.soil_humidity : 0 } %</span>
                                        </div>
                                    </div>
                                    <div className = "line"></div>
                                    <div className = 'status-manage'>
                                        <div className = 'status-box class2'>
                                            <Icon 
                                                iconName = "ClockHistory" 
                                                className = "status-icon"
                                            />
                                        </div>
                                        <div className='text-box'>
                                            <p>watered</p>
                                            <span>{ print_date() }</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className = 'rail-sort'>
                        <h4 className = 'disc'>Linear Rail Control</h4>
                        <div className = 'linear-rail'>

                        </div>
                    </div>
                </div>
                <div className = 'division'></div>
                <div className = 'fan-container'>
                    <div className = 'sort'>
                        <div>
                            <div className = 'name'>Temperature & Humidity Status</div>
                            <div className = 'sort'>
                                <div className = 'container'>
                                    <div className = 'temp-bar bar-box'>
                                        <div className = 'status'>
                                            <p>temperature</p>
                                            <div className = 'value'>
                                                { temp } °C
                                            </div>
                                        </div>
                                        <div className = 'chart'>
                                            <div className = 'length'>
                                                <BulletChart 
                                                    data = { temperature }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className = 'humid-bar bar-box'>
                                        <div className = 'status'>
                                            <p>humidity</p>
                                            <div className = 'value'>
                                                { humid } %
                                            </div>
                                        </div>
                                        <div className = 'chart'>
                                            <div className = 'length'>
                                                <BulletChart2
                                                    data = { humidity }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className = 'border'>
                                <div className = 'name'>Fan Control</div>
                                <div className='sort'>
                                    <div className = 'heater device'>
                                        <div className = 'disc'>
                                            <p>Heater</p>
                                            <span className = 'set-value'>{ desired_heat().toFixed(0) } °C</span>
                                        </div>
                                        <div className = { heater_operate ? 'button-on' : 'button-off'}>
                                            <button className = { heater_operate ? 'inner-button-on' : 'inner-button-off'} disabled = { !checked }>
                                                <FontAwesomeIcon 
                                                    icon="fa-solid fa-arrows-rotate" 
                                                    style = { { transform: "rotate(45deg)" } } 
                                                    onClick = { heater_rotate }
                                                    className = { heater_operate ? 'rotate-on' : ''}
                                                />
                                            </button>
                                        </div>
                                        <div className = 'temperature-graduation'>
                                            { heat_disc.map((grade, index) => (
                                                <span className='temperature-element' style = { { transform: `${ heat_element_style(grade) }`} }>
                                                    <div className = 'point'>
                                                        <span 
                                                            key = { index }
                                                            className = 'number'
                                                        >
                                                            { grade }
                                                        </span>
                                                        <span className = "line">|</span>
                                                    </div>
                                                </span>
                                            )) }
                                        </div>
                                        <div className = 'lower-container'>
                                            <div className = "slider-container" style = { { transform: `translate3d(${ slider_x }px, 0, 0)` } }>
                                                <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path 
                                                        d="M74.3132 0C47.0043 2.44032e-05 50.175 30 7.9179 30H144.27C99.4571 30 101.622 -2.44032e-05 74.3132 0Z" 
                                                        transform="translate(-7.38794 -0.1)" 
                                                        fill="#9ecddb"
                                                    />
                                                </svg>
                                                <div className ="slider-button" onMouseDown = { start_drag_h }>
                                                    <FontAwesomeIcon
                                                        icon ="fas fa-thermometer-empty"
                                                        className = 'slider-icon'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className = 'cooling-fan device'>
                                        <div className = 'disc'>
                                            <p>Cooling Fan</p>
                                            <span className = 'set-value'>{ desired_cool().toFixed(0) } °C</span>
                                        </div>
                                        <div className = { cooler_operate ? 'button-on' : 'button-off'}>
                                            <button className = { cooler_operate ? 'inner-button-on' : 'inner-button-off'} disabled = { !checked }>
                                                <FontAwesomeIcon 
                                                    icon="fa-solid fa-arrows-rotate" 
                                                    style = { { transform: "rotate(45deg)" } } 
                                                    onClick = { cooler_rotate }
                                                    className = { cooler_operate ? 'rotate-on' : ''}
                                                />
                                            </button>
                                        </div>
                                        <div className = 'temperature-graduation'>
                                            { cool_disc.map((grade, index) => (
                                                <span className='temperature-element' style = { { transform: `${ cool_element_style(grade) }`} }>
                                                    <div className = 'point'>
                                                        <span 
                                                            key = { index }
                                                            className = 'number'
                                                        >
                                                            { grade }
                                                        </span>
                                                        <span className = "line">|</span>
                                                    </div>
                                                </span>
                                            )) }
                                        </div>
                                        <div className = 'lower-container'>
                                            <div className = "slider-container" style = { { transform: `translate3d(${ slider_x2 }px, 0, 0)` } }>
                                                <svg width="150" height="30" viewBox="0 0 150 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path 
                                                        d="M74.3132 0C47.0043 2.44032e-05 50.175 30 7.9179 30H144.27C99.4571 30 101.622 -2.44032e-05 74.3132 0Z" 
                                                        transform="translate(-7.38794 -0.1)" 
                                                        fill="#9ecddb"
                                                    />
                                                </svg>
                                                <div className ="slider-button" onMouseDown = { start_drag_c }>
                                                    <FontAwesomeIcon
                                                        icon ="fas fa-thermometer-empty"
                                                        className = 'slider-icon'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Control;