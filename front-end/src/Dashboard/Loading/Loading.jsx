import React from "react";
import "./Loading.css";

const Loading = ({ color }) => {
    return (
        <div className="loading-bind">
            <div className={`loading-box ${color}`}></div>
            <div className={`loading-box ${color}`}></div>
            <div className={`loading-box ${color}`}></div>
        </div>
    )
}

export default Loading;