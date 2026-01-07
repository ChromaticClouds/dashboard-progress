import React from "react";
import "./weather.css";
import { MainInfo } from "./main-info";
import { FiveDaysForecast } from "./five-days-forecast";
import { AirPollutionState } from "./air-pollution-state";
import { SunState } from "./sun-state";
import { ShortState } from "./short-state";
import { TodayAtState } from "./today-at-state";

export const WeatherIO = (): JSX.Element => {
  return (
    <div className="board weatherio-container">
      <div className="contents">
        <h4 className="subtitle">Weather Cast</h4>
        <section className="binding-container">
          <section className="status-container">
            <MainInfo />
            <h3 className="title">5 Days Forecast</h3>
            <FiveDaysForecast />
          </section>
          {/**
           *  <---------- # 섹션 분리 # ---------->
           */}
          <section className="weather-container">
            <div className="highlight-box">
              <h3>Today Highlights</h3>
              <div className="box-container">
                <div className="box-box">
                  <div className="section">
                    <AirPollutionState />
                  </div>
                  <div className="section">
                    <ShortState showType="humidity" />
                    <ShortState showType="pressure" />
                  </div>
                </div>
                <div className="box-box">
                  <div className="section">
                    <SunState />
                  </div>
                  <div className="section">
                    <ShortState showType="visibility" />
                    <ShortState showType="feels_like" />
                  </div>
                </div>
              </div>
            </div>
            {/*
              - # 3시간 단위로 날씨 조회
            */}
            <h3 className="title">Today at</h3>
            <TodayAtState />
          </section>
        </section>
      </div>
    </div>
  );
};
