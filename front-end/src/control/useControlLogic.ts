import useControlMode from "./useControlMode";
import useLedControl from "./useLedControl";
import useWaterPumpControl from "./useWaterPumpControl";
import useFanControl from "./useFanControl";
import useSensorStatus from "./useSensorStatus";

const useControlLogic = () => {
  const controlMode = useControlMode();
  const sensorStatus = useSensorStatus();
  const ledControl = useLedControl(controlMode.checked);
  const waterPumpControl = useWaterPumpControl(
    controlMode.checked,
    sensorStatus.sensorData,
    sensorStatus.recentDate,
  );
  const fanControl = useFanControl(controlMode.checked);

  return {
    mode: controlMode,
    led: ledControl,
    waterPump: waterPumpControl,
    fan: fanControl,
    sensorStatus,
  };
};

export default useControlLogic;
