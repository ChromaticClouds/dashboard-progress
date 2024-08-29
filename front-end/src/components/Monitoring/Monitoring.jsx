import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFillDrip, faFan, faLightbulb, faBarsProgress, faWifi, faSeedling, faFire } from '@fortawesome/free-solid-svg-icons';

const getSensorIcon = (sensorType) => {
    /**
     *  - # 키-값 형태로 센서 이름 및 아이콘 정렬
     */
    const iconMap = {
        "Water Pump": faFillDrip,
        "Cooling Fan": faFan,
        "Neopixel LED 1": faLightbulb,
        "Neopixel LED 2": faLightbulb,
        "Neopixel LED 3": faLightbulb,
        "Water Level Sensor": faBarsProgress,
        "Ultrasonic Sensor 1": faWifi,
        "Ultrasonic Sensor 2": faWifi,
        "Ultrasonic Sensor 3": faWifi,
        "Soil Moisture Sensor 1": faSeedling,
        "Soil Moisture Sensor 2": faSeedling,
        "Soil Moisture Sensor 3": faSeedling,
        "Heater": faFire,
    };

    return iconMap[sensorType] || null;
};
/** - # --------------------------------------- # -
 *      props로 전달받은 monitoring 스테이트 처리
 *  - # */
const Monitoring = ({ monitoring }) => {
    return (
        <div>
            {monitoring.map((control, index) => (
                <div key={index} className="control-item">
                    <div className="control-icon-sort">
                        {/*
                            - # 각 센서 타입에 따른 아이콘 정의
                        */}
                        <p>
                            {getSensorIcon(control.sensor_type) && (
                                <FontAwesomeIcon icon={getSensorIcon(control.sensor_type)} />
                            )}
                        </p>
                    </div>
                    <div className="control-value1">
                        {/*
                            - # 1. 각 센서 타입명 정의
                        */}
                        <p>{control.sensor_type}</p>
                    </div>
                    <div className="control-value2">
                        {/*
                            - # 2. 각 센서당 파워값 처리 (binary type)
                        */}
                        <p style={{ color: control.power === 1 ? "teal" : "orange" }}>
                            {control.power === 1 ? "▲" : "▼"}
                        </p>
                    </div>
                    <div className="control-value3">
                        {/*
                            - # 3. 각 센서당 센서값 처리
                        */}
                        <p>{control.measures}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Monitoring;
