import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";

function DashboardData({ transactions }) {
  const debitTotal = transactions
    .filter((t) => (t.type || "debit") === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const creditTotal = transactions
    .filter((t) => (t.type || "debit") === "credit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = creditTotal - debitTotal;

  const currentMonthExpenses = transactions
    .filter((t) => {
      const transDate = new Date(t.date);
      const now = new Date();
      return (
        transDate.getMonth() === now.getMonth() &&
        transDate.getFullYear() === now.getFullYear() &&
        (t.type || "debit") === "debit"
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const transactionCount = transactions.length;

  const debitTransactions = transactions.filter(
    (t) => (t.type || "debit") === "debit"
  ).length;
  const averageExpense =
    debitTransactions > 0 ? (debitTotal / debitTransactions).toFixed(2) : 0;
  return (
    <div className="grid grid-cols-1 min-[470px]:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white max-[470px]:text-center rounded-2xl shadow-xl/20 p-6 hover:shadow-xl/40 transition">
        <p className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-start max-[470px]:justify-center">
          <ShowChartRoundedIcon className="text-red-500" />
          Total Expenses
        </p>
        <p className="text-3xl font-bold text-red-500 mb-1">
          ₹{debitTotal.toFixed(2)}
        </p>
        <p className="text-md text-gray-700">All time</p>
      </div>

      <div className="bg-white max-[470px]:text-center rounded-2xl shadow-xl/20 p-6 hover:shadow-xl/40 transition">
        <p className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-start max-[470px]:justify-center">
          <CalendarMonthRoundedIcon className="text-orange-500" />
          This Month Expense
        </p>
        <p className="text-3xl font-bold text-orange-500 mb-1">
          ₹{currentMonthExpenses.toFixed(2)}
        </p>
        <p className="text-md text-gray-700">Current month</p>
      </div>

      <div className="bg-white max-[470px]:text-center rounded-2xl shadow-xl/20 p-6 hover:shadow-xl/40 transition">
        <p className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-start max-[470px]:justify-center">
          <ReceiptLongRoundedIcon className="text-blue-500" />
          Transactions
        </p>
        <p className="text-3xl font-bold text-blue-500 mb-1">
          {transactionCount}
        </p>
        <p className="text-md text-gray-700">Total count</p>
      </div>

      <div className="bg-white max-[470px]:text-center rounded-2xl shadow-xl/20 p-6 hover:shadow-xl/40 transition">
        <p className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2 justify-start max-[470px]:justify-center">
          <SavingsRoundedIcon className="text-purple-600" />
          Average Expense
        </p>
        <p className="text-3xl font-bold text-purple-600 mb-1">
          ₹{averageExpense}
        </p>
        <p className="text-md text-gray-700">Per transaction</p>
      </div>
    </div>
  );
}

export default DashboardData;
