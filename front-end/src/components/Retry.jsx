import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import styled, { keyframes, css } from 'styled-components';

// 빠르게 회전하는 애니메이션
const fastRotation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(900deg); }
`;

// 느리게 회전하는 애니메이션
const slowRotation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(1800deg); }
`;

// FontAwesomeIcon에 스타일 적용
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    font-size: 1.6rem;
    ${({ animate }) => animate && css`
        animation: ${fastRotation} 2s cubic-bezier(0.12, 0, 0.76, 0) forwards,
                   ${slowRotation} 2s cubic-bezier(0.22, 1, 0.36, 1) forwards 2s;
    `}
`;

// 버튼 스타일 정의
const ResetButton = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 20px;
    background-color: #fff;
    border: 5px solid #555e90;
    cursor: pointer;
    color: #555e90;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)}; /* 비활성화 시 투명도 조절 */
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')}; /* 클릭 이벤트 비활성화 */
`;


const Retry = ({ hostClick }) => {
    const [animate, setAnimate] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const resetAnimation = () => {
        // 애니메이션을 활성화하고 부모 컴포넌트의 함수 호출
        setDisabled(true);
        setAnimate(true);
        hostClick();
        // 애니메이션이 끝난 후 애니메이션 상태 초기화
        setTimeout(() => {
            setAnimate(false);
            setDisabled(false);
        }, 4000); // 4초 후 초기화 (애니메이션 총 길이에 맞게 설정)
    };

    return (
        <ResetButton
            onClick={resetAnimation}
            disabled={disabled}
        >
            <StyledFontAwesomeIcon
                icon={faRotate} 
                animate={animate} 
            />
        </ResetButton>
    );
};

export default Retry;
