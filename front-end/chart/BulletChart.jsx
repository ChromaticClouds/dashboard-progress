import { ResponsiveBullet } from "@nivo/bullet"

const BulletChart = ({ data /* see data tab */ }) => (
    <ResponsiveBullet
        data={data}
        margin={{ top: 10, right: 10, bottom: 10, left: 90 }}
        spacing={46}
        titleAlign="start"
        titleOffsetX={-70}
        measureBorderColor={{ from: 'color', modifiers: [] }}
        measureBorderWidth={3}
        measureSize={0.2}
        rangeColors="seq:yellow_orange_red"
        measureColors="oranges"
        markerColors="seq:cool"
        isInteractive={false}
    />
)

export default BulletChart;