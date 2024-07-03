import React, { useEffect, useState } from 'react';

const Weather = () => {
    const [temperature, set_temperature] = useState(null);
    const [humidity, set_humidity] = useState(null);
    const [weather, set_weather] = useState(null);
    const [icon, set_icon] = useState(null);

    const [min_temp, set_min_temp] = useState(null);
    const [max_temp, set_max_temp] = useState(null);

    const [tomorrow_weather, set_tomorrow_weather] = useState(null);

    const get_location = () => {
        navigator.geolocation.getCurrentPosition(success, error);
    }

    useEffect (() => {
        get_location()

        const intervalId = setInterval(() => { get_location() }, 60000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const success = (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        getWeather1(latitude, longitude)
        getWeather2(latitude, longitude)
    }

    const error = () => {
        console.error("좌표를 받아올 수 없거나 권한이 없습니다.");
    }

    const api_key = '53c642d1e6caac8a761f075ad9f8951b'
    const getWeather1 = (latitude, longitude) => {
        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric&lang=kr`
        ).then((response) => {
            return response.json()
        }).then((json) => {
            const temperature = json.main.temp
            const humidity = json.main.humidity
            const weather = json.weather[0].description

            const icon = json.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`

            set_temperature(parseInt(temperature))
            set_humidity(humidity)
            set_weather(weather)
            set_icon(iconURL)
        }).catch((error) => {
            alert(error)
        })
    }

    const getWeather2 = (latitude, longitude) => {
        fetch(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric&lang=kr`
        )
        .then((response) => response.json())
        .then((json) => {
            const date_list = json.list
            const today = new Date()
            const current_day = today.getDate()
            
            let min_temperature = Infinity
            let max_temperature = 0
    
            date_list.forEach((item) => {
                const date_element = new Date(item.dt_txt)
                const day = date_element.getDate()
    
                if (next_day === day) {
                    const next_weather = item.weather[0].description

                    const min_temperature_list = item.main.temp_min
                    min_temperature = Math.min(min_temperature, min_temperature_list)

                    const max_temperature_list = item.main.temp_max
                    max_temperature = Math.max(max_temperature, max_temperature_list)

                    set_tomorrow_weather(next_weather)
                    set_min_temp(parseInt(min_temperature))
                    set_max_temp(parseInt(max_temperature))
                }
            });
    
        })
        .catch((error) => {
            console.error(alert(error))
        })
    }

    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()

    const next_day = today.getDate() + 1

    return (
        <div>
            <p className = "today-weather">단기 예보</p>
            <div className = "today-info">
                <img src = { icon } className = 'weather-icon'/>
                <div className = 'weather-info'>
                    {month}월 {day}일<br />
                    {weather}
                </div>
                <div className = "temp-info">{temperature}°</div>
            </div>

            <div className = "tomorrow-info">
                <img src = { icon } className = 'weather-icon'/>
                <div className = 'weather-info'>
                    {month}월 {next_day}일<br />
                    {tomorrow_weather}
                </div>
                <div className = "temp-info2">{max_temp}° / {min_temp}°</div>
            </div>
        </div>
    )
}

export default Weather;
