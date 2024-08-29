import { create } from 'zustand';

const useStreamChartStore = create((set) => ({
    harvestable: {
        labels: [],
        datasets: [
            {
                label: '생산 수율',
                data: [],
                borderColor: '#5b87d4',
                backgroundColor: 'rgba(56, 121, 218, 0.37)',
                fill: "origin",
                tension: 0.3,
                pointStyle: false
            },
        ],
    },
    setHarvestable: (labels, productionRate) => {
        set((state) => ({
            harvestable: {
                labels,
                datasets: [
                    {
                        ...state.harvestable.datasets[0],
                        data: productionRate
                    }
                ]
            }
        }));
    }
}));

export default useStreamChartStore;