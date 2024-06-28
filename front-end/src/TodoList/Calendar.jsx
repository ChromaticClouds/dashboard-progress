import React, { useEffect, useState } from "react";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Calendar.css'

const Calendar = (props) => {
    const [current_date, set_current_date] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    });

    useEffect(() => {
        props.viewDate(current_date)
    }, [current_date])

    const [prev_last_days, set_prev_last_days] = useState([]);
    const [days, set_days] = useState([]);
    const [next_init_days, set_next_init_days] = useState([]);
    const [active_day] = useState(new Date().getDate());

    const [month_change_style, set_month_change_style] = useState({ visibility: 'hidden' });
    const [scale, set_scale] = useState(1.3);

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

    const [visible] = useState(false);

    const week = (year, month, day) => {
        let date = new Date(year, month - 1, day).getDay();

        return date;
    };

    const isActiveDay = (day) => {
        const currentDate = new Date();
        return current_date.year === currentDate.getFullYear() &&
               current_date.month === currentDate.getMonth() &&
               day === active_day;
    };

    const [status, setStatus] = useState([]);

    useEffect(() => {
        setStatus(props.onStatus);
    }, [props.onStatus]);

    const [initDate, setInitDate] = useState({});
    const [finDate, setFinDate] = useState({});
    const [color, setColor] = useState({});

    useEffect(() => {
        if (status) {
            const item = status[0];
            if (item) {
                setInitDate(item.initDate);
                setFinDate(item.finDate);
                setColor(item.color);
            }
        }
    }, [status]);

    const isStartDate = (day) => {
        return current_date.year === initDate.year &&
               current_date.month === initDate.month - 1 &&
               day === initDate.day;
    };

    const isEndDate = (day) => {
        return current_date.year === finDate.year &&
               current_date.month === finDate.month - 1 &&
               day === finDate.day;
    };

    const isBetweenDate = (day) => {
        const currentDate = new Date(current_date.year, current_date.month, day);
        const startDate = new Date(initDate.year, initDate.month - 1, initDate.day);
        const endDate = new Date(finDate.year, finDate.month - 1, finDate.day);
    
        return currentDate > startDate && currentDate < endDate;
    };
    
    const isSame = () => {
        return initDate.year === finDate.year &&
               initDate.month - 1 === finDate.month - 1 &&
               initDate.day === finDate.day;
    }

    useEffect(() => {
        if (!props.isVisible) {
            setInitDate({});
            setFinDate({});
        }
    }, [props.isVisible])

    useEffect(() => {
        if (props.isVisible) {
            set_current_date(props.currentDate);
        }
    }, [props.currentDate]);

    const [events, setEvents] = useState([]);

    const monthEvents = async (year, month) => {
        try {
            const startDate = new Date(year + 100, month, 1);
            const endDate = new Date(year - 100, month + 1, 0);
    
            const response = await axios.get('http://localhost:5000/api/calendar/month', {
                params: {
                    startDate,
                    endDate
                }
            });
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        monthEvents(current_date.year, current_date.month);
    }, [current_date, props.detectTodo]);

    const getEventClass = (day) => {
        const current = new Date(current_date.year, current_date.month, day);
        let classes = [];

        events.forEach(event => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const color = event.color;

            if (current.toDateString() === startDate.toDateString() && current.toDateString() === endDate.toDateString()) {
                classes.push(`single ${color}`);
            } else if (current.toDateString() === startDate.toDateString()) {
                classes.push(`init ${color}`);
            } else if (current.toDateString() === endDate.toDateString()) {
                classes.push(`fin ${color}`);
            } else if (current > startDate && current < endDate) {
                classes.push(`between ${color}`);
            } else {
                classes.push('ranged')
            }
        });

        return classes.join(' ');
    };

    return (
        <div className="calendar-container">
            <header>
                <p className="current-date" onClick={current_date_click}>
                    {current_date.string_month} {current_date.year}
                </p>
                <div className="chevron-icons">
                    <span>
                        <FontAwesomeIcon 
                            icon="fa-solid fa-chevron-left" 
                            onClick={() => {
                                if ((new Date().getFullYear() + 100) > current_date.year) {
                                    prev_month();
                                }
                            }} 
                        />
                    </span>
                    <span>
                        <FontAwesomeIcon 
                            icon="fa-solid fa-chevron-right" 
                            onClick={() => {
                                if ((new Date().getFullYear() - 100) < current_date.year) {
                                    next_month();
                                }
                            }} 
                        />
                    </span>
                </div>
            </header>
            <div className="calendar">
                <ul className="week">
                    <li>Sun</li>
                    <li>Mon</li>
                    <li>Tue</li>
                    <li>Wed</li>
                    <li>Thu</li>
                    <li>Fri</li>
                    <li>Sat</li>
                </ul>
                <ul className="days origin">
                    {prev_last_days.map((o, i) => (
                        <li 
                            key={i}
                            className="inactive" 
                            onClick={(e) => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.month === 0 ? current_date.year - 1 : current_date.year,
                                    month: current_date.month === 0 ? 12 : current_date.month,
                                    day: o,
                                    week: week(current_date.year, current_date.month, o)
                                });
                            }}
                        >
                            {o}
                        </li>
                    ))}
                    {days.map((o, i) => (
                        <li 
                            key={i} 
                            className={
                                `${getEventClass(o)}`
                            }                            
                            onClick={(e) => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.year,
                                    month: current_date.month + 1,
                                    day: o,
                                    week: week(current_date.year, current_date.month + 1, o)
                                });
                            }}
                        >
                            {o}
                        </li>
                    ))}
                    {next_init_days.map((o, i) => (
                        <li
                            className="inactive" 
                            onClick={() => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.month + 2 === 13 ? current_date.year + 1 : current_date.year,
                                    month: current_date.month + 2 === 13 ? 1 : current_date.month + 2,
                                    day: o,
                                    week: week(current_date.year, current_date.month + 2, o)
                                });
                            }}
                        >
                            {o}
                        </li>
                    ))}
                </ul>
                <ul className="days cover">
                    {prev_last_days.map((o, i) => (
                        <li 
                            key={i}
                            className="inactive" 
                            onClick={(e) => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.month === 0 ? current_date.year - 1 : current_date.year,
                                    month: current_date.month === 0 ? 12 : current_date.month,
                                    day: o,
                                    week: week(current_date.year, current_date.month, o)
                                });
                            }}
                        >
                            {o}
                        </li>
                    ))}
                    {days.map((o, i) => (
                        <li 
                            key={i} 
                            className={`
                                ${isSame() ? "" : "ranged"}
                                ${isActiveDay(o) ? "active" : ""}
                                ${isStartDate(o) ? "init" : ""}
                                ${isEndDate(o) ? "fin" : ""}
                                ${isBetweenDate(o) ? "between" : ""}
                                ${color}
                                `
                            }                            
                            onClick={(e) => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.year,
                                    month: current_date.month + 1,
                                    day: o,
                                    week: week(current_date.year, current_date.month + 1, o)
                                });
                            }}
                        >
                            {o}
                        </li>
                    ))}
                    {next_init_days.map((o, i) => (
                        <li
                            className="inactive" 
                            onClick={() => {
                                props.setVisible(!visible);
                                props.setDate({
                                    year: current_date.month + 2 === 13 ? current_date.year + 1 : current_date.year,
                                    month: current_date.month + 2 === 13 ? 1 : current_date.month + 2,
                                    day: o,
                                    week: week(current_date.year, current_date.month + 2, o)
                                });
                            }}
                        >
                            {o}
                        </li>
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

export default Calendar;