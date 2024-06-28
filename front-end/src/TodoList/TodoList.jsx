import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Calendar from "./Calendar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TodoList.css';

const TodoList = (props) => { //props를 이용하여 Calendar, Title 컴포넌트 와의 스테이트 공유
    const [date, setDate] = useState({}); // Calendar 컴포넌트의 클릭된 날짜의 year, month, day, week 스테이트 할당
    const [startToggle, setStartToggle] = useState(false); // 시작 날짜의 토글 여부
    const [endToggle, setEndToggle] = useState(false); // 종료 날짜의 토글 여부
    const [startDate, setStartDate] = useState(['', {}]); // 날짜의 데이터를 배열 형식으로 보관 ['날짜포맷', { yaer, month, day }]
    const [endDate, setEndDate] = useState(['', {}]);
    const initialTime = {
        startTime: '08:00',
        endTime: '09:00'
    }
    const [startTime, setStartTime] = useState(initialTime.startTime); // 디폴트 타임
    const [endTime, setEndTime] = useState(initialTime.endTime);
    const [currentDate, setCurrentDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    });

    const week = (date) => { // getDay() 메서드로 받아온 week 스테이트 키값을 스트링 포맷
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

    /** todo 리스트 팝업 창 등장 시 날짜 초기화 */
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
        setCurrentDate({
            year: date.year,
            month: date.month - 1,
            string_month: new Date(date.year, date.month - 1, date.day).toLocaleString('en-GB', { month: 'long' })
        })
    }, [date])

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
        }
    }, [date]);

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
        }
    }, [date]);

    /** 종료날짜 > 시작날짜일 시, 종료날짜 갱신 */
    useEffect(() => {
        let initDate = new Date(startDate[1].year, startDate[1].month - 1, startDate[1].day);
        let finDate = new Date(endDate[1].year, endDate[1].month - 1, endDate[1].day);

        if (initDate > finDate) {
            setEndDate(startDate)
        }
    }, [startDate]);

    /** 시작날짜 > 종료날짜일 시, 시작날짜 갱신 */
    useEffect(() => {
        let initDate = new Date(startDate[1].year, startDate[1].month - 1, startDate[1].day);
        let finDate = new Date(endDate[1].year, endDate[1].month - 1, endDate[1].day);

        if (initDate > finDate) {
            setStartDate(endDate)
        }
    }, [endDate]);

    // time --> minutes으로 변환
    const convertTimeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // minutes --> time으로 변환
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

    // 시작타임 설정 시, 종료타임과 1시간 텀
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

    // 종료타임 설정 시, 시작타임과 1시간 텀
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

    useEffect(() => {
        if (props.setVisible) {
            setVisible(true)
        }
        else {
            setVisible(false)
        }
    }, [props.setVisible])

    // color 드롭다운 메뉴 활성여부
    const [showColor, setShowColor] = useState(false);
    const dropdown = () => {
        setShowColor(!showColor);
    }

    // event 드롭다운 메뉴 활성여부
    const [droplet, setDroplet] = useState(false);
    const dropMenu = () => {
        setDroplet(!droplet);
    }

    // 컬러 리스트
    const [items, setItems] = useState([
        {
            color: 'red', 
            className: 'red'
        },
        { 
            color: 'yellow', 
            className: 'yellow'
        },
        { 
            color: 'green', 
            className: 'green'
        }, 
        { 
            color: 'blue',
            className: 'blue'
        },
        { 
            color: 'purple',
            className: 'purple'
        }
    ]);

    // 선택한 컬러 상단 위치
    const moveToTop = (index) => {
        const newItems = [...items];
        const [item] = newItems.splice(index, 1);
        newItems.unshift(item);
        setItems(newItems);
    };

    const [selectedIndex, setSelectedIndex] = useState(null);
    const lists = [
        { 
            text: '물 주기', 
            icon: "fa-solid fa-fill-drip" 
        },
        { 
            text: '씨앗 심기', 
            icon: "fa-solid fa-seedling" 
        },
        { 
            text: '분갈이', 
            icon: "fa-solid fa-rotate" 
        },
        { 
            text: '지지대 심기', 
            icon: "fa-solid fa-ruler" 
        },
        { 
            text: '영양분 주기', 
            icon: "fa-brands fa-nutritionix" 
        },
    ];

    const listClick = (index) => {
        setSelectedIndex(index);
        setDroplet(false);
    };

    const [status, setStatus] = useState([])

    useEffect(() => {
        if ((startToggle || endToggle) && props.setVisible) {
            const status = [
                {
                    initDate: startDate[1],
                    finDate: endDate[1],
                    color: items[0].color,
                }
            ];
            setStatus(status);
        }
    }, [items, startDate, endDate, startToggle, endToggle, props.setVisible]);

    const now = new Date();

    const [todoForm, setTodoForm] = useState(
        {
            title: "",
            todo: "",
            message: "",
            startDate: now,
            startTime: startTime,
            endDate: now,
            endTime: endTime,
            color: items[0].color,
            event: {
                text: selectedIndex ? lists[selectedIndex].text : null,
                icon: selectedIndex ? lists[selectedIndex].icon : null
            },
        }
    );

    const inputChange = (e) => {
        const { name, value } = e.target;
        setTodoForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    useEffect(() => {
        setTodoForm(prevForm => ({ ...prevForm, event: 
            {
                text: selectedIndex ? lists[selectedIndex].text : null,
                icon: selectedIndex ? lists[selectedIndex].icon : null
            } 
        }));
    }, [selectedIndex]);

    useEffect(() => {
        if (items.length > 0) {
            setTodoForm(prevForm => ({ ...prevForm, color: items[0].color }));
        }
    }, [items]);

    useEffect(() => {
        if (date) {
            setTodoForm(prevForm => ({
                ...prevForm,
                startDate: new Date(startDate[1].year, startDate[1].month - 1, startDate[1].day).toLocaleDateString(),
                endDate: new Date(endDate[1].year, endDate[1].month - 1, endDate[1].day).toLocaleDateString(),
            }));
        }
    }, [startDate, endDate]);

    useEffect(() => {
        setTodoForm(prevForm => ({ 
            ...prevForm, 
            startTime: startTime,
            endTime: endTime }));
    }, [startTime, endTime]);

    const inputRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

    const clearInputs = () => {
        inputRefs.current.forEach((ref, index) => {
            ref.current.value = ''
        });
        setStartTime(initialTime.startTime);
        setEndTime(initialTime.endTime);
        setSelectedIndex(null);
    }

    const submitForm = async (formData) => {
        try {
            const response = await axios.post('http://localhost:5000/api/calendar', formData);
            console.log(response.data);
            alert('스케줄 등록이 완료됐습니다.');
            getDate();
            clearInputs();
            setTodoForm({...todoForm, message:'', title: '', todo: ''})
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('스케줄 등록에 실패했습니다.');
        }
    }
    
    const enterData = async (e) => {
        if (e.key === "Enter") {
            await submitForm(todoForm);
        }
    }
    
    const recruitData = async () => {
        await submitForm(todoForm);
    }

    const [viewDate, setViewDate] = useState([]);
    const [viewTodo, setViewTodo] = useState([]);

    const getDate = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/calendar', {
                params: {
                    startDate: new Date(date.year, date.month - 1, date.day),
                    endDate: new Date(date.year, date.month - 1, date.day)
                }
            });
            setViewTodo(response.data)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (date.year) {
            getDate();
        }
    }, [date]);

    useEffect(() => {
        props.detectTodo(viewTodo);
    }, [viewTodo])

    const [selectedTodos, setSelectedTodos] = useState([]);

    const recruitChecked = (todoId) => {
        setSelectedTodos(prevSelected => {
            if (prevSelected.includes(todoId)) {
                return prevSelected.filter(id => id !== todoId);
            } else {
                return [...prevSelected, todoId];
            }
        });
    };

    const [expand, setExpand] = useState(false);

    const deleteTodos = async () => {
        try {
            await axios.delete('http://localhost:5000/api/calendar', {
                data: { ids: selectedTodos }
            });
            // 삭제 후 상태 업데이트
            setViewTodo(viewTodo.filter(todo => !selectedTodos.includes(todo._id)));
            setSelectedTodos([]);
            alert('선택된 일정이 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting todos:', error);
            alert('일정 삭제에 실패했습니다.');
        }
    };

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
                    setShowColor(false);
                    setDroplet(false);
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
                                setShowColor(false);
                                setDroplet(false);
                            }}
                        />
                    </div>
                    <div className="book-cover"
                        onClick={(e) => {e.stopPropagation()}}
                    >
                        <div>
                            <div className="calendar-box">
                                <Calendar
                                    isVisible = { visible }
                                    setVisible = { setVisible }
                                    setDate = { setDate }
                                    onStatus = { status }
                                    currentDate = { currentDate }
                                    viewDate = { setViewDate }
                                    detectTodo = { viewTodo }
                                />
                                <div className="submit-form">
                                    <input
                                        name="todo"
                                        className="todo-input"
                                        placeholder={`Add todo-list on ${date.month}/${date.day}`}
                                        autoComplete="off"
                                        onKeyDown={enterData}
                                        onChange={inputChange}
                                        ref={inputRefs.current[0]}
                                    ></input>
                                     <FontAwesomeIcon 
                                        icon="fa-solid fa-circle-chevron-right" 
                                        className="icon"
                                        onClick={recruitData}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="calendar-box todo-lists">
                            <div className="todo-list">
                                <div className="sub-bar">
                                    <div className="sub">Today Lists</div>
                                    <button 
                                        onMouseEnter={() => setExpand(true)}
                                        onMouseLeave={() => setExpand(false)}
                                        onClick={() => selectedTodos.length > 0 ? deleteTodos() : alert("최소 1개 이상은 선택해주세요.")}
                                    >
                                        <FontAwesomeIcon icon="fa-solid fa-xmark" className="icon" />
                                        <span
                                            style={{marginLeft: expand ? "10px" : "", opacity: expand ? "1" : "0"}} 
                                            className="button-text"
                                        >{expand ? "Delete" : null}</span>
                                    </button>
                                </div>
                                    {viewTodo.length > 0 ? (
                                        <div className="space sort">
                                            {viewTodo.map(todo => (
                                                <div className="todo-box" key={todo._id}>
                                                    <div className={`color ${todo.color}`}></div>
                                                    <div className="text-sort">
                                                        <span className="todo-title">{todo.title}</span>
                                                        <div className="contents">
                                                            <div>{todo.event.text}</div>
                                                            <div className="time">{todo.todo === '' ? `${todo.startTime} - ${todo.endTime}` : "All Day"}</div>
                                                            <span>{todo.todo === '' ? todo.message : todo.todo}</span>
                                                        </div>
                                                    </div>
                                                    <input 
                                                        type="checkbox"
                                                        onChange={() => recruitChecked(todo._id)}
                                                    ></input>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space">
                                            <div style={{display: "flex", flexDirection: "column"}}>
                                                <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" className="icon" />
                                                <h3>No schedule!</h3>
                                            </div>
                                        </div>
                                    )}
                                <input
                                    name="title"
                                    className="title"
                                    placeholder="Title"
                                    autoComplete="off"
                                    onChange={inputChange}
                                    ref={inputRefs.current[1]}
                                ></input>
                                <div className="date-list">
                                    <div>
                                        <div onClick={handleToggleStartDate} className={ startToggle ? "active" : "active inactive" }>
                                            { startDate[0] }
                                        </div>
                                        <input
                                            name="startTime"
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
                                            name="endTime"
                                            type="time"
                                            value={ endTime }
                                            onChange={(e) => {setEndTime(e.target.value)}}
                                        ></input>
                                    </div>
                                </div>
                                <div className="event-box">
                                    <div className="dropbox">
                                        <div className="color-picker"
                                            style = {{
                                                height: showColor ? "238px" : "50px"
                                            }}
                                        >
                                            <ul>
                                                {items.map((item, index) => (
                                                    <li key={index} 
                                                        onClick={() => {
                                                            moveToTop(index),
                                                            dropdown()
                                                        }}
                                                        className={item.className}
                                                    >
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="selected" onClick={(e) => {dropMenu()}}>
                                        <div id = "selected">
                                            {selectedIndex !== null ? lists[selectedIndex].text : '선택하세요'}
                                        </div>
                                        <div>
                                            <FontAwesomeIcon 
                                                icon="fa-solid fa-rotate-left" 
                                                className="reset-lists"
                                                onClick={(e) => {setSelectedIndex(null), e.stopPropagation()}}
                                            />
                                        </div>
                                        <FontAwesomeIcon 
                                            icon="fa-solid fa-caret-down"
                                            className="caret"
                                        />
                                        <ul 
                                            className="menu" 
                                            style = {{
                                                height: droplet ? "178px" : "0px",
                                                cursor: "auto"
                                            }}
                                            onClick={(e) => {e.stopPropagation()}}
                                        >
                                            {lists.map((item, index) => (
                                                <li key={index} onClick={() => listClick(index)}>
                                                    <FontAwesomeIcon icon={item.icon} />
                                                    <p>{item.text}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="submit-box">
                                    <input
                                        name="message"
                                        className="todo-input left"
                                        placeholder="Todo for..."
                                        autoComplete="off"
                                        onKeyDown={enterData}
                                        onChange={inputChange}
                                        ref={inputRefs.current[2]}
                                    ></input>
                                    <FontAwesomeIcon 
                                        icon="fa-solid fa-circle-chevron-right" 
                                        className="icon"
                                        onClick={recruitData}
                                    />
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