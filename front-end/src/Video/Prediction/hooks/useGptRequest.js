import { useEffect, useState } from "react";
import useSocket from "../../../hooks/socket/useSocket";
import usePredictStore from "./store/usePredictStore";
import useClickStore from "../../../hooks/store/useClickStore";
import useNoticeEvents from "../../../hooks/notification/useNoticeEvents";

const useGptReqeust = () => {
    const { socket, receivedData, setReceivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'gpt answer'
    );
    const { setGptResponse, setLoading, gptResponse } = usePredictStore();
    const { setGptHosted } = useClickStore();
    const { postNotification } = useNoticeEvents();

    const [timeoutId, setTimeoutId] = useState(null);
    
    const onTimeout = () => {
        setLoading(false);
        setGptHosted(false);

        const failedReqeust = {
            type: 'gpt',
            message: 'Connection time out. Try later.'
        }

        postNotification(failedReqeust);
    };
    /**
     * 웹소켓을 통해 GPT 요청을 실행하는 함수
     * @param {Object} predictions - GPT 요청 데이터
     */
    const hostGpt = async (predictions) => {
        if (socket) {
            setGptResponse(null);
            setLoading(true);
            socket.emit('gpt question', predictions);

            const timer = setTimeout(() => {
                if (receivedData) {
                    onTimeout();
                }
            }, 60000);

            setTimeoutId(timer);
        }
    }

    useEffect(() => {
        if (receivedData) {
            setGptResponse(receivedData);
            setGptHosted(false);
            setLoading(false);

            setReceivedData(null);
        }
    }, [receivedData]);

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    useEffect(() => {
        if (gptResponse) {
            const alarmRequest = {
                type: 'gpt',
                message: gptResponse
            }

            postNotification(alarmRequest);
        }
    }, [gptResponse]);

    return hostGpt;
}

export default useGptReqeust;