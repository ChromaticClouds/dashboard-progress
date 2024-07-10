import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import axios from "axios";
import "./NotificationBox.css";

const NotificationBox = ({ popupNotification, hostNotification, hostMark, popupStatus, enterEvent }) => {
    const [notifications, setNotifications] = useState([]);

    const getNotification = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notification');
            const notificationsData = response.data;
            setNotifications(notificationsData);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getNotification();
    }, [hostNotification]);
    /**
     *  - # 노티피케이션 박스 영역 참조
     */
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!enterEvent) {
            // 특정 영역 외 클릭 시 발생하는 이벤트
            const popupClose = (e) => {
                if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                    popupStatus(false);
                }
            }
            
            // 이벤트 리스너에 popupClose 함수 등록
            document.addEventListener("mousedown", popupClose);
            return () => { document.removeEventListener("mousedown", popupClose); }
        }
    }, [enterEvent, popupStatus, wrapperRef]);

    return (
        <div>
            <section className={`notice-box ${popupNotification ? "visible" : ""}`} ref={wrapperRef}>
                {/**
                 *  - # GET 요청 성공 시, Notification 호출
                 */}
                {notifications.length > 0 ? (
                    notifications.map(notification => {
                        // hostMark 배열에서 일치하는 객체 찾기
                        let matchingHostMark = hostMark.find(obj => obj.time === notification.time);
                        
                        return (
                            <div key={notification._id} className="notice-item">
                                <div className="notice-icon">
                                    <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                                </div>
                                <div className="contents">
                                    <h4 className="notice-time">{moment(notification.time).calendar(null, {
                                        sameDay: '[오늘] HH:mm',
                                        lastDay: '[어제] HH:mm',
                                        lastWeek: 'dddd HH:mm',
                                        sameElse: 'YYYY/MM/DD HH:mm'
                                    })}</h4>
                                    <span className="notice-message">{notification.message}</span>
                                </div>
                                {matchingHostMark ? (
                                    <FontAwesomeIcon 
                                        icon="fa-solid fa-circle"
                                        className="new-notice-icon"
                                    />
                                ) : (
                                    null
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-notice">No notifications</div>
                )}
            </section>
        </div>
    )
}

export default NotificationBox;