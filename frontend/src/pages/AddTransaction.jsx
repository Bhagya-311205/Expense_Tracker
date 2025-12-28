import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { transactionAPI } from "../services/api";

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Travel",
  "Other",
];

const incomeCategories = [
  "Salary/Wages",
  "Interest Income",
  "Investment Income/Gains",
  "Sales Revenue",
  "Refunds/Reimbursements",
  "Gifts",
  "Other Income",
];

const transactionTypes = [
  { value: "debit", label: "Debit" },
  { value: "credit", label: "Credit" },
];

function AddTransaction() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = React.useState({
    subject: "",
    merchant: "",
    amount: "",
    type: "debit",
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    receipts: [],
    removedReceipts: [],
  });

  const [editId, setEditId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const stateEditId = location.state?.editId;
    if (stateEditId) {
      setEditId(stateEditId);
    }
  }, [location.state]);

  React.useEffect(() => {
    const loadTransaction = async () => {
      if (!editId) return;
      try {
        const data = await transactionAPI.getById(editId);
        setFormData((prev) => ({
          ...prev,
          ...data,
          type: data.type || "debit",
          receipts: Array.isArray(data.receipts) ? data.receipts : [],
          description: data.description || "",
          date: data.date
            ? new Date(data.date).toISOString().split("T")[0]
            : prev.date,
        }));
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Failed to load transaction";
        toast.error(message);
      }
    };

    loadTransaction();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData((prev) => ({ ...prev, type: value, category: "" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const added = [];
    files.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File size exceeds 5MB !!`);
        return;
      }
      added.push({
        _file: file,
        name: file.name,
        size: Number((file.size / 1024).toFixed(2)),
        type: file.type,
        id: `${Date.now()}-${index}-${file.name}`,
      });
    });
    if (added.length) {
      setFormData((prev) => ({
        ...prev,
        receipts: [...prev.receipts, ...added],
      }));
      toast.success(`${added.length} receipt(s) uploaded successfully !`);
    }
    e.target.value = "";
  };

  const handleRemoveReceipt = (id, existing = false) => {
    const idStr = typeof id === "string" ? id : id?.toString?.() || id;
    if (existing) {
      setFormData((prev) => ({
        ...prev,
        removedReceipts: [...prev.removedReceipts, idStr],
        receipts: prev.receipts.filter(
          (r) => (r._id ? r._id.toString() : r.id) !== idStr
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        receipts: prev.receipts.filter((r) => r.id !== idStr),
      }));
    }
    toast.success("Receipt removed !!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Please enter subject");
      return;
    }
    if (!formData.merchant.trim()) {
      toast.error("Please enter merchant");
      return;
    }
    const amountValue = Number(parseFloat(formData.amount).toFixed(2));
    if (!formData.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      toast.error("Please enter valid amount");
      return;
    }
    if (!formData.category) {
      toast.error("Please select category");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "receipts") {
          formData.receipts.forEach((r) => {
            if (r._file) payload.append("receipts", r._file);
          });
        } else if (key === "removedReceipts") {
          const ids = formData.removedReceipts.map((rid) =>
            typeof rid === "string" ? rid : rid?.toString?.() || rid
          );
          payload.append(key, JSON.stringify(ids));
        } else {
          payload.append(key, formData[key]);
        }
      });

      if (editId) {
        await transactionAPI.update(editId, payload);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionAPI.create(payload);
        toast.success("Transaction added successfully!");
      }

      setFormData({
        subject: "",
        merchant: "",
        amount: "",
        type: "debit",
        date: new Date().toISOString().split("T")[0],
        category: "",
        description: "",
        receipts: [],
        removedReceipts: [],
      });
      setEditId(null);
      navigate("/Transactions");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Error processing transaction";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/Transactions");
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-10 px-4 md:px-6">
      <div className="lg:max-w-3/4 xl:max-w-1/2 mx-auto bg-radial from-blue-500 via-blue-400 to-blue-300 p-5 md:p-6 rounded-4xl shadow-xl/40">
        <Box sx={{ mb: 3 }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {editId ? "Edit Transaction" : "Add New Transaction"}
          </h1>
          <p className="text-gray-800 text-lg font-semibold">
            {editId ? "Update your transaction" : "Record a new transaction"}
          </p>
        </Box>
        <Card
          sx={{ backgroundColor: "#ffffff", borderRadius: 4, boxShadow: 10 }}
        >
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Transaction Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 2,
                  color: "slategray",
                }}
              >
                <TextField
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Business lunch"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Merchant *"
                  name="merchant"
                  value={formData.merchant}
                  onChange={handleChange}
                  placeholder="e.g., Starbucks"
                  variant="outlined"
                  fullWidth
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="transaction-type-label">Type</InputLabel>
                  <Select
                    labelId="transaction-type-label"
                    label="Type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    fullWidth
                  >
                    {transactionTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Amount *"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  variant="outlined"
                  fullWidth
                  slotProps={{
                    input: {
                      inputMode: "decimal",
                      pattern: "^\\d+(\\.\\d{0,2})?$",
                      min: "0",
                      step: "0.01",
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <TextField
                  label="Date *"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="default-category-label">
                    Category *
                  </InputLabel>
                  <Select
                    labelId="default-category-label"
                    label="Category *"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="" disabled>
                      Select a category
                    </MenuItem>
                    {(formData.type === "credit"
                      ? incomeCategories
                      : expenseCategories
                    ).map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional notes about this expense..."
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Receipt (Optional)
                </Typography>
                <Box
                  sx={{
                    border: "2px dashed #ddd",
                    borderRadius: "8px",
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      borderColor: "#999",
                      backgroundColor: "#f9f9f9",
                    },
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <label
                      htmlFor="dropzone-file"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        cursor: "pointer",
                        padding: "20px",
                      }}
                    >
                      <svg
                        style={{
                          width: "32px",
                          height: "32px",
                          marginBottom: "16px",
                          color: "#666",
                        }}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                        />
                      </svg>
                      <p style={{ marginBottom: "8px", fontSize: "14px" }}>
                        <span style={{ fontWeight: "bold" }}>
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p style={{ fontSize: "12px", color: "#999" }}>
                        SVG, PNG, JPG, GIF, PDF (MAX. 5MB)
                      </p>
                      <input
                        id="dropzone-file"
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        name="receipts"
                      />
                    </label>
                  </div>
                </Box>

                {formData.receipts.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", mb: 1 }}
                    >
                      Uploaded Receipts ({formData.receipts.length}):
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {formData.receipts.map((receipt) => (
                        <Box
                          key={receipt._id || receipt.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.5,
                            backgroundColor: "#E8F5E9",
                            borderRadius: "4px",
                            border: "1px solid #4CAF50",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", color: "#1B5E20" }}
                            >
                              {receipt.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#558B2F" }}
                            >
                              {receipt._file
                                ? `${receipt.size} KB`
                                : (() => {
                                    const bytes = Number(receipt.size) || 0;
                                    if (bytes < 1024) return `${bytes} B`;
                                    const kb = bytes / 1024;
                                    if (kb < 1024) return `${kb.toFixed(2)} KB`;
                                    const mb = kb / 1024;
                                    return `${mb.toFixed(2)} MB`;
                                  })()}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="text"
                            sx={{ color: "#D32F2F", minWidth: "auto" }}
                            onClick={() =>
                              handleRemoveReceipt(
                                receipt._id || receipt.id,
                                !!receipt._id
                              )
                            }
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: "#000000",
                    flex: 1,
                    ":hover": { backgroundColor: "#333333" },
                  }}
                  disabled={loading}
                >
                  {editId ? "Update Transaction" : "Add Transaction"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{
                    flex: 1,
                    color: "#ffffff",
                    backgroundColor: "#42a5f5",
                    ":hover": { backgroundColor: "#90caf9" },
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AddTransaction;
