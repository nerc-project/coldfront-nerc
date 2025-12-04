/**
 * Allocation Detail Chart (Basic)
 * 
 * Basic chart initialization for Issue #176.
 * Renders a simple stacked line chart with mock data to demonstrate Chart.js integration.
 */

/* ========================================
   UTILITY REFERENCES
   ======================================== */

const generateUsageLabels = ChartUtils.generateUsageLabels;

/* ========================================
   DATA INITIALIZATION
   
   Data sources (in priority order):
   1. window.usageData - Pre-populated from Django template (production)
   2. ChartConfig mock data - For development when useMockData=true
   
   Django template should set:
   - window.usageYear (number)
   - window.usageMonth (number, 0-indexed)
   - window.usageData = { datasets: [...] }
   ======================================== */

const usageYear = window.usageYear || new Date().getFullYear();
const usageMonth = window.usageMonth !== undefined ? window.usageMonth : new Date().getMonth();
const usageLabels = generateUsageLabels(usageYear, usageMonth);

let usageDatasets;
if (window.usageData && Array.isArray(window.usageData.datasets)) {
  usageDatasets = window.usageData.datasets;
} else {
  usageDatasets = ChartConfig.generateMockData(usageYear, usageMonth);
}

/* ========================================
   CHART INITIALIZATION
   ======================================== */

const ctx = document.getElementById('allocationUsageChart');

if (ctx) {
  const processedDatasets = usageDatasets.map((ds, idx) => ({
    ...ds,
    fill: true,
    borderWidth: 2,
    tension: 0.25,
    pointRadius: 0,
    hoverRadius: 4,
    order: 3 - idx
  }));

  const dataLength = processedDatasets.reduce((max, ds) => Math.max(max, ds.data?.length || 0), 0);
  const chartLabels = usageLabels.slice(0, dataLength);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: processedDatasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            padding: 20,
            useBorderRadius: false,
            generateLabels: function (chart) {
              return chart.data.datasets.map(function (dataset, i) {
                return {
                  text: dataset.label,
                  fillStyle: dataset.borderColor,
                  strokeStyle: dataset.borderColor,
                  lineWidth: 0,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i
                };
              });
            }
          },
          display: true,
          position: 'bottom',
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          offset: true,
          border: {
            display: true,
          },
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          stacked: true,
          border: {
            display: false,
          },
          ticks: {
            count: 5
          },
          beginAtZero: true,
          grace: '30%',
        }
      }
    }
  });
}
