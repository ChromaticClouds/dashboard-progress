import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from 'react-chartjs-2';
import useSocket from "../src/hooks/socket/useSocket";

import {
    Chart as ChartJS,
    ArcElement,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
  
ChartJS.register(ArcElement, LinearScale, Title, Tooltip, Legend);

const GrowthDoughnut = () => {
    const [growth, set_growth] = useState([]);

    const { socket, receivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'growth chart rec'
    )

    useEffect(() => {
        if (socket) {
            const timer = setInterval(() => {
                socket.emit('growth chart req');
            }, 2000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (receivedData) {
            set_growth(receivedData[0]);
        }
    }, [receivedData]);

    const data = {
        labels: ['tomato1', 'tomato2', 'tomato3'],
        datasets: [
            {
                data: growth.map(data => data.growth_amount),
                backgroundColor: ['#595b87', '#7791bf', '#a3c4e6'],
                borderRadius: 15,
                circumference: 360,
                rotation: 30,
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
            title: {
                display: true,
                text: `Growth Ratio`,
                font: {
                    family: "GSR",
                    size: 20,
                    weight: 600,
                },
                align: 'start',
                padding: {
                    bottom: 30,
                }
            },
            legend: {
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: {
                        family: "GSR",
                        size: 18,
                        weight: 500,
                    }
                },
            },
            tooltip: {
                padding: 10,
                callbacks: {
                    label: function(context) {
                        let sum = 0;

                        context.dataset.data.forEach((e) => {
                            sum += e;
                        });

                        return `Growth Ratio: ${ (context.parsed / sum * 100).toFixed(0) }%`;
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
            },
            datalabels: {
                display: true,
                formatter: function(context, value) {
                    let sum = 0;

                    value.dataset.data.forEach((e) => {
                        sum += e;
                    })

                    return `${ (context / sum * 100).toFixed(0) }%`
                },
                font: {
                    family: "GSR",
                    size: 20,
                },
                color: '#fff'
            }
        }
    }

    return (
        <Doughnut 
            data = { data }
            options = { options }
            plugins = { [ChartDataLabels] }
        />
    )
}

export default GrowthDoughnut;
