import { useEffect, useState } from 'react';
import usePredictStore from './hooks/store/usePredictStore';
import "./Display.css";

const diseaseNames = [
    "early_blight",
    "healthy",
    "late_blight",
    "leaf_miner",
    "leaf_mold",
    "mosaic_virus",
    "septoria",
    "spider_mites",
    "yellow_leaf_curl_virus"
];

const Display = () => {
    const { 
        data: predictionData
    } = usePredictStore();

    const [predictions, setPredictions] = useState({});

    useEffect(() => {
        const leavesData = predictionData?.leaves;

        if (leavesData) {
            setPredictions(leavesData);
        }
    }, [predictionData?.leaves]);
    
    return (
        <div>
            <section className='prediction-list'>
                {diseaseNames.map((disease) => (
                    <div key={disease}>
                        <h4>
                            {disease
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, char => char.toUpperCase())
                            }
                        </h4>
                        <div>
                            { predictions[disease] || 0 }
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default Display;