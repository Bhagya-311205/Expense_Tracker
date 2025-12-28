import React from "react";
import {
  Container,
  Button,
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoIcon from "@mui/icons-material/Info";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { transactionAPI } from "../services/api";

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

function Transactions() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await transactionAPI.getAll();
        
        if (Array.isArray(data)) {
          setTransactions(data);
        } else if (data.message) {
          toast.error(data.message);
        }
      } catch (error) {
        const message = error.response?.data?.message || "Failed to load transactions";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const rows = transactions.map((t) => ({ ...t, id: t._id || t.id }));

  const [descriptionDialog, setDescriptionDialog] = React.useState({
    open: false,
    description: "",
  });

  const [receiptsDialog, setReceiptsDialog] = React.useState({
    open: false,
    receipts: [],
    txId: null,
  });

  const handleDelete = (index) => {
    const transaction = transactions.find((t) => t._id === index || t.id === index);
    
    toast.error("Delete this transaction?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const response = await transactionAPI.delete(transaction._id || transaction.id);
            if (response.message?.includes("Error")) {
              toast.error(response.message || "Failed to delete");
              return;
            }
            setTransactions(transactions.filter((t) => (t._id || t.id) !== (transaction._id || transaction.id)));
            toast.success("Transaction deleted successfully!");
          } catch (error) {
            const message = error.response?.data?.message || "Failed to delete transaction";
            toast.error(message);
          }
        },
      },
      duration: 5000,
    });
  };

  const handleEdit = (transaction) => {
    navigate("/AddTransaction", { state: { editId: transaction._id || transaction.id } });
  };

  const handleViewDescription = (description) => {
    setDescriptionDialog({
      open: true,
      description: description || "No description",
      wrap: "break-word"
    });
  };

  const handleCloseDescription = () => {
    setDescriptionDialog({ open: false, description: "" });
  };

  const handleViewReceipts = (receipts, txId) => {
    setReceiptsDialog({ open: true, receipts, txId });
  };

  const handleCloseReceipts = () => {
    setReceiptsDialog({ open: false, receipts: [], txId: null });
  };

  const handleDownloadReceipt = (receipt, transactionId) => {
    try {
      const serverBase =
        api.defaults?.baseURL?.replace(/\/api$/, "") || "http://localhost:3000";

      // Prefer explicit download endpoint to avoid path issues
      const url = `${serverBase}/api/transactions/${transactionId}/receipt/${
        receipt._id || receipt.id
      }`;

      const a = document.createElement("a");
      a.href = url;
      a.download = receipt.name || "receipt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download receipt");
    }
  };

  const formatSize = (size) => {
    const bytes = Number(size) || 0;
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-10 px-4 md:px-6">
      <div className="xl:max-w-3/4  mx-auto bg-radial from-blue-500 via-blue-400 to-blue-300 p-5 md:p-6 rounded-4xl shadow-xl/40">
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Transactions
              </h1>
              <p className="text-gray-800 text-lg font-semibold">
                Manage your transactions
              </p>
            </Box>
          </Box>
        </Box>
        <p className="text-gray-700 mb-4">
          {" "}
          <InfoIcon sx={{ verticalAlign: "middle", mr: 1 }}></InfoIcon>Click on
          Column header to sort or filter the transactions.
        </p>
        <Paper sx={{ borderRadius: 6, boxShadow: 7 }}>
          <DataGrid
            rows={rows}
            columns={[
              {
                field: "date",
                headerName: "Date",
                width: 120,
                sortable: true,
                filterable: true,
                valueFormatter: (value) =>
                  new Date(value)
                    .toISOString()
                    .split("T")[0]
                    .split("-")
                    .reverse()
                    .join("/"),
              },
              {
                field: "subject",
                headerName: "Subject",
                minWidth: 250,
                flex: 1,
                sortable: true,
                filterable: true,
              },
              {
                field: "merchant",
                headerName: "Merchant",
                scrolling: "yes",
                minWidth: 200,
                flex: 1,
                sortable: true,
                filterable: true,
              },
              {
                field: "category",
                headerName: "Category",
                width: 200,
                sortable: true,
                resizable: false,
                filterable: true,
                headerAlign: "center",
                align: "center",
                renderCell: (params) => (
                  <Chip
                    label={params.value}
                    sx={{
                      backgroundColor:
                        categoryColors[params.value] || "#9CA3AF",
                      color: "white",
                    }}
                    size="small"
                  />
                ),
              },
              {
                field: "type",
                headerName: "Type",
                width: 110,
                type: "singleSelect",
                headerAlign: "center",
                align: "center",
                resizable: false,
                valueOptions: ["debit", "credit"],
                sortable: true,
                filterable: true,
                renderCell: (params) => {
                  const isCredit = params.value === "credit";
                  return (
                    <Chip
                      label={isCredit ? "Credit" : "Debit"}
                      sx={{
                        color: isCredit ? "#1b5e20" : "#b71c1c",
                        backgroundColor: isCredit ? "#a5d6a7" : "#ef9a9a",
                      }}
                      size="small"
                    />
                  );
                },
              },
              {
                field: "amount",
                headerName: "Amount",
                width: 140,
                type: "number",
                align: "right",
                headerAlign: "center",
                sortable: true,
                filterable: true,
                renderCell: (params) => {
                  const isCredit = params.row.type === "credit";
                  const sign = isCredit ? "+" : "-";
                  const amountColor = isCredit ? "#16A34A" : "#EF4444";
                  const displayAmount = Number(params.value).toFixed(2);
                  return (
                    <span style={{ color: amountColor, fontWeight: "bold" }}>
                      {sign}₹{displayAmount}
                    </span>
                  );
                },
              },
              {
                field: "receipts",
                headerName: "Receipts",
                width: 110,
                sortable: false,
                resizable: false,
                filterable: false,
                headerAlign: "center",
                renderCell: (params) => {
                  const receipts = params.value || [];
                  return (
                    <Box sx={{ textAlign: "center" }}>
                      {receipts.length > 0 ? (
                        <Button
                          size="small"
                          startIcon={<ImageIcon />}
                          onClick={() => handleViewReceipts(receipts, params.row.id)}
                          sx={{
                            color: "#3B82F6",
                            borderRadius: "100px",
                            width: "70%",
                            "&:hover": { backgroundColor: "#e0e0e0" },
                          }}
                          variant="text"
                        >
                          {receipts.length}
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#999" }}>
                          None
                        </Typography>
                      )}
                    </Box>
                  );
                },
              },
              {
                field: "actions",
                headerName: "Actions",
                width: 120,
                headerAlign: "center",
                align: "center",
                sortable: false,
                resizable: false,
                filterable: false,
                renderCell: (params) => (
                  <Box sx={{}}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleViewDescription(params.row.description)
                      }
                      sx={{
                        color: "#10B981",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                      title="View Description"
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(params.row)}
                      sx={{
                        color: "#3B82F6",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                      title="Edit Transaction"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(params.row.id)}
                      sx={{
                        color: "#EF4444",
                        "&:hover": { backgroundColor: "#e0e0e0" },
                      }}
                      title="Delete Transaction"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ),
              },
            ]}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              sorting: { sortModel: [{ field: "date", sort: "desc" }] },
            }}
            showToolbar
            slots={{
              noRowsOverlay: () => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 0.5,
                    color: "#999",
                  }}
                >
                  <InfoIcon sx={{ fontSize: 25 }} />
                  <Typography variant="h6" sx={{ color: "#666", fontSize: 15 }}>
                    No transactions yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#999", fontSize: 14 }}>
                    Add your first transaction to get started
                  </Typography>
                </Box>
              ),
            }}
            sx={{
              borderRadius: 6,
              "& .MuiDataGrid-root": {
                borderRadius: 6,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e0e0e0",
                borderTop: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-columnSeparator": {
                display: "none",
              },
            }}
          />
        </Paper>
        <Dialog
          open={descriptionDialog.open}
          onClose={handleCloseDescription}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>Description</DialogTitle>
          <DialogContent>
            <Typography sx={{ pt: 1, whiteSpace: "pre-wrap" }}>
              {descriptionDialog.description}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDescription} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={receiptsDialog.open}
          onClose={handleCloseReceipts}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Receipts ({receiptsDialog.receipts.length})
          </DialogTitle>
          <DialogContent>
            {receiptsDialog.receipts.length > 0 ? (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}
              >
                {receiptsDialog.receipts.map((receipt) => (
                  <Box
                    key={receipt._id || receipt.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      backgroundColor: "#E3F2FD",
                      borderRadius: "4px",
                      border: "1px solid #2196F3",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "#0D47A1" }}
                      >
                        {receipt.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#1976D2" }}>
                        {formatSize(receipt.size)}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() =>
                        handleDownloadReceipt(receipt, receiptsDialog.txId)
                      }
                      sx={{ color: "#1976D2" }}
                    >
                      Download
                    </Button>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography sx={{ pt: 1, color: "#999" }}>
                No receipts available
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReceipts} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Transactions;
