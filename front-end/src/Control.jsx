import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import "./Control.css";

const Control = () => {
    const socket = io.connect("http://localhost:5000");

    const [value, set_value] = useState(localStorage.getItem('slider-data') || 0);
    const [show_value, set_show_value] = useState(false);
    const [checked, set_checked] = useState(localStorage.getItem('check-slider') === 'true');

    const is_checked = (e) => {
        const checked_value = e.target.checked;
        set_checked(checked_value);
        localStorage.setItem('check-slider', checked_value);
    }

    const slider_changed = (input) => {
        const new_value = input.target.value;
        set_value(new_value);
        set_show_value(true);
        localStorage.setItem('slider-data', new_value);
    };

    useEffect (() => {
        const timer = setTimeout(() => {
            socket.emit("led value req", value);
        }, 500);

        return () => {
            clearTimeout(timer);
            socket.off("led value req");
        }
    }, [value]);

    const slider_blurred = () => {
        set_show_value(false);
    }

    const slider_value_style = {
        left: `${(value / 5) * 100}%`,
    };

    return (
        <div>
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
            <h4 className = ''>LED Control</h4>
            <div className = 'range'>
                <div className = 'slider-value'>
                    <span className = { show_value ? "show" : "" } style = { slider_value_style }>{ value }</span>
                </div>
                <div className="field">
                    <div className='value left'>0</div>
                    <input 
                        type = "range" 
                        min = "0" 
                        max = "5" 
                        value = { value } 
                        onChange = { slider_changed } 
                        onBlur = { slider_blurred }
                        disabled = { !checked }></input>
                    <div className = "value right">5</div>
                </div>
            </div>
        </div>
    );
}

export default Control;
