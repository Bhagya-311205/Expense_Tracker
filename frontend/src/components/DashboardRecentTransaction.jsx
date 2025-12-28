function DashboardRecentTransaction({ transactions }) {
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  return (
    <div className="bg-white rounded-2xl shadow-xl/20 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
      </div>

      {recentTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-400 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-bold text-xl text-gray-900">
                          {transaction.subject}
                        </p>
                        <p className="text-md font-medium  text-gray-700">
                          {transaction.merchant} • {transaction.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-nowrap text-right">
                    <p
                      className={`font-bold ${
                        (transaction.type || "debit") === "credit"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {(transaction.type || "debit") === "credit" ? "+" : "-"}₹
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-500 text-sm">
                    {new Date(transaction.date)
                      .toISOString()
                      .split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      )}
    </div>
  );
}

export default DashboardRecentTransaction;
