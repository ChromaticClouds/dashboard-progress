import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import "./Logout.css";

export const Logout = () => {
  return (
    <button className="icon red last">
      <FontAwesomeIcon icon={faRightFromBracket} />
    </button>
  );
};
