import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { motion, spring } from 'framer-motion';
import { Chart, ChartData, ChartOptions, Plugin } from 'chart.js';

interface UltraModernVisualizationsProps {
  lineData: ChartData<'line', number[], unknown>;
  barData: ChartData<'bar', number[], unknown>;
  pieData: ChartData<'pie', number[], unknown>;
  mapData?: unknown;
}

// Define a custom plugin and type it using Chart.js's Plugin type.
const gradientLineConfig: Plugin = {
  id: 'gradientLine',
  beforeDatasetsDraw(chart: Chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.5)'); // Purple
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)');  // Indigo
    // If needed, you could assign this gradient to a dataset property here.
  }
};

const UltraModernVisualizations: React.FC<UltraModernVisualizationsProps> = ({
  lineData,
  barData,
  pieData,
  mapData
}) => {
  // Ultra modern line chart options with type annotation.
  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 12,
        borderColor: 'rgba(147, 51, 234, 0.2)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} views`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)'
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)',
          padding: 10,
          callback: (value) => `${value}k`
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        borderColor: 'rgba(147, 51, 234, 1)',
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.1)'
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        backgroundColor: 'rgba(147, 51, 234, 1)',
        borderColor: '#fff',
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)'
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)',
          padding: 10
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    cutout: '75%',
    radius: '90%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Styled datasets
  const modernLineData = {
    ...lineData,
    datasets: lineData.datasets.map(dataset => ({
      ...dataset,
      borderColor: 'rgba(147, 51, 234, 1)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
      pointBorderColor: '#fff'
    }))
  };

  const modernBarData = {
    ...barData,
    datasets: barData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: 'rgba(147, 51, 234, 0.8)',
      hoverBackgroundColor: 'rgba(147, 51, 234, 1)',
      borderRadius: 12,
      borderSkipped: false
    }))
  };

  const modernPieData = {
    ...pieData,
    datasets: pieData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderWidth: 0
    }))
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Activity Trends Card */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Activity Trends</h3>
            <p className="text-sm text-gray-400 mt-1">Real-time view engagement</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            Active now
          </div>
        </div>
        <div className="h-[300px]">
          {/* Register the plugin by passing it in the plugins array */}
          <Line data={modernLineData} options={lineOptions} plugins={[gradientLineConfig]} />
        </div>
      </Card>

      {/* Job Post Performance Card */}
      <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Job Post Performance</h3>
            <p className="text-sm text-gray-400 mt-1">Views per posting</p>
          </div>
          <div className="text-sm text-purple-400 font-medium">
            Last 30 days
          </div>
        </div>
        <div className="h-[300px]">
          <Bar data={modernBarData} options={barOptions} />
        </div>
      </Card>

      {/* Engagement Distribution Card */}
      <Card className="col-span-1 lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_0_50px_0_rgba(147,51,234,0.1)] transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Engagement Distribution</h3>
            <p className="text-sm text-gray-400 mt-1">Click-through analysis</p>
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="w-[400px]">
            <Pie data={modernPieData} options={pieOptions} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UltraModernVisualizations;
