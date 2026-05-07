import { ChangeEvent, useEffect, useState } from "react";

const useControlMode = () => {
  const [checked, setChecked] = useState<boolean>(
    localStorage.getItem("check-slider") === "true",
  );

  const handleModeToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  useEffect(() => {
    localStorage.setItem("check-slider", String(checked));
  }, [checked]);

  return { checked, handleModeToggle };
};

export default useControlMode;
