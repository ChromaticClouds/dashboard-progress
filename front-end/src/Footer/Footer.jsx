import React from "react";
import "./Footer.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Footer = () => {
    return (
        <div>
            <div className="logo">
                <h4 className="text">
                    DCT
                    <div className="icon">
                        <FontAwesomeIcon icon="fa-solid fa-diamond" />
                     </div>
                </h4>
            </div>
        </div>
    )
}

export default Footer;