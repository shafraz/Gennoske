import { useColorScheme } from 'react-native';

const light = {
  bg: '#f4f6f8',
  card: '#ffffff',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  primary: '#0f766e',
  good: '#15803d',
  bad: '#b91c1c',
  track: '#e5e7eb',
  input: '#f9fafb',
};
const dark: typeof light = {
  bg: '#0b1015',
  card: '#151c24',
  text: '#f3f4f6',
  muted: '#9ca3af',
  border: '#27313c',
  primary: '#2dd4bf',
  good: '#4ade80',
  bad: '#f87171',
  track: '#27313c',
  input: '#0f151b',
};

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);
