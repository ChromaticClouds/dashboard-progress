import { create } from 'zustand';
/**
 * 객체 검출 결과 저장 스토어
 */
const usePredictStore = create((set) => ({
    data: {
        sensorData: {},
        tomatoes: {},
        leaves: {}
    },
    /**
     * @param {Object} resultData - 수신한 데이터 입력
     */
    setData: (resultData) => {
        set((state) => ({
            data: {
                ...state.data,
                ...resultData
            }
        }));
    },
    gptResponse: null,
    /**
     * @param {*} response - GPT 응답 결과 전달
     */
    setGptResponse: (response) => {
        set({
            gptResponse: response
        });
    },
    loading: false,
    setLoading: (state) => set({ loading: state })
}));

export default usePredictStore;