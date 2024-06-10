import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TodoList.css';

const TodoList = (props) => {
    const [date, setDate] = useState({});
    const [startToggle, setStartToggle] = useState(false);
    const [endToggle, setEndToggle] = useState(false);

    const [startDate, setStartDate] = useState(['', {}]);
    const [endDate, setEndDate] = useState(['', {}]);

    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('09:00');

    const week = (date) => {
        let getDay = '';

        switch (date) {
            case 0:
                getDay = "Sun";
                break;
            case 1:
                getDay = "Mon";
                break;
            case 2:
                getDay = "Tue";
                break;
            case 3:
                getDay = "Wed";
                break;
            case 4:
                getDay = "Thu";
                break;
            case 5:
                getDay = "Fri";
                break;
            case 6:
                getDay = "Sat";
                break;
            default:
                getDay = "";
                break;
        }

        return getDay;
    }

    useEffect(() => {
        setDate(props.setDate);
        setStartDate([
            `${week(props.setDate.week)}, ${props.setDate.month}/${props.setDate.day}`,
            {
                year: props.setDate.year,
                month: props.setDate.month,
                day: props.setDate.day
            }
        ]);
        setEndDate([
            `${week(props.setDate.week)}, ${props.setDate.month}/${props.setDate.day}`,
            {
                year: props.setDate.year,
                month: props.setDate.month,
                day: props.setDate.day
            }
        ]);
    }, [props.setDate]);

    const handleToggleStartDate = () => {
        setStartToggle(!startToggle);
        if (!startToggle) {
            setEndToggle(false);
            setStartDate([
                `${week(date.week)}, ${date.month}/${date.day}`,
                {
                    year: date.year,
                    month: date.month,
                    day: date.day
                }
            ]);
        }
    };

    const handleToggleEndDate = () => {
        setEndToggle(!endToggle);
        if (!endToggle) {
            setStartToggle(false);
            setEndDate([
                `${week(date.week)}, ${date.month}/${date.day}`,
                {
                    year: date.year,
                    month: date.month,
                    day: date.day
                }
            ]);
        }
    };

    useEffect(() => {
        if (startToggle) {
            setStartDate([
                `${week(date.week)}, ${date.month}/${date.day}`,
                {
                    year: date.year,
                    month: date.month,
                    day: date.day
                }
            ]);

            let initDate = new Date(startDate[1].year, startDate[1].month - 1, startDate[1].day);
            let finDate = new Date(endDate[1].year, endDate[1].month - 1, endDate[1].day);

            if (initDate > finDate) {
                setEndDate(startDate)
            }
        }
    }, [date, startDate]);

    useEffect(() => {
        if (endToggle) {
            setEndDate([
                `${week(date.week)}, ${date.month}/${date.day}`,
                {
                    year: date.year,
                    month: date.month,
                    day: date.day
                }
            ]);

            let initDate = new Date(startDate[1].year, startDate[1].month - 1, startDate[1].day);
            let finDate = new Date(endDate[1].year, endDate[1].month - 1, endDate[1].day);

            if (initDate > finDate) {
                setStartDate(endDate)
            }
        }
    }, [date, endDate]);

    const convertTimeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const convertMinutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const incrementDate = () => {
        let newDate = new Date(date.year, date.month - 1, date.day + 1);
        
        return [
            `${week(newDate.getDay())}, ${newDate.getMonth() + 1}/${newDate.getDate()}`,
            {
                year: newDate.getFullYear(),
                month: newDate.getMonth() + 1,
                day: newDate.getDate()
            }
        ];
    };

    const decrementDate = () => {
        let newDate = new Date(date.year, date.month - 1, date.day - 1);

        return [
            `${week(newDate.getDay())}, ${newDate.getMonth() + 1}/${newDate.getDate()}`,
            {
                year: newDate.getFullYear(),
                month: newDate.getMonth() + 1,
                day: newDate.getDate()
            }
        ];
    }

    useEffect(() => {
        if (startDate[0] === endDate[0]) {
            const startMinutes = convertTimeToMinutes(startTime);
            const endMinutes = convertTimeToMinutes(endTime);

            if (endMinutes <= startMinutes) {
                const newEndMinutes = startMinutes + 60;
                if (newEndMinutes >= 1440) { // 24:00 or beyond
                    setEndDate(incrementDate());
                    setEndTime('00:00');
                } else {
                    setEndTime(convertMinutesToTime(newEndMinutes));
                }
            }
        }
    }, [startDate, startTime]);

    useEffect(() => {
        if (startDate[0] === endDate[0]) {
            const startMinutes = convertTimeToMinutes(startTime);
            const endMinutes = convertTimeToMinutes(endTime);

            if (startMinutes >= endMinutes) {
                const newStartMinutes = endMinutes - 60;
                if (newStartMinutes < 0) {
                    setStartDate(decrementDate());
                    setStartTime('23:00');
                } else {
                    setStartTime(convertMinutesToTime(newStartMinutes));
                }
            }
        }
    }, [endDate, endTime]);

    const [visible, setVisible] = useState(false);

    return (
        <div>
            <div 
                className="todolist-window" 
                style={{
                    display: props.setVisible ? "inline-flex" : "none"
                }}
                onClick = {() => {
                    props.setCancel(!props.setVisible);
                    setStartToggle(false);
                    setEndToggle(false);
                }}
            >
                <div className="sort">
                    <div className="bar">
                        <p>ToDoList - { week(date.week) }, { date.month }/{ date.day }/{ date.year }
                        </p>
                        <FontAwesomeIcon 
                            icon="fa-solid fa-xmark" 
                            className="window-icon"
                            onClick = {() => {
                                props.setCancel(!props.setVisible);
                                setStartToggle(false);
                                setEndToggle(false);
                            }}
                        />
                    </div>
                    <div className="book-cover"
                        onClick={(e) => {e.stopPropagation()}}
                    >
                        <div>
                            <div className="calendar-box">
                                <Calendar
                                    setVisible = { setVisible }
                                    setDate = { setDate }
                                />
                                <div className="submit-form">
                                    <input
                                        className="todo-input"
                                        placeholder={`Add todo-list on ${date.month}/${date.day}`}
                                        autoComplete="off"
                                    ></input>
                                </div>
                            </div>
                        </div>
                        <div className="calendar-box todo-lists">
                            <div className="todo-list">
                                <div className="space">
                                    <div style={{display: "flex", flexDirection: "column"}}>
                                        <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" className="icon" />
                                        <h3>No schedule!</h3>
                                    </div>
                                </div>
                                <input
                                    className="title"
                                    placeholder="Title"
                                    autoComplete="off"
                                ></input>
                                <div className="date-list">
                                    <div>
                                        <div onClick={handleToggleStartDate} className={ startToggle ? "active" : "active inactive" }>
                                            { startDate[0] }
                                        </div>
                                        <input
                                            type="time"
                                            value={ startTime }
                                            onChange={(e) => {setStartTime(e.target.value)}}
                                        ></input>
                                    </div>
                                    <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
                                    <div>
                                        <div onClick={handleToggleEndDate} className={ endToggle ? "active" : "active inactive" }>
                                            { endDate[0] }
                                        </div>
                                        <input
                                            type="time"
                                            value={ endTime }
                                            onChange={(e) => {setEndTime(e.target.value)}}
                                        ></input>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TodoList;
