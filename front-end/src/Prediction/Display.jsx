import { useEffect, useState } from 'react';
import Classification from './Classification';
import "./Display.css"

const Display = () => {
    const [predictions, setPredictions] = useState({});
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setHasValue(Object.keys(predictions).length > 0);
    }, [predictions])
    
    return (
        <div>
            <Classification predictions={setPredictions}/>
            <div className='prediction-list'>
                <div>
                    <h4>Early Blight</h4>
                    <div>{hasValue ? predictions.early_blight : 0}</div>
                </div>
                <div>
                    <h4>Healthy</h4>
                    <div>{hasValue ? predictions.healthy : 0}</div>
                </div>
                <div>
                    <h4>Late Blight</h4>
                    <div>{hasValue ? predictions.late_blight : 0}</div>
                </div>
                <div>
                    <h4>Leaf Miner</h4>
                    <div>{hasValue ? predictions.leaf_miner : 0}</div>
                </div>
                <div>
                    <h4>Leaf Mold</h4>
                    <div>{hasValue ? predictions.leaf_mold : 0}</div>
                </div>
                <div>
                    <h4>Mosaic Virus</h4>
                    <div>{hasValue ? predictions.mosaic_virus : 0}</div>
                </div>
                <div>
                    <h4>Septoria</h4>
                    <div>{hasValue ? predictions.septoria : 0}</div>
                </div>
                <div>
                    <h4>Spider Mites</h4>
                    <div>{hasValue ? predictions.spider_mites : 0}</div>
                </div>
                <div>
                    <h4>Yellow Leaf Curl Virus</h4>
                    <div>{hasValue ? predictions.yellow_leaf_curl_virus : 0}</div>
                </div>
            </div>
        </div>
    )
}

export default Display;