import React from "react";
import PieChartOutlineRoundedIcon from "@mui/icons-material/PieChartOutlineRounded";
import StackedLineChartRoundedIcon from "@mui/icons-material/StackedLineChartRounded";
import SentimentVeryDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentVeryDissatisfiedOutlined";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useMediaQuery } from "@mui/material";

function DashboardCharts({ transactions }) {
  const isSmall = useMediaQuery("(max-width:640px)");
  const isMedium = useMediaQuery("(max-width:1024px)");
  
  const pieSize = isSmall ? 200 : isMedium ? 240 : 250;
  const pieRadius = isSmall ? 80 : isMedium ? 100 : 120;
  const barWidth = isSmall ? 300 : isMedium ? 400 : 380;
  const barHeight = isSmall ? 220 : isMedium ? 260 : 250;

  const categoryColors = {
    "Food & Dining": "#3B82F6",
    Transportation: "#F59E0B",
    Shopping: "#C084FC",
    Utilities: "#FBBF24",
    Healthcare: "#EF6B6B",
    Entertainment: "#34D399",
    Travel: "#F97316",
    Other: "#9CA3AF",
    "Salary/Wages": "#0EA5E9",
    "Interest Income": "#10B981",
    "Investment Income/Gains": "#6366F1",
    "Sales Revenue": "#22C55E",
    "Refunds/Reimbursements": "#F59E0B",
    Gifts: "#EC4899",
    "Other Income": "#94A3B8",
  };
  const categoryData = {};
  transactions
    .filter((t) => (t.type || "debit") === "debit")
    .forEach((t) => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = 0;
      }
      categoryData[t.category] += Math.abs(t.amount);
    });

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    label: category,
    value: amount,
  }));

  const pieDataWithColors = pieData.map((item) => ({
    ...item,
    color: categoryColors[item.label] || "#999999",
  }));

  const TOTAL = pieData.reduce((sum, item) => sum + item.value, 0);

  const getArcLabel = (params) => {
    if (TOTAL === 0) return "0%";
    const percent = params.value / TOTAL;
    return `${(percent * 100).toFixed(0)}%`;
  };


  const monthlyData = {};
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  months.forEach((month) => {
    monthlyData[month] = 0;
  });

  transactions
    .filter((t) => (t.type || "debit") === "debit")
    .forEach((t) => {
      const date = new Date(t.date);
      const monthName = months[date.getMonth()];
      monthlyData[monthName] += Math.abs(t.amount);
    });

  const chartData = {
    xAxis: [{ scaleType: "band", data: months }],
    series: [{ data: Object.values(monthlyData), color: "#5B66F2" }],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-xl/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Expenses by Category
          </h2>
          <PieChartOutlineRoundedIcon className="text-blue-500" />
        </div>
        {pieDataWithColors.length > 0 ? (
          <div className="flex w-full justify-center">
            <PieChart
              series={[
                {
                  outerRadius: pieRadius,
                  data: pieDataWithColors,
                  arcLabel: getArcLabel,
                },
              ]}
              width={pieSize}
              height={pieSize}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: "white",
                  fontSize: isSmall ? 9 : 11,
                  fontWeight: "bold",
                },
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
            <SentimentVeryDissatisfiedOutlinedIcon />
            <p>No expenses yet</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl/20 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Monthly Trend</h2>
          <StackedLineChartRoundedIcon className="text-indigo-500" />
        </div>
        {Object.values(monthlyData).some((val) => val > 0) ? (
          <div className="flex w-full justify-center">
            <BarChart
              {...chartData}
              width={barWidth}
              height={barHeight}
              series={[{ ...chartData.series[0], color: "#5B66F2" }]}
              xAxis={[{ ...chartData.xAxis[0], label: "Month" }]}
              yAxis={[{ label: "Expenses (₹)" }]}
              margin={{ top: 10, bottom: 30, left: isSmall ? 40 : 50, right: 10 }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-gray-500">
            <SentimentVeryDissatisfiedOutlinedIcon />
            <p>No data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCharts;
