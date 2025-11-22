import { Paper, Typography, Box } from "@mui/material";
import { Bar, Pie, Line, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// ⚙️ Registro de los componentes que usa Chart.js
ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title
);

interface ChartCardProps {
  title: string;
  data: Record<string, number>;
  type?: "bar" | "pie" | "line" | "doughnut" | "radar";
}

// 🎨 Colores predefinidos para las gráficas
const COLORS = [
  "#42A5F5",
  "#66BB6A",
  "#FFA726",
  "#AB47BC",
  "#26C6DA",
  "#FF7043",
  "#7E57C2",
  "#EC407A",
  "#9CCC65",
  "#29B6F6",
];

export default function ChartCard({ title, data, type = "bar" }: ChartCardProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No hay datos disponibles
        </Typography>
      </Paper>
    );
  }

  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: COLORS,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type !== "bar",
        position: "bottom" as const,
      },
      title: {
        display: false,
      },
    },
    scales:
      type === "bar" || type === "line"
        ? {
            x: {
              ticks: { color: "#555" },
              grid: { display: false },
            },
            y: {
              ticks: { color: "#555" },
              grid: { color: "#eee" },
            },
          }
        : {},
  };

  const renderChart = () => {
    switch (type) {
      case "pie":
        return <Pie data={chartData} options={commonOptions} />;
      case "doughnut":
        return <Doughnut data={chartData} options={commonOptions} />;
      case "line":
        return (
          <Line
            data={{
              ...chartData,
              datasets: [
                {
                  ...chartData.datasets[0],
                  fill: false,
                  borderColor: "#42A5F5",
                  tension: 0.3,
                },
              ],
            }}
            options={commonOptions}
          />
        );
      case "radar":
        return <Radar data={chartData} options={commonOptions} />;
      default:
        return <Bar data={chartData} options={commonOptions} />;
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: 300 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ height: 250 }}>{renderChart()}</Box>
    </Paper>
  );
}
