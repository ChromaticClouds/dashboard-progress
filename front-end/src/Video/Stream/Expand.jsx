import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Expand.css"

const Expand = ({ onEmbed, onCancel, isVisible, embedError }) => {

    const returnCancel = () => {
        onCancel(true);
    }

    return (
        <div>
            {isVisible ? (
                <div></div>
            ) : (
                <div className="embed-container" onClick={returnCancel}>
                    <div 
                        className="embed-box"
                    >
                        <FontAwesomeIcon icon="fa-solid fa-xmark" className="x-icon" />
                        <div className="size">
                            {embedError ? (
                                <div className="embed-error">
                                    <p>⚠️</p>
                                    <h3>비디오를 불러오는 데 문제가 발생했습니다.</h3>
                                </div>
                            ) : (
                                onEmbed
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Expand;