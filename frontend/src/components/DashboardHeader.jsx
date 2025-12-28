import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

function DashboardHeader({ currentUser, transactions }) {
  const debitTotal = transactions
    .filter((t) => (t.type || "debit") === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const creditTotal = transactions
    .filter((t) => (t.type || "debit") === "credit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = creditTotal - debitTotal;
  return (
    <div className="grid grid-cols-1 min-[470px]:grid-cols-2 gap-2 sm:gap-6 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <DashboardCustomizeRoundedIcon className="text-blue-600" />
          Dashboard
        </h1>
        <p className="text-gray-800 text-lg font-semibold flex items-center gap-2">
          <PersonRoundedIcon className="text-indigo-500" />
          Welcome back, {currentUser?.name || currentUser?.fullName}!
        </p>
      </div>
      <div className="text-center pt-5 min-[470px]:text-right">
        <p className="text-2xl text-gray-800 mb-1 font-semibold inline-flex items-center gap-2">
          <AccountBalanceWalletRoundedIcon className="text-emerald-700" />
          Current Balance
        </p>
        <p
          className={`text-3xl font-bold ${
            balance >= 0 ? "text-emerald-700" : "text-red-600"
          }`}
        >
          ₹{balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
