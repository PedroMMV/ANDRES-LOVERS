export const chartColorSchemes = {
  default: {
    primary: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    secondary: ['#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#f472b6'],
  },
  colorblind: {
    // Use Wong's colorblind-safe palette
    primary: ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#F0E442', '#56B4E9'],
    secondary: ['#D55E00', '#999999', '#000000', '#0072B2', '#E69F00', '#009E73'],
  },
  monochrome: {
    primary: ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#aaaaaa', '#cacaca', '#eaeaea'],
    secondary: ['#2a2a2a', '#5a5a5a', '#8a8a8a', '#bababa', '#dadada', '#fafafa'],
  },
};

export const getChartColors = (scheme: 'default' | 'colorblind' | 'monochrome') => chartColorSchemes[scheme];
