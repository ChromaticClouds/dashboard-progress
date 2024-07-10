import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import moment from 'moment';
import Outlier from './Outlier';
import './Notification.css';

const Notification = ({ hostNotification, setNoticeCount, unreadNotice }) => {
    const [notice, setNotice] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState([]);

    useEffect(() => {
        const storedUnreadNotifications = JSON.parse(localStorage.getItem('unreadNotice')) || [];
        setUnreadNotifications(storedUnreadNotifications);
    }, []);

    useEffect(() => {
        const processNotice = (key, value) => {
            if (typeof value === 'boolean' && value === true) {
                addNotification(key);
            } else if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(subKey => {
                    processNotice(`${key}.${subKey}`, value[subKey]);
                });
            }
        };

        Object.keys(notice).forEach(key => processNotice(key, notice[key]));
    }, [notice]);

    const addNotification = async (item) => {
        const messages = {
            'temp_out.high': 'Detected High temperature. Take care of it',
            'temp_out.low': 'Detected Low temperature. Take care of it',
            'soil_humid_out.high': 'Too high soil humidity. Refrain from watering.',
            'soil_humid_out.low': 'Too low soil humidity. Need Watering.',
            'water_level_out': 'Water level too low. Need to be refilled.',
        };

        const message = messages[item] || `Unexpected condition: ${item}`;
        const time = moment().toISOString();
        const newNotification = { time, message };

        try {
            await axios.post('http://localhost:5000/api/notification', newNotification);
            setNotifications(prevNotifications => [...prevNotifications, newNotification]);
            setTimeout(() => {
                setNotifications(prevNotifications => prevNotifications.filter(notification => notification.time !== time));
            }, 5000);
            /**
             *  - # 읽지 않은 노티피케이션을 관리하기 위함. useEffect를 통해 초기 렌더링으로 영구 저장된 데이터 로드 후, POST 요청 성공 시, 묶어서 스테이트 영구 저장
             */
            const updatedUnread = [...unreadNotifications, newNotification];
            setUnreadNotifications(updatedUnread);
            localStorage.setItem('unreadNotice', JSON.stringify(updatedUnread));
            /**
             *  - # 읽지 않은 노티피케이션 POST 개수 저장. 마찬가지로 상태 영구저장하여 새로고침 후에도 유지.
             */
            const currentCount = parseInt(localStorage.getItem('noticeCount'), 10);
            const updatedCount = currentCount + 1;
            setNoticeCount(updatedCount);
            localStorage.setItem('noticeCount', updatedCount);
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    };
    /**
     *  - # 상태 변경 시, props를 통해 데이터 전달
     */
    useEffect(() => {
        hostNotification(notifications);
    }, [notifications, hostNotification]);

    useEffect(() => {
        unreadNotice(unreadNotifications);
    }, [unreadNotifications, unreadNotice]);

    return (
        <div>
            <Outlier hostOutlier={setNotice} />
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                        <div className='icon'>
                            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                        </div>
                        <h5 className='text'>
                            {notification.message}
                        </h5>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notification;
