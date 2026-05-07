import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
  
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend);

const DiseasesChart = ({ diseasesList }) => {
    const [list, setList] = useState({});
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setList(diseasesList);
    }, [diseasesList]);

    useEffect(() => {
        setHasValue(Object.keys(list).length > 0);
    }, [list]);

    const conditions = [
        'early_blight', 'healthy', 'late_blight', 'leaf_miner', 'leaf_mold',
        'mosaic_virus', 'septoria', 'spider_mites', 'yellow_leaf_curl_virus'
    ];

    const values = conditions.map(condition => hasValue ? list[condition] : 0);

    const data = {
        labels: ['EarlyBlight', 'Healthy', 'LateBlight', 'LeafMiner', 'LeafMold', 'MosaicVirus', 'Septoria', 'SpiderMites', 'YellowLeafCurlVirus'],
        datasets: [
            {
                maxBarThickness: 40,
                borderSkipped: false,
                borderRadius: 8,
                backgroundColor: ['#1f18ed', '#2fd1ed', '#dfdff0', '#b7b7c9', '#1d1f59', '#d672cf', '#ff5c4a', '#dae841', '#3bed4a'],
                data: values
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: true,
                anchor: "end",
                clamp: true,
                align: "top",
                font: {
                    size: 16,
                    family: "GSR",
                    weight: 600
                },
            },
            title: {
                display: true,
                text: `Leaf Diseases`,
                font: {
                    family: "GSR",
                    size: 20,
                    weight: 600,
                },
                align: 'start',
                padding: {
                    bottom: 60,
                }
            },
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `Count: ${ context.parsed.y }`;
                    },
                },
                titleFont: {
                    family: "GSR",
                    size: 14,
                },
                bodyFont: {
                    family: "GSR",
                    size: 12,
                },
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    padding: 10,
                },
                weight: 1,
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
            y: {
                display: false,
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            }
        }
    };

    return (
        <Bar
            data = { data } 
            options = { options }
            plugins = { [ChartDataLabels] }
        />
    )
}

export default DiseasesChart;