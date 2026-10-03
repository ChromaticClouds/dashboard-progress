/**
 * 숫자 환경 변수를 읽는다.
 * .env.example을 그대로 복사하면 값이 빈 문자열로 들어오고 Number('')는 0이 되므로,
 * 비어 있거나 양수가 아니면 기본값을 쓴다.
 */
const positiveNumberEnv = (name, fallback) => {
    const value = Number(process.env[name]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

module.exports = { positiveNumberEnv };
