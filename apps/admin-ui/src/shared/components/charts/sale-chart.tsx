'use client';
import Box from 'apps/admin-ui/src/shared/components/box';
import React from 'react';
import Chart, { Props } from 'react-apexcharts';

export const SalesChart = ({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const chartSeries: Props['series'] = [
    {
      name: 'Sales',
      data: ordersData?.map((data) => data.count) || [
        31, 40, 28, 51, 42, 109, 100,
      ],
    },
  ];

  const chartOptions: Props['options'] = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.9, // starting opacity of the fill
        opacityTo: 0.1, // ending opacity
        stops: [50, 90, 90],
      },
    },
    markers: {
      size: 5,
      hover: { size: 7 },
    },
    xaxis: {
      categories: ordersData?.map((data) => data.month) || [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
      ],
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#666',
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    grid: {
      borderColor: '#eee',
      strokeDashArray: 4,
    },
  };

  return (
    <Box $css={{ width: '100%', height: '400px' }}>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height="100%"
      />
    </Box>
  );
};
