import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useTodoEvents from "../hooks/useTodoEvents";
import useMonthEventStore from "../hooks/useMonthEvents";

import Loading from "../Dashboard/Loading/Loading";
import Retry from "../components/Retry";

const TodayTodos = () => {
    const { events } = useMonthEventStore();
    const { todos, getTodayTodos, todosLoading } = useTodoEvents();

    useEffect(() => {
        getTodayTodos();
    }, [events]);

    const hostTodos = () => {
        getTodayTodos();
    }

    return (
        <div>
            <div className='flat'>
                <h4 className = "today-weather todolist-title">Todo-list</h4>
                <Retry hostClick={hostTodos}/>
            </div>
            <div className="todo-list">
                <div className="todo-bar">
                    <p>Todo-List 📅</p>
                </div>
                {todosLoading ? (
                    <div className="lists">
                        <div className="non-exist exist center">
                            <Loading text="grey"/>
                        </div>
                    </div>
                ) : todos.length > 0 ? (
                    <div className="lists sort">
                        <div className="non-exist exist">
                            {todos.map(todo => (
                                <div key={todo._id} className="todo-box">
                                    <div className="circle">
                                        <div className={`color ${todo.color}`}></div>
                                    </div>
                                    <div className="text-field">
                                        <div className="time">
                                            {todo.todo === '' ? `${todo.startTime} - ${todo.endTime}` : "All Day"}
                                        </div>
                                        <div className="contents">
                                            <div className="todo-title">{todo.title}</div>
                                            <span>{todo.todo === '' ? todo.message : todo.todo}</span>
                                        </div>
                                    </div>
                                    {todo.event.text && (
                                        <div className={`icon-box color ${todo.color}`}>
                                            <FontAwesomeIcon icon={todo.event.icon} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="lists">
                        <div className="non-exist">
                            <FontAwesomeIcon icon="fa-solid fa-face-sad-tear" className="icon" />
                            <h3 className="text">No Schedule...</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TodayTodos;