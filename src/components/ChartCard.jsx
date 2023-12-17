import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const ChartCard = ({ data }) => {
  // State for chart data
  const [chartData, setChartData] = useState({});

  // Function to process data
  const processData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      // Handle the case where data is not valid
      return;
    }

    // Sort data by year and month
    const sortedData = data.sort((a, b) =>
      new Date(`${a.year} ${a.month}`).getTime() -
      new Date(`${b.year} ${b.month}`).getTime()
    );

    // Extract unique labels (months and years)
    const chartLabels = Array.from(
      new Set(sortedData.map(item => `${item.month} ${item.year}`))
    );

    // Calculate sum for each label
    const chartDataValues = chartLabels.map(label =>
      sortedData
        .filter(item => `${item.month} ${item.year}` === label)
        .reduce((acc, item) => acc + item.sum, 0)
    );

    // Update chart data state
    setChartData({
      labels: chartLabels,
      datasets: [
        {
          data: chartDataValues,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
    });
  };

  // Process data when it changes
  useEffect(() => {
    // Call the data processing function
    processData();
  }, [data]); // Ensure that `data` is a dependency for useEffect

  return (
    <div>
      {chartData.labels && chartData.labels.length > 0 ? (
        <Doughnut data={chartData} />
      ) : (
        <p>No data to display</p>
      )}
    </div>
  );
};

export default ChartCard;
