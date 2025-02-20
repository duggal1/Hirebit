import React, { useEffect, useRef } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Plugin,
  DefaultDataPoint,
  ChartType,
  ChartDataset
} from 'chart.js';

type DataSet<TType extends ChartType> = ChartDataset<TType, DefaultDataPoint<TType>> & {
  data: number[];
  label?: string;
  backgroundColor?: string | string[] | CanvasGradient;
  borderColor?: string | string[] | CanvasGradient;
  [key: string]: unknown;
};

type ChartDataExtended<TType extends ChartType> = Omit<ChartData<TType, DefaultDataPoint<TType>, unknown>, 'datasets'> & {
  datasets: DataSet<TType>[];
};

interface UltraModernVisualizationsProps {
  lineData: ChartDataExtended<'line'>;
  barData: ChartDataExtended<'bar'>;
  pieData: ChartDataExtended<'pie'>;
  mapData?: unknown;
}

// Enhanced gradient plugin with dynamic colors and glass morphism effect
const gradientLineConfig: Plugin<'line'> = {
  id: 'gradientLine',
  beforeDatasetsDraw(chart: ChartJS) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    // Create vertical gradient with glass morphism effect
    const gradientVertical = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradientVertical.addColorStop(0, 'rgba(147, 51, 234, 0.5)');
    gradientVertical.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
    gradientVertical.addColorStop(1, 'rgba(79, 70, 229, 0.02)');

    // Create horizontal gradient for line with ultra-modern colors
    const gradientLine = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    gradientLine.addColorStop(0, 'rgba(147, 51, 234, 1)');
    gradientLine.addColorStop(0.3, 'rgba(236, 72, 153, 1)');
    gradientLine.addColorStop(0.6, 'rgba(79, 70, 229, 1)');
    gradientLine.addColorStop(1, 'rgba(124, 58, 237, 1)');

    if (chart.data.datasets[0]) {
      chart.data.datasets[0].backgroundColor = gradientVertical;
      chart.data.datasets[0].borderColor = gradientLine;
    }
  }
};

// Enhanced glow effect plugin with dynamic shadows
const glowEffect: Plugin<'line' | 'bar' | 'pie'> = {
  id: 'glowEffect',
  beforeDatasetsDraw(chart: ChartJS) {
    const { ctx } = chart;
    ctx.shadowColor = 'rgba(147, 51, 234, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  },
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx } = chart;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
};

const UltraModernVisualizations: React.FC<UltraModernVisualizationsProps> = ({
  lineData,
  barData,
  pieData,
  mapData
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: false, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 16,
        borderColor: 'rgba(147, 51, 234, 0.3)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} views`
        },
        animation: {
          duration: 200
        },
        boxPadding: 8,
        usePointStyle: true,
        cornerRadius: 8
      } as any
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
          color: 'rgba(148, 163, 184, 0.7)',
          maxRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)',
          padding: 12,
          callback: (value: any) => `${value}k`
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: true
      },
      point: {
        radius: 0,
        hoverRadius: 8,
        backgroundColor: 'rgba(147, 51, 234, 1)',
        borderColor: '#fff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hitRadius: 50
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 16,
        cornerRadius: 12,
        displayColors: false,
        animation: {
          duration: 200
        },
        boxPadding: 8
      } as any
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
          color: 'rgba(148, 163, 184, 0.7)',
          maxRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: 'rgba(148, 163, 184, 0.7)',
          padding: 12
        },
        border: {
          display: false
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
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
            size: 12,
            weight: 500
          },
          color: 'rgba(148, 163, 184, 0.9)',
          padding: 24,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: 600
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        padding: 16,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`
        }
      } as any
    },
    cutout: '80%',
    radius: '90%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  const modernLineData = {
    ...lineData,
    datasets: lineData.datasets.map(dataset => ({
      ...dataset,
      pointHoverBackgroundColor: 'rgba(147, 51, 234, 1)',
      pointHoverBorderColor: '#fff'
    }))
  };

  const modernBarData = {
    ...barData,
    datasets: barData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: 'rgba(147, 51, 234, 0.9)',
      hoverBackgroundColor: 'rgba(236, 72, 153, 0.9)',
      borderRadius: 16,
      borderSkipped: false,
      barThickness: 24,
      maxBarThickness: 32
    }))
  };

  const modernPieData = {
    ...pieData,
    datasets: pieData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: [
        'rgba(147, 51, 234, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(79, 70, 229, 0.9)'
      ],
      hoverBackgroundColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(79, 70, 229, 1)'
      ],
      borderWidth: 0,
      hoverOffset: 15
    }))
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div ref={chartRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Activity Trends Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={controls}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Activity Trends
              </h3>
              <p className="text-sm text-gray-400 mt-1 font-medium">Real-time view engagement</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-purple-400 font-medium">Live</span>
            </div>
          </div>
          <div className="h-[300px]">
            <Line data={modernLineData} options={lineOptions} plugins={[gradientLineConfig, glowEffect]} />
          </div>
        </Card>
      </motion.div>

      {/* Job Post Performance Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={controls}
        transition={{ delay: 0.2 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Job Post Performance
              </h3>
              <p className="text-sm text-gray-400 mt-1 font-medium">Views per posting</p>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-sm text-purple-400 font-medium">Last 30 days</span>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar data={modernBarData} options={barOptions} plugins={[glowEffect]} />
          </div>
        </Card>
      </motion.div>

      {/* Engagement Distribution Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={controls}
        transition={{ delay: 0.4 }}
        className="col-span-1 lg:col-span-2 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 rounded-3xl overflow-hidden p-6 hover:shadow-[0_8px_40px_-12px_rgba(147,51,234,0.2)] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Engagement Distribution
              </h3>
              <p className="text-sm text-gray-400 mt-1 font-medium">Click-through analysis</p>
            </div>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-[400px]">
              <Pie data={modernPieData} options={pieOptions} plugins={[glowEffect]} />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default UltraModernVisualizations;
