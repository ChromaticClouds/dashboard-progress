import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFillDrip, faFan, faLightbulb, faBarsProgress, faTemperatureLow, faWifi, faSeedling, faFire } from '@fortawesome/free-solid-svg-icons';

const getSensorIcon = (sensorType) => {
    const iconMap = {
        "Water Pump": faFillDrip,
        "Cooling Fan": faFan,
        "Neopixel LED 1": faLightbulb,
        "Neopixel LED 2": faLightbulb,
        "Neopixel LED 3": faLightbulb,
        "Water Level Sensor": faBarsProgress,
        "DHT Sensor": faTemperatureLow,
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

const Monitoring = ({ monitoring_data }) => {
    return (
        <div>
            {monitoring_data.map((control, index) => (
                <div key={index} className="control-item">
                    <div className="control-icon-sort">
                        <p>
                            {getSensorIcon(control.sensor_type) && (
                                <FontAwesomeIcon icon={getSensorIcon(control.sensor_type)} />
                            )}
                        </p>
                    </div>
                    <div className="control-value1">
                        <p>{control.sensor_type}</p>
                    </div>
                    <div className="control-value2">
                        <p style={{ color: control.power === 1 ? "teal" : "orange" }}>
                            {control.power === 1 ? "▲" : "▼"}
                        </p>
                    </div>
                    <div className="control-value3">
                        <p>{control.measures}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Monitoring;
