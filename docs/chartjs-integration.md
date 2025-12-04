# Chart.js Integration in ColdFront-NERC

This document explains how Chart.js was integrated into the ColdFront-NERC project for usage visualization.

## Overview

Chart.js is added as a NERC-specific dependency to visualize allocation usage statistics on the allocation detail page.

## Files Modified

### 1. Static Files
- **Location**: `src/static/chartjs/chart.min.js`
- **Purpose**: Contains the Chart.js library (v4.4.1)

### 2. Template Override
- **Location**: `src/templates/allocation/allocation_detail.html`
- **Changes**:
  - Added usage statistics card with canvas element (line ~175)
  - Imported Chart.js script (line ~440)
  - Added chart initialization code (line ~492)

### 3. Dockerfile
- **Changes**: Added line to copy NERC templates directory
```dockerfile
COPY src/templates/ /opt/venv/lib/python3.12/site-packages/coldfront/templates/
COPY src/static/ /opt/venv/lib/python3.12/site-packages/coldfront/static/
```

### 4. Local Settings
- **Location**: `src/local_settings.py`
- **Changes**: Added NERC static files directory to Django's search path
```python
STATICFILES_DIRS.insert(0, os.path.join(os.path.dirname(__file__), 'static'))
```

## How It Works

1. **Build Time**: During Docker build, the template and static files are copied into the container
2. **Deployment**: Kubernetes `collectstatic` command gathers all static files
3. **Runtime**: When users view an allocation detail page, they see a usage chart

## Example Chart

The current implementation shows a sample line chart with:
- Monthly CPU hours usage
- 6 months of data
- Responsive design

## Customizing the Chart

To use real data instead of sample data, modify the chart initialization in `allocation_detail.html`:

```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: {{ month_labels|safe }},  // Pass from Django view
    datasets: [{
      label: 'CPU Hours Used',
      data: {{ usage_data|safe }},    // Pass from Django view
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  },
  options: {
    // ... chart options
  }
});
```

## Testing

### Local Development
1. Build the Docker image:
```bash
docker build -t coldfront-nerc:test .
```

2. Run the container:
```bash
docker run -p 8080:8080 coldfront-nerc:test
```

3. Navigate to any allocation detail page to see the chart

### Kubernetes Deployment
The chart will automatically be included when deploying to staging/production as part of the normal deployment process.

## Chart Types

Chart.js supports multiple chart types. Change the `type` parameter to use different visualizations:
- `line` - Line chart (current)
- `bar` - Bar chart
- `pie` - Pie chart
- `doughnut` - Doughnut chart
- `radar` - Radar chart
- `polarArea` - Polar area chart

## Additional Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js Examples](https://www.chartjs.org/docs/latest/samples/information.html)


