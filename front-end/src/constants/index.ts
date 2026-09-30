type GrowthPhase = 'seed' | 'vegetation' | 'final';

interface GrowthPhaseConfig {
  max: number;
  className: string;
  image: string;
  title: string;
}

export const GROWTH_PHASES: Record<GrowthPhase, GrowthPhaseConfig> = {
  seed: {
    max: 5,
    className: 'seed-phase',
    image: new URL('../images/seeds.png', import.meta.url).href,
    title: 'Seed Phase'
  },
  vegetation: {
    max: 15,
    className: 'vegetation',
    image: new URL('../images/sprout.png', import.meta.url).href,
    title: 'Vegetation'
  },
  final: {
    max: Infinity,
    className: 'final-growth',
    image: new URL('../images/tomato.png', import.meta.url).href,
    title: 'Final Growth'
  },
};
