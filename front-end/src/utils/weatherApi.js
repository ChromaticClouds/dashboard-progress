// 날씨 API 호출을 한 곳에 모은다. 키는 환경 변수에서만 읽는다.

const KMA_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const OWM_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * 공공데이터포털은 인코딩·디코딩된 키 두 가지를 준다.
 * axios가 params를 다시 인코딩하므로, 인코딩된 키가 들어오면 한 번 풀어서 넘긴다.
 */
const kmaServiceKey = () => {
    const raw = import.meta.env.VITE_KMA_SERVICE_KEY ?? '';
    return raw.includes('%') ? decodeURIComponent(raw) : raw;
};

// 이전 이름(VITE_FORECAST_KEY)도 읽어 기존 .env가 바로 깨지지 않게 한다.
export const openWeatherApiKey = () =>
    import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.VITE_FORECAST_KEY || '';

export const kmaVillageForecastRequest = ({ baseDate, baseTime, nx, ny }) => ({
    url: KMA_URL,
    params: {
        serviceKey: kmaServiceKey(),
        pageNo: '1',
        numOfRows: '1000',
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx,
        ny,
    },
});

// 같은 좌표의 현재 날씨는 짧은 시간 안에 한 번만 요청한다. 여러 컴포넌트가 같은 값을 쓴다.
const CURRENT_WEATHER_TTL_MS = 55000;
const currentWeatherCache = new Map();

export const fetchCurrentWeather = (latitude, longitude) => {
    const apiKey = openWeatherApiKey();
    if (!apiKey) return Promise.reject(new Error('VITE_OPENWEATHER_API_KEY가 없습니다.'));

    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const cached = currentWeatherCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CURRENT_WEATHER_TTL_MS) return cached.promise;

    const promise = fetch(
        `${OWM_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`
    ).then((response) => {
        if (!response.ok) throw new Error(`OpenWeatherMap ${response.status}`);
        return response.json();
    });

    currentWeatherCache.set(cacheKey, { at: Date.now(), promise });
    // 실패한 요청은 캐시에 남기지 않아 다음 갱신 때 다시 시도한다.
    promise.catch(() => currentWeatherCache.delete(cacheKey));
    return promise;
};

export const openWeatherUrl = (path, latitude, longitude) =>
    `${OWM_URL}/${path}?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey()}`;
