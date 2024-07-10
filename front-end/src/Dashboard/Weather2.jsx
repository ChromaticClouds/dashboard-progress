import { React, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WindSub from "../../Chart/SubChart2";
import './Weather.css'

const Weather2 = ({ set_current, viewWeather }) => {
    const [weather, set_weather] = useState({});

    let today_temp = null;
    let today_sky = null;
    let today_pty = null;
    let today_sky_icon = null;
    let today_pty_icon = null;
    let today_max_temp = null;
    let today_min_temp = null;
    
    let tomorrow_sky = null;
    let tomorrow_pty = null;
    let tomorrow_sky_icon = null;
    let tomorrow_pty_icon = null;
    let tomorrow_max_temp = null;
    let tomorrow_min_temp = null;

    const [latitude, set_latitude] = useState(null);
    const [longitude, set_longitude] = useState(null);

    const [x, set_x] = useState(null);
    const [y, set_y] = useState(null);

    const [오늘날씨, 오늘날씨저장] = useState({
        month: '',
        day: '',
        sky: '',
        pty: '',
        icon: null,
        icon2: null,
        temp: 0,
        maxTemp: 0,
        minTemp: 0
    });

    const [내일날씨, 내일날씨저장] = useState({
        month: '',
        day: '',
        sky: '',
        pty: '',
        icon: null,
        icon2: null,
        maxTemp: 0,
        minTemp: 0
    });

    const get_location = () => {
        navigator.geolocation.getCurrentPosition(success, error);
    }

    useEffect(() => {
        if (latitude !== null && longitude !== null) {
            const rs = dfs_xy_conv("toXY", latitude, longitude);
            set_x(rs.x);
            set_y(rs.y);
        }
    }, [latitude, longitude]);
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            host_weather();
        }, 60000);
    
        return () => clearInterval(intervalId);
    }, [latitude, longitude, x, y]);

    useEffect(() => {
        if (latitude !== null && longitude !== null && x !== null && y !== null) {
            host_weather();
        }
    }, [latitude, longitude, x, y]);

    useEffect(() => {
        set_current(오늘날씨)
    }, [오늘날씨])
    
    useEffect(() => {
        get_location();
    }, []);
    
    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        set_latitude(latitude);
        set_longitude(longitude);
    }

    const error = (error) => {
        console.log(error);
    }

    var RE = 6371.00877; // 지구 반경(km)
    var GRID = 5.0; // 격자 간격(km)
    var SLAT1 = 30.0; // 투영 위도1(degree)
    var SLAT2 = 60.0; // 투영 위도2(degree)
    var OLON = 126.0; // 기준점 경도(degree)
    var OLAT = 38.0; // 기준점 위도(degree)
    var XO = 43; // 기준점 X좌표(GRID)
    var YO = 136; // 기1준점 Y좌표(GRID)
    //
    // LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
    //


    const dfs_xy_conv = (code, v1, v2) => {
        var DEGRAD = Math.PI / 180.0;
        var RADDEG = 180.0 / Math.PI;

        var re = RE / GRID;
        var slat1 = SLAT1 * DEGRAD;
        var slat2 = SLAT2 * DEGRAD;
        var olon = OLON * DEGRAD;
        var olat = OLAT * DEGRAD;

        var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
        var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
        ro = re * sf / Math.pow(ro, sn);
        var rs = {};
        if (code == "toXY") {
            rs['lat'] = v1;
            rs['lng'] = v2;
            var ra = Math.tan(Math.PI * 0.25 + (v1) * DEGRAD * 0.5);
            ra = re * sf / Math.pow(ra, sn);
            var theta = v2 * DEGRAD - olon;
            if (theta > Math.PI) theta -= 2.0 * Math.PI;
            if (theta < -Math.PI) theta += 2.0 * Math.PI;
            theta *= sn;
            rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
            rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
        }
        else {
            rs['x'] = v1;
            rs['y'] = v2;
            var xn = v1 - XO;
            var yn = ro - v2 + YO;
            ra = Math.sqrt(xn * xn + yn * yn);
            if (sn < 0.0) - ra;
            var alat = Math.pow((re * sf / ra), (1.0 / sn));
            alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

            if (Math.abs(xn) <= 0.0) {
                theta = 0.0;
            }
            else {
                if (Math.abs(yn) <= 0.0) {
                    theta = Math.PI * 0.5;
                    if (xn < 0.0) - theta;
                }
                else theta = Math.atan2(xn, yn);
            }
            var alon = theta / sn + olon;
            rs['lat'] = alat * RADDEG;
            rs['lng'] = alon * RADDEG;
        }
        return rs;
    }

    const host_weather = () => {
        let hours_array = new Array('02', '05', '08', '11', '14', '17', '20', '23');

        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        let hour = now.getHours();

        let base_year = year;
        let base_month = month;
        let base_day = day - 1;
        let base_time;

        let th_year = year;
        let th_month = month;
        let th_day = day;
        let th_hour = hour;

        let tm_year = year;
        let tm_month = month;
        let tm_day = day + 1;
        let this_date = new Date(th_year, th_month, 0).getDate();

        if (base_day == 0) {
            base_month -= 1;
            if (base_month == 0) {
                base_year -= 1;
                base_month = 12;
            }
            base_day = new Date(base_year, base_month, 0).getDate();
        }

        if (tm_day > this_date) {
            tm_day = 1;
            tm_month += 1;
            if (tm_month > 12) {
                tm_year += 1;
            }
        }

        for (let i = 0; i < hours_array.length; i++) {
            let h = hours_array[i] - hour
            if (h == 0 || h == -1 || h == -2) {
                base_time = hours_array[i];
            }
            if (hour == 0 || hour == 1) {
                base_time = hours_array[7];
                break;
            }
        }

        if (th_hour < 10) {
            th_hour = '0' + hour;
        }
        if (base_month < 10) {
            base_month = '0' + base_month;
        }
        if (th_month < 10) {
            th_month = '0' + th_month;
        }
        if (tm_month < 10) {
            tm_month = '0' + tm_month;
        }
        if (base_day < 10) {
            base_day = '0' + base_day;
        }
        if (th_day < 10) {
            th_day = '0' + th_day;
        }
        if (tm_day < 10) {
            tm_day = '0' + tm_day;
        }
        base_time += '00';
        th_hour += '00';

        let base_date = base_year + "" + base_month + "" + base_day;
        let today = th_year + "" + th_month + "" + th_day;
        let tomorrow = tm_year + "" + tm_month + "" + tm_day;

        const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
        const serviceKey = 'TdQd3Xt%2B4OHiUyXW4OunKFr6rCLsJlVInxrkdZfIhQ45NtLhK4pmxQyEZSBnqfv2PS1%2BSxVF6h7h3GWe%2BlQXeQ%3D%3D';
        const queryParams = new URLSearchParams({
            serviceKey: decodeURIComponent(serviceKey),
            pageNo: '1',
            numOfRows: '1000',
            dataType: 'JSON',
            base_date: base_date,
            base_time: base_time,
            nx: x,
            ny: y
        }).toString();

        fetch(`${url}?${queryParams}`)
        .then(response => response.json())
        .then(data => {
            const parse_response = data.response;
            const parse_body = parse_response.body;
            const parse_items = parse_body.items;
            const parse_item = parse_items.item;

            viewWeather(parse_item);

            parse_item.forEach(item => {
                const category = item.category;
                const fc_date = item.fcstDate;
                const fc_time = item.fcstTime;
                const value = parseInt(item.fcstValue, 10);

                if (category === "TMP" && fc_date === today && fc_time === th_hour) {
                    today_temp = value;
                }

                if (category === "SKY" && fc_date === today && fc_time === th_hour) {
                    switch (value) {
                        case 1:
                            today_sky = "맑음";
                            today_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/clear-day.svg";
                            break;
                        case 2:
                            today_sky = "구름 조금";
                            today_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/partly-cloudy-day.svg";
                            break;
                        case 3:
                            today_sky = "구름 많음";
                            today_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/cloudy.svg";
                            break;
                        case 4:
                            today_sky = "흐림";
                            today_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/overcast.svg";
                            break;
                    }
                }

                if (category === "PTY" && fc_date === today && fc_time === th_hour) {
                    switch (value) {
                        case 1:
                            today_pty = "비";
                            today_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/drizzle.svg";
                            break;
                        case 2:
                            today_pty = "비/눈";
                            today_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/sleet.svg";
                            break;
                        case 3:
                            today_pty = "눈";
                            today_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/snow.svg";
                            break;
                        case 4:
                            today_pty = "소나기";
                            today_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/rain.svg";
                            break;
                    }
                }

                if (category === "TMX" && fc_date === today) {
                    today_max_temp = value;
                }

                if (category === "TMN" && fc_date === today) {
                    today_min_temp = value;
                }

                if (category === "SKY" && fc_date === tomorrow && fc_time === th_hour) {
                    switch (value) {
                        case 1:
                            tomorrow_sky = "맑음";
                            tomorrow_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/clear-day.svg";
                            break;
                        case 2:
                            tomorrow_sky = "구름 조금";
                            tomorrow_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/partly-cloudy-day.svg";
                            break;
                        case 3:
                            tomorrow_sky = "구름 많음";
                            tomorrow_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/cloudy.svg";
                            break;
                        case 4:
                            tomorrow_sky = "흐림";
                            tomorrow_sky_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/overcast.svg";
                            break;
                    }
                }

                if (category === "PTY" && fc_date === tomorrow && fc_time === th_hour) {
                    switch (value) {
                        case 1:
                            tomorrow_pty = "비";
                            tomorrow_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/drizzle.svg";
                            break;
                        case 2:
                            tomorrow_pty = "비/눈";
                            tomorrow_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/sleet.svg";
                            break;
                        case 3:
                            tomorrow_pty = "눈";
                            tomorrow_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/snow.svg";
                            break;
                        case 4:
                            tomorrow_pty = "소나기";
                            tomorrow_pty_icon = "https://bmcdn.nl/assets/weather-icons/v2.0/fill/rain.svg";
                            break;
                    }
                }

                if (category === "TMX" && fc_date === tomorrow) {
                    tomorrow_max_temp = value;
                }

                if (category === "TMN" && fc_date === tomorrow) {
                    tomorrow_min_temp = value;
                }

                오늘날씨저장({
                    month: th_month,
                    day: th_day,
                    sky: today_sky,
                    pty: today_pty,
                    icon: today_sky_icon,
                    icon2: today_pty_icon,
                    temp: today_temp,
                    maxTemp: today_max_temp,
                    minTemp: today_min_temp
                });

                내일날씨저장({
                    month: tm_month,
                    day: tm_day,
                    sky: tomorrow_sky,
                    pty: tomorrow_pty,
                    icon: tomorrow_sky_icon,
                    icon2: tomorrow_pty_icon,
                    maxTemp: tomorrow_max_temp,
                    minTemp: tomorrow_min_temp
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
    }

    return (
        <div className = 'weather-container'>
            <>
                <WindSub set_weather = { set_weather }/>
            </>
            <h4 className = "today-weather">Short-term forecast</h4>
            <div className = "today-info">
                <img src = { 오늘날씨.pty == null ? 오늘날씨.icon : 오늘날씨.icon2 } className = 'weather-icon'/>
                <div className = 'weather-info'>
                    { 오늘날씨.month }월 { 오늘날씨.day }일<br />
                    { 오늘날씨.pty == null ? 오늘날씨.sky : 오늘날씨.pty }
                </div>
                <div className = "temp-info">{ 오늘날씨.maxTemp }° / { 오늘날씨.minTemp }°</div>
            </div>

            <div className = "tomorrow-info">
                <img src = { 내일날씨.pty == null ? 내일날씨.icon : 내일날씨.icon2 } className = 'weather-icon'/>
                <div className = 'weather-info'>
                    { 내일날씨.month }월 { 내일날씨.day }일<br />
                    { 내일날씨.pty == null ? 내일날씨.sky : 내일날씨.pty }
                </div>
                <div className = "temp-info2">{ 내일날씨.maxTemp }° / { 내일날씨.minTemp }°</div>
            </div>

            <div className = 'line'></div>

            <div className = 'status-container'>
                <div className = 'status-box'>
                    <div className = 'box-icon'>
                        <FontAwesomeIcon icon="fa-solid fa-wind" />
                    </div>
                    <span>{ weather.main ? weather.main.pressure + " mb": 0 + " mb"}</span>
                    <p>pressure</p>
                </div>
                <div className = 'status-box'>
                    <div className = 'box-icon visibility'>
                        <FontAwesomeIcon icon="fa-solid fa-eye" />
                    </div>
                    <span>{ weather.visibility ? (weather.visibility / 1000).toFixed(0) + " km" : 0 + " km"}</span>
                    <p>visibility</p>
                </div>
                <div className = 'status-box'>
                    <div className = 'box-icon humidity'>
                        <FontAwesomeIcon icon="fa-solid fa-droplet" />
                    </div>
                    <span>{ weather.main ? weather.main.humidity + "%" : 0 + "%" }</span>
                    <p>humidity</p>
                </div>
            </div>
        </div>
    )
}

export default Weather2