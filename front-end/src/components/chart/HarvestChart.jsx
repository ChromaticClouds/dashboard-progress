import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
  
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HarvestChart = ({ hostChartData }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Production Yield',
                data: [],
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            },
        ],
    });

    useEffect(() => {
        if (hostChartData && hostChartData.labels && hostChartData.datasets) {
            setChartData(hostChartData);
        }
    }, [hostChartData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `Available to Harvest`,
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
                        return `Available to Harvest: ${ (context.parsed.y).toFixed(0) }%`;
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
            filler: {
                propagate: true // filler 플러그인 활성화하여 배경 채우기
            }
        },
        scales: {
            x: {
                ticks: {
                    display: true,
                    font: {
                        family: "GSR",
                        size: 12
                    }
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
                ticks: {
                    callback: function(val, index) {
                        // Hide every 2nd tick label
                        return index % 2 === 0 ? this.getLabelForValue(val) : '';
                    },
                    display: false
                },
                beginAtZero: true,
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
                max: 100
            }
        }
    };

    return (
        <Line
            data={chartData}
            options={options}
            plugins={[ Filler ]}
        />
    );
};

export default HarvestChart;
