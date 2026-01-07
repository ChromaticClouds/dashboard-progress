import React, { useState } from "react";
import "./Tooltip.css"; // 툴팁 스타일을 위한 CSS 파일

interface TooltipProps { 
  text?: string;
  children: React.ReactNode
};

export const Tooltip = ({ 
  text, 
  children 
}: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // 마우스 이동 시 툴팁 위치를 업데이트하는 함수
  const handleMouseMove = (e) => {
    const { clientX: x, clientY: y } = e;

    setTooltipPosition({ top: y - 40, left: x }); // 마우스 위치에 따라 툴팁 위치 조정
  };

  // 마우스 진입 시 툴팁 표시
  const handleMouseEnter = () => {
    setShowTooltip(true);
    window.addEventListener("mousemove", handleMouseMove);
  };

  // 마우스 벗어날 시 툴팁 숨김
  const handleMouseLeave = () => {
    setShowTooltip(false);
    window.removeEventListener("mousemove", handleMouseMove);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-block" }} // 자식 요소에 따라 크기 조정
    >
      {showTooltip && (
        <div
          className="tooltip"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          {text}
        </div>
      )}
      {children}
    </div>
  );
};

export default Tooltip;
