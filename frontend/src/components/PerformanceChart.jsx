import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function PerformanceChart({ history }) {

  // Remove invalid scores
  const interviews = history.filter(
    (item) =>
      item.overallScore !== undefined &&
      item.overallScore !== null
  );

  // Line Chart
  const lineData = {
    labels: interviews.map(
      (item) => item.role
    ),

    datasets: [
      {
        label: "Score %",
        data: interviews.map(
          (item) => item.overallScore
        ),

        borderColor: "#4F46E5",
        backgroundColor: "#4F46E5",

        borderWidth: 3,

        pointRadius: 5,

        pointHoverRadius: 7,

        fill: false,

        tension: 0.4,
      },
    ],
  };

  // Pie Chart
  const excellent = history.filter(
    (item) => (item.overallScore || 0) >= 80
  ).length;

  const good = history.filter(
    (item) =>
      (item.overallScore || 0) >= 60 &&
      (item.overallScore || 0) < 80
  ).length;

  const poor = history.filter(
    (item) => (item.overallScore || 0) < 60
  ).length;

  const pieData = {
    labels: [
      "Excellent",
      "Good",
      "Needs Improvement",
    ],

    datasets: [
      {
        data: [
          excellent,
          good,
          poor,
        ],

        backgroundColor: [
          "#22C55E",
          "#F59E0B",
          "#EF4444",
        ],

        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">

      {/* Line Chart */}
      <div>

        <h3 className="text-lg font-semibold mb-4">
          All Interview Scores
        </h3>

        <div className="h-[350px]">

          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,

              plugins: {
                legend: {
                  display: true,
                },
              },

              scales: {
                y: {
                  beginAtZero: true,
                  min: 0,
                  max: 100,

                  ticks: {
                    stepSize: 20,
                  },
                },

                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                  },
                },
              },
            }}
          />

        </div>

      </div>


      {/* Pie Chart */}
      <div>

        <h3 className="text-lg font-semibold mb-4 text-center">
          Score Distribution
        </h3>

        <div className="w-72 mx-auto">

          <Pie
            data={pieData}
            options={{
              responsive: true,
            }}
          />

        </div>

      </div>

    </div>
  );
}

export default PerformanceChart;