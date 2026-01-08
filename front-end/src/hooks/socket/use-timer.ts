import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/providers/socket-provider';

type UseFetcherOptions<T, R extends Record<string, unknown>> = {
  eventNames: (keyof R)[];
  interval?: number;
  data?: T;
};

export const useSocketFetcher = <T, R extends Record<string, unknown>>({
  eventNames,
  interval = 2000,
  data,
}: UseFetcherOptions<T, R>) => {
  const socket = useSocket();

  const [responses, setResponses] = useState<Partial<R>>({});
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // socket 이벤트 구독
  useEffect(() => {
    if (!socket) return;

    const handlers: Partial<Record<keyof R, (res: unknown) => void>> = {};

    eventNames.forEach((event) => {
      const handler = (result: unknown) => {
        setResponses((prev) => ({
          ...prev,
          [event]: result,
        }));
      };

      handlers[event] = handler;
      socket.on(event as string, handler);
    });

    return () => {
      eventNames.forEach((event) => {
        const handler = handlers[event];
        if (handler) {
          socket.off(event as string, handler);
        }
      });
    };
  }, [socket, eventNames]);

  // emit 타이머
  useEffect(() => {
    if (!socket) return;

    const emit = () => {
      eventNames.forEach((event) =>
        socket.emit(event as string, dataRef.current)
      );
    };

    emit();
    const timer = setInterval(emit, interval);

    return () => clearInterval(timer);
  }, [socket, eventNames, interval]);

  return responses as R;
};
