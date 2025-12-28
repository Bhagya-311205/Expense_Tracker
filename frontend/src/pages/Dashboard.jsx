import React from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardData from "../components/DashboardData.jsx";
import DashboardCharts from "../components/DashboardCharts.jsx";
import DashboardRecentTransaction from "../components/DashboardRecentTransaction.jsx";
import { transactionAPI } from "../services/api";
import { toast } from "sonner";
import { authAPI } from "../services/api";

function Dashboard() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResp = await authAPI.getCurrentUser();
        setCurrentUser(userResp.user);

        const data = await transactionAPI.getAll();
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data.message) {
          toast.error(data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || "Failed to load dashboard data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-10 px-4 md:px-6">
      {loading && <div className="text-center py-10 text-gray-600">Loading transactions...</div>}
      {!loading && (
      <div className="md:max-w-5/6 mx-auto bg-radial from-blue-500 via-blue-400 to-blue-300 p-5 sm:p-6 rounded-4xl shadow-xl/40">
        <DashboardHeader
          currentUser={currentUser}
          transactions={transactions}
        />

        <DashboardData transactions={transactions} />

        <DashboardCharts transactions={transactions} />

        <DashboardRecentTransaction transactions={transactions} />
      </div>
      )}
    </div>
  );
}

export default Dashboard;
