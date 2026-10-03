import { useEffect, useState } from 'react';

// 위치를 받지 못했을 때 쓰는 기본 좌표 (서울시청)
export const FALLBACK_POSITION = { latitude: 37.5665, longitude: 126.978, source: 'fallback' };

const REFRESH_MS = 60000;
const GEO_OPTIONS = { timeout: 5000, maximumAge: 10 * 60 * 1000 };

let current = null;
let pending = false;
let timer = null;
const listeners = new Set();

const publish = (next) => {
    // 좌표가 그대로면 새 객체를 만들지 않는다. 받는 쪽 effect가 다시 돌지 않게 하기 위해서다.
    if (
        current &&
        current.source === next.source &&
        current.latitude.toFixed(4) === next.latitude.toFixed(4) &&
        current.longitude.toFixed(4) === next.longitude.toFixed(4)
    ) {
        return;
    }
    current = next;
    listeners.forEach((listener) => listener(current));
};

const requestPosition = () => {
    if (pending) return;

    if (!navigator.geolocation) {
        publish(FALLBACK_POSITION);
        return;
    }

    pending = true;
    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            pending = false;
            publish({ latitude: coords.latitude, longitude: coords.longitude, source: 'gps' });
        },
        (error) => {
            pending = false;
            console.error('좌표를 받아올 수 없거나 권한이 없습니다.', error.message);
            // 이미 받은 좌표가 있으면 유지하고, 처음부터 실패했으면 기본 좌표로 진행한다.
            if (!current) publish(FALLBACK_POSITION);
        },
        GEO_OPTIONS
    );
};

/**
 * 현재 위치를 앱 전체가 공유한다.
 * 위치 요청은 구독자가 몇 개든 한 번만 나가고, 60초마다 갱신한다.
 * 권한 거부·시간 초과면 기본 좌표를 돌려줘 화면이 위치를 기다리며 멈추지 않게 한다.
 * @returns {{ latitude: number, longitude: number, source: 'gps' | 'fallback' } | null}
 */
const useCurrentPosition = () => {
    const [position, setPosition] = useState(current);

    useEffect(() => {
        listeners.add(setPosition);

        if (!timer) {
            requestPosition();
            timer = setInterval(requestPosition, REFRESH_MS);
        } else if (current) {
            setPosition(current);
        }

        return () => {
            listeners.delete(setPosition);
            if (listeners.size === 0) {
                clearInterval(timer);
                timer = null;
            }
        };
    }, []);

    return position;
};

export default useCurrentPosition;
