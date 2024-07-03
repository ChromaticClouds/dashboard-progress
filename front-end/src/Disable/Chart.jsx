import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { 
  Chart, 
  registerables, 
  BarController, 
  CategoryScale, 
  LinearScale, 
  Tooltip, 
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './Chart.css';

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
  ...registerables
)

const socket = io.connect("http://localhost:5000");

const ChartComponent = () => {
  const [plant_data, set_plant_data] = useState([]);
  const [growth_data, set_growth_data] = useState([]);
  const [environment_data, set_environment_data] = useState([]);
  const [record_data, set_record_data] = useState([]);
  const [supply_amount, set_supply_amount] = useState([]);
  const [supply_count, set_supply_count] = useState([]); 

  useEffect(() => {
    fetchData();

    // 데이터 업데이트를 위한 소켓 이벤트 등록
    socket.on('dataUpdate', (data) => {
      set_plant_data(data.plant);
      set_growth_data(data.growth);
      set_environment_data(data.environment);
      set_record_data(data.record);
    });

    // 컴포넌트가 언마운트될 때 소켓 이벤트 해제
    return () => {
      socket.off('dataUpdate');
    };
  }, []);

  const fetchData = () => {
    fetch('http://localhost:5000/data')
    .then(res => res.json())
    .then(data => {
      set_plant_data(data.plant); // 첫 번째 데이터를 저장
      set_growth_data(data.growth); // 두 번째 데이터를 저장
      set_environment_data(data.environment);
    })
    .catch(err => console.log(err));

    fetch('http://localhost:5000/daily-water-supply')
    .then(res => res.json())
    .then(data => {
      set_supply_amount(data.daily_water_supply_amount);
      set_supply_count(data.daily_water_supply_count);
    })
    .catch(err => console.log(err));
  }

  useEffect(() => {
    // 초기 데이터 로딩
    fetchData();
  }, []);

  const plantName = plant_data.map(item => item.plant_name);
  const growthAmount = growth_data.map(item => item.growth_amount);
  const timeStamp = environment_data.map(item => item.timestamp);
  const innerHumid = environment_data.map(item => item.inner_humid);
  const innerTemp = environment_data.map(item => item.inner_temp);
  const supplyAmount = supply_amount.map(item => item.daily_water_supply_amount);
  const supplyCount = supply_amount.map(item => item.daily_water_supply_count);
  const soilHumid = growth_data.map(item => item.soil_humid);

  const data1 = {
    responsive: false,
    labels: plantName,
    datasets: [
      {
        label: '생장량',
        data: growthAmount,
        barPercentage: 0.25,
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 1)'); // 시작 색상 및 투명도
          gradient.addColorStop(0.9, 'rgba(50, 55, 90, 0.7)'); // 중간 색상 및 투명도
          gradient.addColorStop(1, 'rgba(50, 55, 90, 0.7)');   // 끝 색상 및 투명도
          return gradient;
        }
      }
    ] 
  }

  const options1 = {
    scales: {
      x: {
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          }
        },
      },
      y: {
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          }
        }
      }
    },
    borderRadius: 50,
    ticks: {
      stepSize: 5,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: 'lightgray',
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '작물별 생장량',
        color: 'white',
        font: {
          weight: '300',
          size: 14,
        }
      },
    },
  }

  const data2 = {
    labels: timeStamp,
    datasets: [
      {
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
        type: 'line', // 선 그래프 유형
        yAxisID: 'y-axis-1',
        data: innerTemp,
        borderColor: '#006b9e',
        backgroundColor: '#006b9e',
        label: '온도'
      },
      { 
        animation: {
          duration: 1000,
        },
        type: 'bar',
        barPercentage: 0.5,
        yAxisID: 'y-axis-2',
        data: innerHumid,
        backgroundColor: 'white',
        label: '습도'
      },
    ],
  }

  const option2 = {
    scales: {
      'y-axis-1': { // 주축 설정
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          },
          stepSize: 5,
        },
        position: 'left',
        title: {
          display: true,
          text: '온도',
          color: 'white',
          font: {
            weight: '300',
            size: 14,
          }
        },
        min: 0,
      },
      'y-axis-2': { // 보조축 설정
        position: 'right',
        title: {
          display: true,
          text: '습도',
          color: 'white',
          font: {
            weight: '300',
            size: 14,
          }
        },
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          },
          stepSize: 10,
        },
        min: 10,
      },
      x: {
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 25,
          boxHeight: 15,
          color: 'lightgray',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '시간당 온도와 습도',
        color: 'white',
        font: {
          weight: '300',
          size: 14,
        }
      },
    },
  }

  const data3 = {
    labels: supply_amount.map(item => item.day),
    datasets: [
      {
        type: 'line',
        label: '물공급회수',
        data: supply_count.map(item => item.daily_water_supply_count),
        borderColor: 'white',
        backgroundColor: 'white',
        yAxisID: 'y-axis-3',
      },
      {
        type: 'bar',
        barPercentage: 0.5,
        label: '물공급량',
        data: supply_amount.map(item => item.daily_water_supply_amount),
        backgroundColor: (context) => {
          const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(35, 180, 200, 1)'); // 시작 색상 및 투명도
          gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)'); // 중간 색상 및 투명도
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');   // 끝 색상 및 투명도
          return gradient;
        },
        yAxisID: 'y-axis-4',
      },
    ],
  };

  const option3 = {
    scales: {
      x: {
        ticks: {
          display: false,
        },
      },
      'y-axis-3': {
        min: 0,
        max: 10,
        position: 'left',
        title: {
          display: true,
          text: '물공급회수',
          color: 'white',
          font: {
            weight: '300',
            size: 14,
          }
        },
        ticks: {
          stepSize: 2,
          color: 'lightgray',
          font: {
            size: 12,
          }
        },
      },
      'y-axis-4': {
        min: 0,
        position: 'right',
        title: {
          display: true,
          text: '물공급량',
          color: 'white',
          font: {
            weight: '300',
            size: 14,
          }
        },
        ticks: {
          stepSize: 20,
          color: 'lightgray',
          font: {
            size: 12,
          }
        },
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 25,
          boxHeight: 15,
          color: 'lightgray',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '일일 물공급량과 물공급회수',
        color: 'white',
        font: {
          weight: '300',
          size: 14,
        }
      },
    },
  };
  
  const data4 = {
    responsive: false,
    labels: plantName,
    datasets: [
      {
        label: '',
        data: soilHumid,
        barPercentage: 0.25,
        backgroundColor: 'lightgreen'
      }
    ],
  };

  const option4 = {
    scales: {
      x: {
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          }
        },
      },
      y: {
        ticks: {
          color: 'lightgray',
          font: {
            size: 12,
          }
        }
      }
    },
    borderRadius: 50,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: 'lightgray',
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '작물별 토양습도',
        color: 'white',
        font: {
          weight: '300',
          size: 14,
        }
      },
    },
  }

  const data5 = {
    responsive: false,
    labels: plantName,
    datasets: [
      {
        label: '생장량',
        data: growthAmount,
        barPercentage: 0.25,
        backgroundColor: [
          'cornflowerblue',
          'steelblue',
          'darkslateblue'
        ],
        borderColor: 'rgba(0, 0, 0, 0)'
      }
    ] 
  }

  const option5 = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const sum = context.dataset.data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / sum) * 100).toFixed(1) + '%';
          return percentage;
        },
        anchor: 'center',
        align: 'center',
        color: 'white',
        font: {
          size: 20,
          weight: 400,
        },
      },
      legend: {
        onClick() {},
        display: true,
        labels: {
          padding: 30,
          boxHeight: 20,
          boxWidth: 30,
          color: 'lightgray',
          font: {
            size: 14,
          },
        },
        position: 'bottom',
      },
      title: {
        display: true,
        text: '작물별 생장비율',
        color: 'white',
        font: {
          size: 20,
          weight: 'bold',
        },
      },
    }
  }

  return (
    <div>
      <div className='flex-container1'>
        <div className='flex-container2'>
          <div className = 'flex-box1'>
            <div className='chart-container ch1'>
              <div className='chart-box1 ch'>
                <Bar
                  className='chart1'
                  data={data1}
                  options={options1}
                />
              </div>
            </div>
            <div className='chart-container ch2'>
              <div className='chart-box2 ch'>
                <Line
                  className='chart2'
                  data={data2}
                  options={option2}
                />
              </div>
            </div>
          </div>
          <div className='flex-box2'>
            <div className='chart-container ch4'>
              <div className='chart-box2 ch'>
                <Line
                  className='chart2'
                  data={data3}
                  options={option3}
                />
              </div>
            </div>
            <div className='chart-container ch5'>
              <div className='chart-box1 ch'>
                <Bar
                  className='chart1'
                  data={data4}
                  options={option4}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex-box3'>
          <div className='chart-container ch3'>
            <div className='chart-box3 ch'>
              <Doughnut
                className='chart3'
                data={data5}
                options={option5}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='flex-container3'>
        <div className='flex-box4'>
          <div className='chart-container'>
            <div className='chart-box4 ch'>
              <img src="http://192.168.43.27:8000/stream.mjpg"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;