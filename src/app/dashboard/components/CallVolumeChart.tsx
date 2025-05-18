 'use client';

import dynamic from 'next/dynamic';

const CallVolumeChart = dynamic(() => import('./CallVolumeChartClient'), {
  ssr: false,
});

export default CallVolumeChart;
