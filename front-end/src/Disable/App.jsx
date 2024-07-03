import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import io from 'socket.io-client'

const socket = io.connect("http://localhost:5000");

const App = () => {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const [data5, setData5] = useState([]);
  const [data6, setData6] = useState([]);

  useEffect(() => {
    fetchData();

    // 데이터 업데이트를 위한 소켓 이벤트 등록
    socket.on('dataUpdate', (data) => {
      setData1(data.plant);
      setData2(data.growth);
      setData3(data.environment);
      setData4(data.record);
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
      setData1(data.plant); // 첫 번째 데이터를 저장
      setData2(data.growth); // 두 번째 데이터를 저장
      setData3(data.environment);
      setData4(data.record);
    })
    .catch(err => console.log(err));

    fetch('http://localhost:5000/daily-water-supply')
    .then(res => res.json())
    .then(data => {
      setData5(data.daily_water_supply_amount);
      setData6(data.daily_water_supply_count);
    })
    .catch(err => console.log(err));
  }

  return (
    <div>
      <div className='table-container'>
        <div className='table-box'>
          <table className='table-binder'>
            <thead>
              <tr>
                <th className='border'>plant_id</th>
                <th className='border'>plant_name</th>
                <th className='border'>timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data1.map((d, i) => (
                <tr key={i}>
                  <td className='border'>{d.plant_id}</td>
                  <td className='border'>{d.plant_name}</td>
                  <td className='border'>{d.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className='table-binder'>
            <thead>
              <tr>
                <th className='border'>growth_id</th>
                <th className='border'>plant_id</th>
                <th className='border'>growth_amount</th>
                <th className='border'>timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data2.map((d, i) => (
                <tr key={i}>
                  <td className='border'>{d.growth_id}</td>
                  <td className='border'>{d.plant_id}</td>
                  <td className='border'>{d.growth_amount}</td>
                  <td className='border'>{d.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className='table-binder'>
            <thead>
              <tr>
                <th className='border'>environment_id</th>
                <th className='border'>inner_temp</th>
                <th className='border'>inner_humid</th>
                <th className='border'>water_supply</th>
                <th className='border'>timestamp</th>
                <th className='border'>date</th>
              </tr>
            </thead>
            <tbody>
              {data3.map((d, i) => (
                <tr key={i}>
                  <td className='border'>{d.environment_id}</td>
                  <td className='border'>{d.inner_temp}</td>
                  <td className='border'>{d.inner_humid}</td>
                  <td className='border'>{d.water_supply}</td>
                  <td className='border'>{d.timestamp}</td>
                  <td className='border'>{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className='table-binder'>
            <thead>
              <tr>
                <th className='border'>record_id</th>
                <th className='border'>plant_id</th>
                <th className='border'>growth_amount</th>
                <th className='border'>soil_humid</th>
                <th className='border'>led_measures</th>
                <th className='border'>timestamp</th>
                <th className='border'>date</th>
              </tr>
            </thead>
            <tbody>
              {data4.map((d, i) => (
                <tr key={i}>
                  <td className='border'>{d.record_id}</td>
                  <td className='border'>{d.plant_id}</td>
                  <td className='border'>{d.growth_amount}</td>
                  <td className='border'>{d.soil_humid}</td>
                  <td className='border'>{d.led_measures}</td>
                  <td className='border'>{d.timestamp}</td>
                  <td className='border'>{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className='table-binder'>
            <thead>
              <tr>
                <th className='border'>day</th>
                <th className='border'>daily_water_supply_amount</th>
              </tr>
            </thead>
            <tbody>
              {data5.map((d, i) => (
                <tr key={i}>
                  <td className='border'>{d.day}</td>
                  <td className='border'>{d.daily_water_supply_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
