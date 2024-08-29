import React from "react";
import { clearAuthState } from "../hooks/autoHelpers";
import useAccessVerify from "../hooks/useAccessVerify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import "./Logout.css";

const Logout = () => {
    const { logout } = useAccessVerify();

    const logoutAccess = () => {
        logout();
    }

    return (
        <FontAwesomeIcon 
            icon={faRightFromBracket}
            className="icon red last"
            onClick={logoutAccess}                                            
        />
    )
}

export default Logout;