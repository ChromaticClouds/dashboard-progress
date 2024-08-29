import React, { useEffect, useState } from "react";
import moment from "moment";

import useMonthEventStore from "../hooks/useMonthEvents";
import useCalendarEvents from "../hooks/useCalendarEvents";

import Loading from "../Dashboard/Loading/Loading";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Calendar.css'

const Calendar = ({ toChangePost, intoChangePost, intoChangeStatus }) => {
    const { events, loading, getMonthEvents } = useMonthEventStore();
    const { setVisible, visible, setDate, date, setCurrentDate, currentDate } = useCalendarEvents();

    const [onDate, setOnDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    });

    useEffect(() => {
        setCurrentDate({
            year: date?.year,
            month: date?.month - 1,
            string_month: new Date(date?.year, date?.month - 1).toLocaleString('en-GB', { month: 'long' })
        });
    }, [date]);

    useEffect(() => {
        toChangePost(currentDate);
    }, [currentDate, toChangePost]);

    const [hasPost, setHasPost] = useState(false);

    useEffect(() => {
        setHasPost(intoChangePost !== undefined);

        if (hasPost) {
            setOnDate(intoChangePost);
        }
    }, [intoChangePost]);

    const [hasStatus, setHasStatus] = useState(false);

    const [onStatus, setOnStatus] = useState([]);

    useEffect(() => {
        setHasStatus(intoChangePost !== undefined);

        if (hasStatus) {
            setOnStatus(intoChangeStatus);
        }
    }, [intoChangeStatus]);

    const [prev_last_days, set_prev_last_days] = useState([]);
    const [days, set_days] = useState([]);
    const [next_init_days, set_next_init_days] = useState([]);
    const [activeDay, setActiveDay] = useState(new Date().getDate());

    const [month_change_style, set_month_change_style] = useState({ visibility: 'hidden' });
    const [scale, set_scale] = useState(1.3);

    const month_list = Array.from(Array(12), (_, i) => i + 1);

    const prevMonth = () => {
        let newMonth = onDate.month - 1;
        let newYear = onDate.year;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }
        let newStringMonth = new Date(newYear, newMonth).toLocaleString('en-GB', { month: 'long' });
        
        setOnDate({
            year: newYear,
            month: newMonth,
            string_month: newStringMonth
        });
    };

    const nextMonth = () => {
        let newMonth = onDate.month + 1;
        let newYear = onDate.year;
        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        let newStringMonth = new Date(newYear, newMonth).toLocaleString('en-GB', { month: 'long' });

        setOnDate({
            year: newYear,
            month: newMonth,
            string_month: newStringMonth
        });
    };

    useEffect(() => {
        const last_date_of_prev = new Date(onDate.year, onDate.month, 0).getDate();
        const first_date_of_month = new Date(onDate.year, onDate.month, 1);
        const last_date_of_month = new Date(onDate.year, onDate.month + 1, 0).getDate();
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
    }, [onDate]);

    const host_month = (value) => {
        setOnDate({
            year: onDate.year,
            month: value,
            string_month: new Date(onDate.year, value).toLocaleString('en-GB', { month: 'long' })
        });
        set_month_change_style({ visibility: 'hidden' });
    };

    const current_date_click = () => {
        set_month_change_style({ visibility: 'visible' });
        set_scale(1);
    };

    const week = (year, month, day) => {
        let date = new Date(year, month - 1, day).getDay();

        return date;
    };

    const isActiveDay = (day) => {
        const accessDate = new Date();
        return onDate.year === accessDate.getFullYear() &&
               onDate.month === accessDate.getMonth() &&
               day === activeDay;
    };

    const [initDate, setInitDate] = useState({});
    const [finDate, setFinDate] = useState({});
    const [color, setColor] = useState({});

    useEffect(() => {
        if (onStatus.length > 0) {
            const item = onStatus[0];
            if (item) {
                setInitDate(item.initDate);
                setFinDate(item.finDate);
                setColor(item.color);
            }
        }
    }, [onStatus]);

    const isStartDate = (day) => {
        return onDate.year === initDate.year &&
               onDate.month === initDate.month - 1 &&
               day === initDate.day;
    };

    const isEndDate = (day) => {
        return onDate.year === finDate.year &&
               onDate.month === finDate.month - 1 &&
               day === finDate.day;
    };

    const isBetweenDate = (day) => {
        const accessDate = new Date(onDate.year, onDate.month, day);
        const startDate = new Date(initDate.year, initDate.month - 1, initDate.day);
        const endDate = new Date(finDate.year, finDate.month - 1, finDate.day);
    
        return accessDate > startDate && accessDate < endDate;
    };
    
    const isSame = () => {
        return initDate.year === finDate.year &&
               initDate.month - 1 === finDate.month - 1 &&
               initDate.day === finDate.day;
    }

    useEffect(() => {
        if (!visible) {
            setInitDate({});
            setFinDate({});
        }
    }, [visible]);

    useEffect(() => {
        getMonthEvents(onDate.year, onDate.month);
        setActiveDay(new Date().getDate());
    }, [new Date().getDate()]);

    const getEventClass = (day) => {
        const current = new Date(onDate.year, onDate.month, day);
        const currentDateString = current.toDateString();
        let classes = [];
    
        for (const event of events) {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const color = event.color;
    
            if (currentDateString === startDate.toDateString() && currentDateString === endDate.toDateString()) {
                classes.push(`single ${color}`);
                return classes.join(' '); // 일치하는 클래스를 찾으면 바로 리턴
            } 
            
            if (currentDateString === startDate.toDateString()) {
                classes.push(`init ranged ${color}`);
            } 
            
            if (currentDateString === endDate.toDateString()) {
                classes.push(`fin ranged ${color}`);
            } 
            
            if (current > startDate && current < endDate) {
                classes.push(`between ${color}`);
            }
        }
    
        return classes.join(' '); // 이벤트가 없으면 빈 문자열 또는 기본 클래스 리턴
    };

    return (
        <div>
            <div className="calendar-container">
                <header>
                    <p className="current-date" onClick={current_date_click}>
                        {onDate.string_month} {onDate.year}
                    </p>
                    <div className="chevron-icons">
                        <span>
                            <FontAwesomeIcon 
                                icon="fa-solid fa-chevron-left" 
                                onClick={() => {
                                    if ((new Date().getFullYear() + 100) > onDate.year) {
                                        prevMonth();
                                    }
                                }} 
                            />
                        </span>
                        <span>
                            <FontAwesomeIcon 
                                icon="fa-solid fa-chevron-right" 
                                onClick={() => {
                                    if ((new Date().getFullYear() - 100) < onDate.year) {
                                        nextMonth();
                                    }
                                }} 
                            />
                        </span>
                    </div>
                </header>
                <div className="calendar">
                    <div className="week">
                        <span>Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>
                    {loading  
                        ? (
                            <div>
                                <ul className="days center">
                                    <Loading color="black"/>
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <ul className="days origin">
                                    {prev_last_days.map((o, i) => (
                                        <li 
                                            key={i}
                                            className="inactive" 
                                            onClick={(e) => {
                                                setVisible(true);
                                                setDate({
                                                    year: onDate.month === 0 ? onDate.year - 1 : onDate.year,
                                                    month: onDate.month === 0 ? 12 : onDate.month,
                                                    day: o,
                                                    week: week(onDate.year, onDate.month, o)
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
                                                setVisible(true);
                                                setDate({
                                                    year: onDate.year,
                                                    month: onDate.month + 1,
                                                    day: o,
                                                    week: week(onDate.year, onDate.month + 1, o)
                                                });
                                            }}
                                        >
                                            {o}
                                        </li>
                                    ))}
                                    {next_init_days.map((o, i) => (
                                        <li
                                            key={i}
                                            className="inactive" 
                                            onClick={() => {
                                                setVisible(true);
                                                setDate({
                                                    year: onDate.month + 2 === 13 ? onDate.year + 1 : onDate.year,
                                                    month: onDate.month + 2 === 13 ? 1 : onDate.month + 2,
                                                    day: o,
                                                    week: week(onDate.year, onDate.month + 2, o)
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
                                        >
                                            {o}
                                        </li>
                                    ))}
                                    {next_init_days.map((o, i) => (
                                        <li
                                            key={i}
                                            className="inactive"
                                        >
                                            {o}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                    )}
                </div>
                <div className="month-change" style={month_change_style}>
                    <p>{onDate.year}</p>
                    <div className="month-list" style={{ transform: `scale(${scale})` }}>
                        {month_list.map((month) => (
                            <div key={month}>
                                <div 
                                    className={onDate.year === new Date().getFullYear() 
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
        </div>
    );
};

export default Calendar;