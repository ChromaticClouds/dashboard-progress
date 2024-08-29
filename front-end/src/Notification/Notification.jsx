import { useEffect } from 'react';

import Outlier from './Outlier';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';

import useOutlierStore from '../hooks/outlier/useOutlierStore';
import useNoticeEvents from '../hooks/notification/useNoticeEvents';
import useNoticeStore from '../hooks/notification/store/useNoticeStore';
import './Notification.css';
import { AiOutlineOpenAI } from 'react-icons/ai';

const Notification = () => {
    const { postNotification } = useNoticeEvents();
    const { popup } = useNoticeStore();
    const { outlier } = useOutlierStore();

    const getAlarm = async () => {
        try {
            await Promise.all(outlier.map(
                message => postNotification(message)
            ));
        } catch {
            console.log(alarmError);
        }
    }

    useEffect(() => {
        if (outlier.length > 0) {
            getAlarm();
        }
    }, [outlier]);

    const icon = (type) => {
        switch (type) {
            case 'gpt':
                return <AiOutlineOpenAI />
            case 'warning':
                return <FontAwesomeIcon icon={faCircleExclamation}/>
            default:
                return <FontAwesomeIcon icon={faMessage}/>
        }
    }

    return (
        <div>
            <Outlier />
            <div className="notification-container">
                {Array.isArray(popup) && popup.length > 0 ? (
                    popup.map((notification) => (
                        <div key={notification._id} className="notification-item">
                            <div className='icon'>
                                {icon(notification.type)}
                            </div>
                            <span className='text'>
                                {notification.message}
                            </span>
                        </div>
                    ))
                ) : (
                    null
                )}
            </div>
        </div>
    );
};

export default Notification;
