import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Outlier from './Outlier';
import './Notification.css';

const Notification = ({ forceControl }) => {
    const [notice, setNotice] = useState({});
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        for (const key in notice) {
            if (typeof notice[key] === 'boolean' && notice[key] === true) {
                addNotification(key);
            } 
            else if (typeof notice[key] === 'object' && notice[key] !== null) {
                for (const subKey in notice[key]) {
                    if (notice[key][subKey] === true) {
                        addNotification(`${key}.${subKey}`);
                    }
                }
            }
        }
    }, [notice]);

    const addNotification = (item) => {
        let message = '';

        switch (item) {
            case 'temp_out.high':
                message = 'Detected High temperature. Take care of it';
                break;
            case 'temp_out.low':
                message = 'Detected Low temperature. Take care of it';
                break;
            case 'soil_humid_out.high':
                message = 'Too high soil humidity. Refrain from watering.';
                break;
            case 'soil_humid_out.low':
                message = 'Too low soil humidity. Need Watering.';
                break;
            case 'water_level_out':
                message = 'Water level too low. Need to be refilled.';
                break;
            default:
                message = `Unexpected condition: ${item}`;
        }

        const id = new Date().getTime(); // Unique ID for each notification
        const newNotification = { id, message };

        setNotifications(prevNotifications => [...prevNotifications, newNotification]);

        setTimeout(() => {
            setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
        }, 5000);
    };

    return (
        <div>
            <Outlier hostOutlier={setNotice} />
            <div className="notification-container">
                {notifications.map((notification) => (
                    <span key={notification.id} className="notification-item">
                        <div className='icon'>
                            <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
                        </div>
                        <div className='text'>
                            {notification.message}
                        </div>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Notification;
