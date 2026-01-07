import { addDays } from 'date-fns';
import { useState, useEffect } from 'react';

type TickUnit = 'second' | 'minute' | 'hour' | 'date';

type TickUtility = {
  [key in TickUnit]: [(current: Date) => number, number];
};

const tickUtility: TickUtility = {
  second: [
    (current) => 1000 - current.getMilliseconds(),
    1000,
  ],
  minute: [
    (current) => (60 - current.getSeconds()) * 1000 - current.getMilliseconds(),
    60 * 1000,
  ],
  hour: [
    (current) => ((60 - current.getMinutes()) * 60 - current.getSeconds()) * 1000 - current.getMilliseconds(),
    60 * 60 * 1000,
  ],
  date: [
    (current) => addDays(current, 1).setHours(0, 0, 0, 0) - current.getTime(),
    24 * 60 * 60 * 1000,
  ],
};

export const useTick = (unit: TickUnit) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const getDelay = () => {
      const current = new Date();
      const [calcDelay] = tickUtility[unit];
      return calcDelay(current);
    };

    const timeout = setTimeout(() => {
      setNow(new Date());

      const [, intervalMs] = tickUtility[unit];
      const interval = setInterval(() => {
        setNow(new Date());
      }, intervalMs);

      return () => clearInterval(interval);
    }, getDelay());

    return () => clearTimeout(timeout);
  }, [unit]);

  return now;
};
