import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBell, faChartSimple, faCloud, faHome, faMagnifyingGlass, faToggleOn, faVideo } from "@fortawesome/free-solid-svg-icons";

export interface IconsProps {
  icon: IconProp;
  text: string
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export const icons: IconsProps[] = [
  {
    icon: faHome,
    text: "Home",
  },
  {
    icon: faCloud,
    text: "Weather",
  },
  {
    icon: faChartSimple,
    text: "Chart",
  },
  {
    icon: faToggleOn,
    text: "Control",
  },
  {
    icon: faVideo,
    text: "Video",
  },
];