import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import useNoticeEvents from "../hooks/notification/useNoticeEvents";
import useClickStore from "../hooks/store/useClickStore";
import useNoticeStore from "../hooks/notification/store/useNoticeStore";

import Loading from "../Dashboard/Loading/Loading";

import "./NotificationBox.css";
import { AiOutlineOpenAI } from "react-icons/ai";
import { faCircleExclamation, faMessage } from "@fortawesome/free-solid-svg-icons";
/**
 * NotificationBox 컴포넌트
 * @param {Function} popupStatus - 알림 팝업창 상태를 설정하는 함수
 * @param {Function} enterEvent - 엔터 이벤트 핸들러 함수
 * @returns {JSX.Element} NotificationBox 컴포넌트
 */
const NotificationBox = ({ popupStatus, enterEvent }) => {
    const {
        getNotification, 
        updateNotification, 
        deleteNotification, 
    } = useNoticeEvents();
    const { isOpened, setIsOpened, initialClick } = useClickStore();
    const { notifications, loading } = useNoticeStore();

    useEffect(() => {
        getNotification();
    }, [])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!isOpened && initialClick) {
                    await updateNotification();
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchNotifications();
    }, [isOpened]);
    /**
     *  - 노티피케이션 박스 영역 참조
     */
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!enterEvent) {
            // 특정 영역 외 클릭 시 발생하는 이벤트
            const popupClose = (e) => {
                if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                    popupStatus(false);
                    setIsOpened(false);
                }
            }
            
            // 이벤트 리스너에 popupClose 함수 등록
            document.addEventListener("mousedown", popupClose);
            return () => { document.removeEventListener("mousedown", popupClose); }
        }
    }, [enterEvent, popupStatus, wrapperRef]);

    const icon = (type) => {
        switch (type) {
            case 'gpt':
                return (
                    <AiOutlineOpenAI className='item'/>
                );
            case 'warning':
                return (
                    <FontAwesomeIcon 
                        icon={faCircleExclamation}
                        className='item'
                    />
                );
            default:
                return (
                    <FontAwesomeIcon 
                        icon={faMessage}
                        className='item'
                    />
                );
        }
    }

    return (
        <div ref={wrapperRef}>
            <section className={`notice-box ${isOpened ? "visible" : ""}`} ref={wrapperRef}>
                {/**
                 *  - # GET 요청 성공 시, Notification 호출
                 */}
                {loading ? (
                    <div className="empty-notice">
                        <Loading color="black" />
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => {  
                        return (
                            <div key={notification._id} className="notice-item">
                                <div className="notice-icon">
                                    <div className="sort">
                                        {icon(notification.type)}
                                    </div>
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
                                <div className="mark-sort">
                                    {!notification.isRead ? (
                                        <FontAwesomeIcon 
                                            icon="fa-solid fa-circle"
                                            className="new-notice-icon"
                                        />
                                    ) : (
                                        null
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-notice">No notifications</div>
                )}
            </section>
            <div 
                className={`delete-notice ${isOpened ? "visible" : ""}`} 
                ref={wrapperRef}
                onClick={deleteNotification}
            >
                Delete
            </div>
        </div>
    )
}

export default NotificationBox;