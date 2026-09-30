/**
 * Constants
 */
import { GROWTH_PHASES } from "@/constants";

const resolveGrowthPhase = (avgGrowth: number) => {
  if (avgGrowth <= GROWTH_PHASES.seed.max) return "seed";
  if (avgGrowth <= GROWTH_PHASES.vegetation.max) return "vegetation";
  return "final";
};

type GrowthProps = {
  avg_growth: number;
  week_difference: number;
};

export const GrowthGraph = ({ growth }: { growth: GrowthProps[] }) => {
  return (
    <div className="sort">
      {growth.map((object, index) => {
        const phase = resolveGrowthPhase(object.avg_growth);
        const phaseConfig = GROWTH_PHASES[phase];

        return (
          <div className="growth-box" key={index}>
            <div className="status phase">
              <div className={`phase ${phaseConfig.className}`}>
                <div className="growth-img-box">
                  <img src={phaseConfig.image} />
                </div>
                <div className="growth-disc">
                  {phaseConfig.title}
                  <div className="growth-value">
                    Week {object.week_difference}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
