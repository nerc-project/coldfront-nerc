/* ========================================
   UTILITY REFERENCES
   ======================================== */

const generateUsageLabels = ChartUtils.generateUsageLabels;
const getResponsiveTickInterval = ChartUtils.getResponsiveTickInterval;
const getResponsiveFontSizes = ChartUtils.getResponsiveFontSizes;
const getCenteredLabels = ChartUtils.getCenteredLabels;
const getCenteredData = ChartUtils.getCenteredData;
const processDatasetForChart = ChartUtils.processDatasetForChart;
const calculateDailyData = ChartUtils.calculateDailyData;
const missingDataGrayscalePlugin = ChartUtils.missingDataGrayscalePlugin;
const getHoverColor = ChartUtils.getHoverColor;

/* ========================================
   DATA INITIALIZATION
   
   Data sources (in priority order):
   1. data-cumulative-charges attribute on #chart-view element (production)
      Contains raw CumulativeChargesDict JSON from allocation attribute
   2. DEV_MOCK_RAW_DATA - Mocks the CumulativeChargesDict format for testing
   3. ChartConfig mock data - Legacy fallback
   
   CumulativeChargesDict format:
   { "2025-12-01": {"SU Type": "10.50", ...}, "2025-12-02": {...}, ... }
   ======================================== */

// DEV MODE: Set to true to use mock raw data (simulates backend data)
const DEV_USE_MOCK_RAW_DATA = false;

// Mock data in CumulativeChargesDict format (same as backend would provide)
function generateMockRawData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const today = now.getDate();
  
  const data = {};
  
  // Track cumulative totals for each SU type (ensures monotonic increase)
  const totals = {
    "OpenStack CPU SU": 0,
    "OpenStack GPU A100 SU": 0,
    "OpenStack GPU V100 SU": 0,
    "OpenStack GPU H100 SU": 0,
    "OpenShift CPU SU": 0,
    "OpenShift Storage SU": 0
  };
  
  // Daily rates with some variance
  const dailyRates = {
    "OpenStack CPU SU": 2.5,
    "OpenStack GPU A100 SU": 12.8,
    "OpenStack GPU V100 SU": 6.4,
    "OpenStack GPU H100 SU": 18.5,
    "OpenShift CPU SU": 1.8,
    "OpenShift Storage SU": 0.9
  };
  
  for (let day = 1; day <= today; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Add daily usage (with variance) to cumulative totals
    const dayData = {};
    for (const [suType, rate] of Object.entries(dailyRates)) {
      const dailyUsage = rate * (0.5 + Math.random()); // 0.5x to 1.5x daily rate
      totals[suType] += dailyUsage;
      dayData[suType] = totals[suType].toFixed(2);
    }
    
    data[dateStr] = dayData;
  }
  
  return data;
}

function transformCumulativeCharges(rawData) {
  if (!rawData || typeof rawData !== 'object' || Object.keys(rawData).length === 0) {
    return null;
  }

  const sortedDates = Object.keys(rawData).sort();
  if (sortedDates.length === 0) return null;

  // Extract year and month from first date (YYYY-MM-DD format)
  const firstDate = sortedDates[0];
  const [yearStr, monthStr] = firstDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed

  // Collect all SU types across all dates
  const suTypes = new Set();
  for (const dateStr of sortedDates) {
    const dayData = rawData[dateStr];
    if (dayData && typeof dayData === 'object') {
      Object.keys(dayData).forEach(su => suTypes.add(su));
    }
  }

  // Build datasets for each SU type with colors from palette
  const colorPalette = ChartConfig.COLOR_PALETTE;
  const datasets = [];
  const sortedSuTypes = Array.from(suTypes).sort();
  
  sortedSuTypes.forEach((suType, idx) => {
    const data = sortedDates.map(dateStr => {
      const dayData = rawData[dateStr];
      if (dayData && dayData[suType] !== undefined) {
        return parseFloat(dayData[suType]);
      }
      return null;
    });
    
    const color = colorPalette[idx % colorPalette.length];
    datasets.push({
      label: suType,
      data: data,
      borderColor: color.border,
      backgroundColor: color.background
    });
  });

  return { year, month, datasets };
}

function loadUsageDataFromDOM() {
  const chartView = document.getElementById('chart-view');
  if (!chartView) return null;
  
  let rawData = null;
  
  // Check for real data from backend via json_script tag
  const chargesDataElement = document.getElementById('charges-data');
  if (chargesDataElement) {
    try {
      rawData = JSON.parse(chargesDataElement.textContent);
      if (rawData && Object.keys(rawData).length > 0) {
        console.log('[NERC Chart] Using REAL data from backend');
      } else {
        rawData = null;
      }
    } catch (e) {
      console.warn('[NERC Chart] Failed to parse backend data:', e);
    }
  }
  
  // Fall back to dev mock data if enabled and no real data
  if (!rawData && DEV_USE_MOCK_RAW_DATA) {
    rawData = generateMockRawData();
    console.log('[NERC Chart] Using DEV MOCK data (set DEV_USE_MOCK_RAW_DATA=false to disable)');
  }
  
  if (!rawData) {
    console.log('[NERC Chart] No data available');
    return null;
  }
  
  console.log('[NERC Chart] Raw data:', rawData);
  const transformed = transformCumulativeCharges(rawData);
  console.log('[NERC Chart] Transformed data:', transformed);
  return transformed;
}

