import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Calendar.css'
import PropTypes from 'prop-types';

const Calender = (props) => {
    const [current_date, set_current_date] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    });

    const [prev_last_days, set_prev_last_days] = useState([]);
    const [days, set_days] = useState([]);
    const [next_init_days, set_next_init_days] = useState([]);
    const [active_day] = useState(new Date().getDate());

    const [month_change_style, set_month_change_style] = useState({ visibility: 'hidden' });
    const [scale, set_scale] = useState(1.3);
    const [isvisible, set_isvisible] = useState(false);

    useEffect(() => {
        set_isvisible(props.clicked)
    }, [props.clicked])

    useEffect(() => {
        set_current_date(props.dateChange)
    }, [props.dateChange])

    const month_list = Array.from(Array(12), (_, i) => i + 1);

    const prev_month = () => {
        set_current_date((prev) => {
            let new_month = prev.month - 1;
            let new_year = prev.year;
            if (new_month < 0) {
                new_month = 11;
                new_year -= 1;
            }
            let new_string_month = new Date(new_year, new_month).toLocaleString('en-GB', { month: 'long' });
            return { year: new_year, month: new_month, string_month: new_string_month };
        });
    };

    const next_month = () => {
        set_current_date((next) => {
            let new_month = next.month + 1;
            let new_year = next.year;
            if (new_month > 11) {
                new_month = 0;
                new_year += 1;
            }
            let new_string_month = new Date(new_year, new_month).toLocaleString('en-GB', { month: 'long' });
            return { year: new_year, month: new_month, string_month: new_string_month };
        });
    };

    useEffect(() => {
        const date = new Date(current_date.year, current_date.month);
        const last_date_of_prev = new Date(current_date.year, current_date.month, 0).getDate();
        const first_date_of_month = new Date(current_date.year, current_date.month, 1);
        const last_date_of_month = new Date(current_date.year, current_date.month + 1, 0).getDate();
        const day_of_week = first_date_of_month.getDay();

        const prev_month_days = [];
        for (let i = day_of_week - 1; i >= 0; i--) {
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
        set_next_init_days(next_month_days);
    }, [current_date]);

    const host_month = (value) => {
        set_current_date({
            year: current_date.year,
            month: value,
            string_month: new Date(current_date.year, value).toLocaleString('en-GB', { month: 'long' })
        });
        set_month_change_style({ visibility: 'hidden' });
    };

    const current_date_click = () => {
        set_month_change_style({ visibility: 'visible' });
        set_scale(1);
    };

    return (
        <div className="calender-container" style={{ marginBottom: props.rotate ? '0px' : '500px' }}>
            <header>
                <p className="current-date" onClick={current_date_click}>
                    {current_date.string_month} {current_date.year}
                </p>
                <div className="chevron-icons">
                    <span><FontAwesomeIcon icon="fa-solid fa-chevron-left" onClick={prev_month} /></span>
                    <span><FontAwesomeIcon icon="fa-solid fa-chevron-right" onClick={next_month} /></span>
                </div>
            </header>
            <div className="calender">
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
                        <li 
                            key={i}
                            className="inactive" 
                            onClick={(e) => {
                            set_isvisible(!isvisible);
                            props.setVisible(!isvisible);
                            props.setDate(current_date);
                            props.setClickDate({
                                year: current_date.month == 0 ? current_date.year - 1 : current_date.year,
                                month: current_date.month == 0 ? 12 : current_date.month, 
                                day: o 
                            })
                        }}>{o}</li>
                    ))}
                    {days.map((o, i) => (
                        <li 
                            key={i} 
                            className={current_date.year === new Date().getFullYear() 
                                && current_date.month === new Date().getMonth() 
                                && o === active_day 
                                ? "active" 
                                : ""} 
                            onClick={(e) => {
                            set_isvisible(!isvisible);
                            props.setVisible(!isvisible);
                            props.setDate(current_date);
                            props.setClickDate({ 
                                year: current_date.year, 
                                month: current_date.month + 1, 
                                day: o 
                            })
                        }}>
                            {o}
                        </li>
                    ))}
                    {next_init_days.map((o, i) => (
                        <li 
                            key={i}
                            className="inactive" 
                            onClick={() => {
                            set_isvisible(!isvisible);
                            props.setVisible(!isvisible);
                            props.setDate(current_date);
                            props.setClickDate({ 
                                year: current_date.month + 2 == 13 ? current_date.year + 1 : current_date.year,
                                month: current_date.month + 2 == 13 ? 1 : current_date.month + 2, 
                                day: o 
                            })
                        }}>{o}</li>
                    ))}
                </ul>
            </div>
            <div className="month-change" style={month_change_style}>
                <p>{current_date.year}</p>
                <div className="month-list" style={{ transform: `scale(${scale})` }}>
                    {month_list.map((month) => (
                        <div key={month}>
                            <div 
                                className={current_date.year === new Date().getFullYear() 
                                    && month === new Date().getMonth() + 1 
                                    ? "active-month" 
                                    : "inactive-month"} 
                                onClick={() => { host_month(month - 1);
                                set_scale(1.3); }}>
                                {month}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

Calender.propTypes = {
    setDate: PropTypes.func.isRequired
};

export default Calender;
