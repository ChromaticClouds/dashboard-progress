import React from "react";
import "./AILoading.css";
import usePredictStore from "../../Video/Prediction/hooks/store/usePredictStore";

const AILoading = () => {
    const { loading } = usePredictStore();

    return (
        <div>
            {loading ? (
                <div className="loading-background">
                    <div className="loading-container">
                        <div className="📦"></div>
                        <div className="📦"></div>
                        <div className="📦"></div>
                        <div className="📦"></div>
                        <div className="📦"></div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default AILoading;