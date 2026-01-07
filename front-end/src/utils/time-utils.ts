import { isAfter, parse } from "date-fns";
import { forecastHour } from "../data/clock";

export const getCurrentHourIndex = () => {
  const now = new Date();
  const index = forecastHour.findIndex((hour) =>
    isAfter(parse(hour, "HH:mm:ss", new Date()), now)
  );
  return index === -1 ? forecastHour.length - 1 : index;
};