const usageChartData = loadUsageDataFromDOM();
const usageYear = usageChartData?.year || new Date().getFullYear();
const usageMonth = usageChartData?.month !== undefined ? usageChartData.month : new Date().getMonth();
const usageLabels = generateUsageLabels(usageYear, usageMonth);

let usageDatasets;
if (usageChartData && usageChartData.datasets.length > 0) {
  usageDatasets = usageChartData.datasets;
} else {
  usageDatasets = [];
}

// Hide the entire costs card if no data is available
const suCostsCard = document.getElementById('su-costs-card');
if (suCostsCard && usageDatasets.length === 0) {
  suCostsCard.style.display = 'none';
  console.log('[NERC Chart] No data available - hiding costs card');
}

let currentDataMode = 'cumulative';

function getDataForMode(mode) {
  if (mode === 'daily') {
    return usageDatasets.map(ds => ({ ...ds, data: calculateDailyData(ds.data) }));
  }
  return usageDatasets;
}

function toISODate(year, month, day) {
  const y = String(year);
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function exportUsageToCSV() {
  const datasets = getDataForMode(currentDataMode);
  
  // Build CSV header
  let csvContent = 'Date';
  datasets.forEach(ds => {
    csvContent += ',' + ds.label + ' (USD)';
  });
  csvContent += ',Total (USD)\n';

  // Build CSV rows with ISO date format
  usageLabels.forEach((label, i) => {
    const isoDate = toISODate(usageYear, usageMonth, i + 1);
    csvContent += isoDate;
    
    let rowTotal = 0;
    let hasMissing = false;
    
    datasets.forEach(ds => {
      let val = ds.data[i];
      if (val !== null && val !== undefined) {
        rowTotal += val;
        csvContent += ',' + val.toFixed(2);
      } else {
        hasMissing = true;
        csvContent += ',';
      }
    });
    
    if (hasMissing) {
      csvContent += ',';
    } else {
      csvContent += ',' + rowTotal.toFixed(2);
    }
    
    csvContent += '\n';
  });

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `su_usage_${currentDataMode}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Attach export button handler
var exportBtn = document.getElementById('export-csv-btn');
if (exportBtn) {
  exportBtn.addEventListener('click', exportUsageToCSV);
}

// Populate Table with usage data
var dataTableInstance = null;

function populateUsageTable(datasets) {
  const table = document.getElementById('allocationUsageTable');
  if (!table) return;
  
  // Destroy existing DataTable if it exists
  if (dataTableInstance) {
    dataTableInstance.destroy();
    dataTableInstance = null;
  }
  
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');

  // Header row
  let headerRow = '<tr>';
  headerRow += '<th scope="col">Date</th>';
  datasets.forEach(ds => {
    headerRow += `<th scope="col">${ds.label} (USD)</th>`;
  });
  headerRow += '<th scope="col">Total (USD)</th>';
  headerRow += '</tr>';
  thead.innerHTML = headerRow;

  // Body: one row per day
  let bodyRows = '';
  usageLabels.forEach((label, i) => {
    bodyRows += '<tr>';
    bodyRows += `<th scope="row" class="text-nowrap">${label}</th>`;
    
    let rowTotal = 0;
    let hasMissing = false;
    
    datasets.forEach(ds => {
      let val = ds.data[i];
      if (val !== null && val !== undefined) {
        rowTotal += val;
        bodyRows += `<td>${val.toFixed(2)}</td>`;
      } else {
        hasMissing = true;
        bodyRows += `<td class="text-muted">-</td>`;
      }
    });
    
    if (hasMissing) {
      bodyRows += `<td class="text-muted">-</td>`;
    } else {
      bodyRows += `<td><strong>${rowTotal.toFixed(2)}</strong></td>`;
    }
    
    bodyRows += '</tr>';
  });
  tbody.innerHTML = bodyRows;

  // Initialize DataTable (matching allocationuser_table style)
  if (typeof $ !== 'undefined' && $.fn.DataTable) {
    dataTableInstance = $('#allocationUsageTable').DataTable({
      'aoColumnDefs': [{
        'bSortable': false,
        'aTargets': ['nosort']
      }]
    });
  }
}

// Initial table population
populateUsageTable(usageDatasets);

// View toggle handlers (graph/table)
var graphBtn = document.getElementById('show-graph-btn');
var tableBtn = document.getElementById('show-table-btn');
var chartView = document.getElementById('chart-view');
var tableView = document.getElementById('table-view');

if (graphBtn && tableBtn && chartView && tableView) {
  graphBtn.addEventListener('click', function() {
    chartView.style.display = 'block';
    tableView.style.display = 'none';
    graphBtn.classList.add('active');
    tableBtn.classList.remove('active');
  });

  tableBtn.addEventListener('click', function() {
    chartView.style.display = 'none';
    tableView.style.display = 'block';
    graphBtn.classList.remove('active');
    tableBtn.classList.add('active');
  });
}

// Data mode toggle handlers
var cumulativeBtn = document.getElementById('show-cumulative-btn');
var dailyBtn = document.getElementById('show-daily-btn');
var usageChart = null;

// NERC Usage Chart
const ctx = document.getElementById('allocationUsageChart');

if (ctx) {
  const processedDatasets = usageDatasets.map((ds, idx) => processDatasetForChart(ds, idx));
  const dataLength = processedDatasets.reduce((max, ds) => Math.max(max, ds.data?.length || 0), 0);
  const isLowDataState = dataLength < 4;
  
  // Get centered labels and update datasets if in low data state
  const chartLabels = isLowDataState ? getCenteredLabels(usageLabels, dataLength) : usageLabels.slice(0, dataLength);
  
  if (isLowDataState) {
    processedDatasets.forEach(ds => {
      if (ds.data) {
        ds.data = getCenteredData(ds.data);
      }
    });
  }

  usageChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: processedDatasets
    },
    plugins: [missingDataGrayscalePlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: Math.max(window.devicePixelRatio || 1, 3),
      onResize: function(chart, size) {
        // Force tick recalculation on resize by updating the chart
        chart.update('none');
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 4,
          hoverBackgroundColor: getHoverColor,
          hoverBorderColor: getHoverColor,
          hoverBorderWidth: 0
        },
        line: {}
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            padding: 20,
            font: function(context) {
              const chartWidth = context.chart.width || 800;
              const sizes = getResponsiveFontSizes(chartWidth);
              return { size: sizes.legend };
            },
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
          enabled: false,
          position: 'nearest',
          external: externalTooltipHandler
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
            drawOnChartArea: true,
            drawTicks: false,
          },
          ticks: {
            align: 'center',
            maxRotation: 0,
            autoSkip: false,
            font: function(context) {
              const chartWidth = context.chart.width || 800;
              const sizes = getResponsiveFontSizes(chartWidth);
              return { size: sizes.axisTicks };
            },
            callback: function (value, index) {
              const label = this.getLabelForValue(value);
              const totalLabels = this.chart.data.labels.length;
              
              // Get current chart width for responsive tick calculation
              const chartWidth = this.chart.width || 800;
              const tickInterval = getResponsiveTickInterval(totalLabels, chartWidth);
              const lastIndex = totalLabels - 1;
              
              // Show label if it aligns with the interval counting backwards from the end
              if ((lastIndex - index) % tickInterval === 0) {
                return label;
              }
              return '';
            }
          }
        },
        y: {
          stacked: true,
          border: {
            display: false,
          },
          ticks: {
            count: 5,
            font: function(context) {
              const chartWidth = context.chart.width || 800;
              const sizes = getResponsiveFontSizes(chartWidth);
              return { size: sizes.axisTicks };
            }
          },
          beginAtZero: true,
          grace: '30%',
        }
      }
    }
  });

  // Function to update chart with new data
  function updateChartData(mode) {
    const datasets = getDataForMode(mode);
    const newProcessedDatasets = datasets.map((ds, idx) => processDatasetForChart(ds, idx));
    
    // Calculate data length and check for low data state (same logic as initial chart creation)
    const dataLength = newProcessedDatasets.reduce((max, ds) => Math.max(max, ds.data?.length || 0), 0);
    const isLowDataState = dataLength < 4;
    
    // Apply centering for low data states
    if (isLowDataState) {
      newProcessedDatasets.forEach(ds => {
        if (ds.data) {
          ds.data = getCenteredData(ds.data);
        }
      });
      usageChart.data.labels = getCenteredLabels(usageLabels, dataLength);
    } else {
      usageChart.data.labels = usageLabels.slice(0, dataLength);
    }
    
    usageChart.data.datasets = newProcessedDatasets;
    usageChart.update();
  }

  // Toggle button handlers
  const chartTitle = document.getElementById('chart-title');
  const chartSubtitle = document.getElementById('chart-subtitle');
  
  const modeConfig = {
    cumulative: { title: 'SU Cost - Cumulative', subtitle: 'Showing the cumulative cost for thismonth' },
    daily: { title: 'SU Cost - Daily', subtitle: 'Showing the daily cost for this month' }
  };

  function switchMode(mode) {
    if (currentDataMode === mode) return;
    currentDataMode = mode;
    cumulativeBtn?.classList.toggle('active', mode === 'cumulative');
    dailyBtn?.classList.toggle('active', mode === 'daily');
    updateChartData(mode);
    populateUsageTable(getDataForMode(mode));
    if (chartTitle) chartTitle.textContent = modeConfig[mode].title;
    if (chartSubtitle) chartSubtitle.textContent = modeConfig[mode].subtitle;
  }

  cumulativeBtn?.addEventListener('click', () => switchMode('cumulative'));
  dailyBtn?.addEventListener('click', () => switchMode('daily'));
}

if (typeof window !== 'undefined') {
  window.transformCumulativeChargesForTest = transformCumulativeCharges;
}

