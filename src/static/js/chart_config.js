/**
 * Chart Configuration Module
 * 
 * Centralizes chart configuration including:
 * - Dataset color definitions
 * - Chart styling options
 */

const ChartConfig = (function() {
  'use strict';

  /* ========================================
     DATASET COLOR PALETTE
     ======================================== */
  
  const DATASET_COLORS = {
    cpu: {
      border: 'rgb(0, 192, 232)',
      background: 'rgba(0, 192, 232, 0.1)'
    },
    gpuH100: {
      border: 'rgb(117, 213, 92)',
      background: 'rgba(117, 213, 92, 0.1)'
    },
    gpuV100: {
      border: 'rgb(255, 146, 138)',
      background: 'rgba(255, 146, 138, 0.1)'
    },
    gpuA100: {
      border: 'rgb(255, 206, 86)',
      background: 'rgba(255, 206, 86, 0.1)'
    },
    storage: {
      border: 'rgb(153, 102, 255)',
      background: 'rgba(153, 102, 255, 0.1)'
    },
    network: {
      border: 'rgb(255, 159, 64)',
      background: 'rgba(255, 159, 64, 0.1)'
    }
  };

  const COLOR_PALETTE = [
    DATASET_COLORS.cpu,
    DATASET_COLORS.gpuH100,
    DATASET_COLORS.gpuV100,
    DATASET_COLORS.gpuA100,
    DATASET_COLORS.storage,
    DATASET_COLORS.network
  ];

  /* ========================================
     CHART STYLING
     ======================================== */

  const LINE_STYLE = {
    fill: true,
    borderWidth: 2,
    tension: 0.25,
    pointRadius: 0,
    hoverRadius: 4,
    borderJoinStyle: 'round',
    borderCapStyle: 'round'
  };

  const MISSING_DATA_STYLE = {
    segmentColor: 'rgba(70, 70, 70, 0.7)',
    gradientColor: 'rgb(160, 160, 160)',
    fillOpacity: 0.08
  };

  const GRADIENT_CONFIG = {
    startOpacity: 0.13,
    fadeHeight: 150,
    padding: 20
  };

  /* ========================================
     PUBLIC API
     ======================================== */

  return {
    DATASET_COLORS: DATASET_COLORS,
    COLOR_PALETTE: COLOR_PALETTE,
    LINE_STYLE: LINE_STYLE,
    MISSING_DATA_STYLE: MISSING_DATA_STYLE,
    GRADIENT_CONFIG: GRADIENT_CONFIG
  };

})();
