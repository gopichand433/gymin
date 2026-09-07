import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GYMIN - Personal Fitness & Workout Companion',
    short_name: 'GYMIN',
    description: 'All-in-one personal fitness, workout splits, nutrition tracking, and AI assistant.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080a0f',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
