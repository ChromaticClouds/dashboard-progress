import { ResponsiveLine } from "@nivo/line"

const LineChart = ({ data }) => (
    <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        curve="natural"
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        colors={'#1f2f40'}
        enablePoints={false}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        areaOpacity={0}
        enableSlices="x"
        legends={[]}
    />
)

export default LineChart;