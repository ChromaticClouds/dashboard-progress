/**
 * Components
 */
import LineChart from "@/components/chart/line-chart";

export const Summary = (): JSX.Element => {
  return (
    <div className="summary-container">
      <div>
        <div className="summary-box">
          <div className="blue-circle one"></div>
          <div className="blue-circle another"></div>
          <h4 className="title">Plant growth activity</h4>
          <div className="chart">
            {/*
                                        - # 차트 데이터 스테이트를 props로 전달하여 라인 차트 호출
                                     */}
            <LineChart data={growthValue} />
          </div>
          <div className="sort">
            {growth.map((object, index) => (
              <div className="growth-box" key={index}>
                <div className="status phase">
                  <div
                    className={`
                                                        phase
                                                        ${
                                                          object.avg_growth <= 5
                                                            ? "seed-phase"
                                                            : object.avg_growth <=
                                                              15
                                                            ? "vegetation"
                                                            : "final-growth"
                                                        }`}
                  >
                    <div className="growth-img-box">
                      <img
                        src={
                          object.avg_growth <= 5
                            ? "../images/seeds.png"
                            : object.avg_growth <= 15
                            ? "../images/sprout.png"
                            : "../images/tomato.png"
                        }
                      />
                    </div>
                    <div className="growth-disc">
                      {object.avg_growth <= 5
                        ? "Seed phase"
                        : object.avg_growth <= 15
                        ? "Vegetation"
                        : "Final growth"}
                      <div className="growth-value">
                        Week {object.week_difference}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sort">
            {growth.map((object, index) => (
              <div className="week-box" key={index}>
                <div className="week-value">
                  <div
                    className={`
                                phase
                                ${
                                  object.avg_growth <= 5
                                    ? "seed-height"
                                    : object.avg_growth <= 15
                                    ? "vegetation-height"
                                    : "final-growth-height"
                                }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="status-sort">
          <div className="env-box">
            <div className="temp-box color">
              <FontAwesomeIcon
                icon="fa-solid fa-temperature-three-quarters"
                className="stat-icon"
              />
            </div>
            <div>
              <div>temperature</div>
              {env.map((object, index) => (
                <div key={index}>
                  {object.map((stat, index) => (
                    <div key={index} className="stat-value">
                      {stat.inner_temp != null ? stat.inner_temp + " °C" : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="env-box">
            <div className="humid-box color">
              <FontAwesomeIcon
                icon="fa-solid fa-droplet"
                className="stat-icon"
              />
            </div>
            <div>
              <div>humidity</div>
              {env.map((object, index) => (
                <div key={index}>
                  {object.map((stat, index) => (
                    <div key={index} className="stat-value">
                      {stat.inner_humid != null ? stat.inner_humid + " %" : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="env-box">
            <div className="lux-box color">
              <FontAwesomeIcon
                icon="fa-regular fa-lightbulb"
                className="stat-icon"
              />
            </div>
            <div>
              <div>light intensity</div>
              {env.map((object, index) => (
                <div key={index}>
                  {object.map((stat, index) => (
                    <div key={index} className="stat-value">
                      {stat.brightness != null ? stat.brightness : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="sensor-box-sort">
        <h4 className="sensor-box-title">Farm Statistics</h4>
        <div className="sensor-box">
          <div>
            <PiPottedPlantFill className="sensor-icon" />
          </div>
          <div>
            <h3>Soil Humidity</h3>
            {hasValue
              ? humidity.map((name, id) => (
                  <div key={id} className="soil-humid-id">
                    {id === host - 1 ? name.plant_id : null}
                  </div>
                ))
              : null}
          </div>
          <div className="sensor-value">
            {hasValue
              ? humidity.map((value, id) => (
                  <div key={id} className="soil-humid-id">
                    {id === host - 1 ? `${value.soil_humid} %` : null}
                  </div>
                ))
              : null}
          </div>
        </div>
        <div className="sensor-box">
          <GiWateringCan className="sensor-icon" />
          <div>
            <h3>Watering Amount</h3>
            <div className="sensor-disc">This Week</div>
          </div>
          <div className="sensor-value">
            {hasValue && watering ? watering : 0}
          </div>
        </div>
        <div className="sensor-box">
          <MdCo2 className="sensor-icon" />
          <div>
            <h3>Co2 Density</h3>
            <div className="sensor-disc">Now</div>
          </div>
          <div className="sensor-value">0</div>
        </div>
      </div>
    </div>
  );
};
