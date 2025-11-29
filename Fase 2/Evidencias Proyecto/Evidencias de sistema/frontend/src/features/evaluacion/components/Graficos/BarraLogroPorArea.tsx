import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface Props {
  datos: {
    area: string;
    obtenido: number;
    maximo: number;
  }[];
}

const BarraLogroPorArea = ({ datos }: Props) => {
  // Opcional: ordenar por mayor logro
  // const datosOrdenados = [...datos].sort((a, b) => (b.obtenido / b.maximo) - (a.obtenido / a.maximo));
  const datosOrdenados = datos;

  const labels = datosOrdenados.map((a) => a.area);
  const porcentajes = datosOrdenados.map((a) =>
    a.maximo > 0 ? Number(((a.obtenido / a.maximo) * 100).toFixed(1)) : 0,
  );

  const colores = porcentajes.map((p) =>
    p >= 85 ? "#16a34a" : p >= 60 ? "#eab308" : "#dc2626",
  );

  const data: ChartData<"bar", number[], string> = {
    labels,
    datasets: [
      {
        label: "% logro por área",
        data: porcentajes,
        backgroundColor: colores,
        barThickness: 24,
        categoryPercentage: 0.7,
        barPercentage: 0.7,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      datalabels: {
        align: "end",
        anchor: "center",
        offset: 8,
        clamp: true, // evita que se corte fuera del canvas

        formatter: (value: number) => `${value.toFixed(1)}%`,
        color: (ctx) => {
          const value = ctx.dataset.data[ctx.dataIndex] as number;

          return value >= 85 ? "#ffffff" : "#000000";
        },
        font: {
          weight: "bold",
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.x.toFixed(1)}%`,
        },
      },
    },
  };

  return <Bar data={data} options={options} plugins={[ChartDataLabels]} />;
};

export default BarraLogroPorArea;
