import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Pagination,
    Stack,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
} from "@mui/material";
import {
    Inventory2,
    CheckCircleOutline as CheckCircleIcon,
    CancelOutlined as CancelIcon,
    AccessTimeOutlined as PendingIcon,
} from "@mui/icons-material";
import apiCalls from "apicall";
import { showToast } from "utils/toast-component";
import dayjs from "dayjs";

const ExpenseApproval = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const orgId = localStorage.getItem("orgId");
    const finYear = localStorage.getItem("finYear");
    const loginUserName = localStorage.getItem("userName");
    const branchCode = localStorage.getItem("branchcode");
    const employeeCode = localStorage.getItem("employeeCode");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAssets = expenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(expenses.length / itemsPerPage);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "error";
            case "PENDING":
                return "warning";
            default:
                return "info";
        }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await apiCalls(
                "get",
                `/expensedetails/getApproveDetails?branchCode=${branchCode}&employeeCode=${loginUserName}&finYear=${finYear}&orgId=${orgId}`
            );
            if (response.status && response.paramObjectsMap?.expenseDetails) {
                setExpenses(response.paramObjectsMap.expenseDetails);
            } else {
                showToast("info", "No pending approvals found.");
            }
        } catch (err) {
            console.error("Error fetching approvals:", err);
            showToast("error", "Failed to load approvals.");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveReject = async (request, action, approvedAmount) => {
        setLoading(true);
        try {
            const result = await apiCalls(
                "put",
                `/expensedetails/approveExpenseDetails?action=${action}&actionBy=${employeeCode}&docId=${request.docId}&id=${request.expenseDetailsId}&orgId=${orgId}&approvedAmount=${approvedAmount}`
            );

            if (result.status === true) {
                showToast(
                    "success",
                    `Expense ${action === "APPROVED" ? "approved" : "rejected"} successfully`
                );
                fetchExpenses();
            } else {
                console.error("API Error:", result);
                showToast("error", "Action failed.");
            }
        } catch (error) {
            console.error("Error approving expense:", error);
            showToast("error", "Failed to update approval.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (asset) => {
        setSelectedExpense(asset);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedExpense(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
                Expense Approval Panel
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                }}
            >
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f6fa" }}>
                                {[
                                    "Type",
                                    "Payment Mode",
                                    "Employee",
                                    "Exp Limit",
                                    "Amount",
                                    "Submitted",
                                    "Status",
                                    "Actions",
                                ].map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            fontWeight: 600,
                                            color: "#34449B",
                                            py: 1.2,
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {currentAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                        <Inventory2 sx={{ fontSize: 48, color: "grey.400" }} />
                                        <Typography variant="body1" color="text.secondary">
                                            No approval requests found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentAssets.map((asset) => {
                                    const isExceeding =
                                        Number(asset.totalAmount) > Number(asset.expenseLimit);
                                    const statusColor = getStatusColor(asset.approveStatus);

                                    return (
                                        <TableRow
                                            key={asset.id}
                                            sx={{
                                                transition: "all 0.2s ease",
                                                "&:hover": {
                                                    backgroundColor: "#fafafa",
                                                },
                                            }}
                                        >
                                            <TableCell>{asset.expenseType || "-"}</TableCell>
                                            <TableCell>{asset.paymentMode || "-"}</TableCell>
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {`${asset.employeeName} - ${asset.employeeCode}`}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                ₹{(asset.expenseLimit || 0).toLocaleString('en-IN')}
                                            </TableCell>

                                            <TableCell
                                                sx={{
                                                    fontWeight: 600,
                                                    color: isExceeding ? 'error.main' : 'text.primary',
                                                }}
                                            >
                                                ₹{(asset.totalAmount || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                {dayjs(asset.docDate).isValid()
                                                    ? dayjs(asset.docDate).format("DD-MM-YYYY")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={asset.approveStatus || "Unknown"}
                                                    color={statusColor}
                                                    icon={
                                                        statusColor === "success" ? (
                                                            <CheckCircleIcon />
                                                        ) : statusColor === "error" ? (
                                                            <CancelIcon />
                                                        ) : (
                                                            <PendingIcon />
                                                        )
                                                    }
                                                    sx={{
                                                        fontWeight: 600,
                                                        borderRadius: "8px",
                                                        fontSize: "0.75rem",
                                                        textTransform: "capitalize",
                                                        px: 1,
                                                    }}
                                                    size="small"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        disabled={asset.approveStatus?.toUpperCase() !== "PENDING"}
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => handleOpenDialog(asset)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontSize: "0.75rem",
                                                            px: 1.5,
                                                            "&:hover": {
                                                                boxShadow: 4,
                                                            },
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        disabled={asset.approveStatus?.toUpperCase() !== "PENDING"}
                                                        startIcon={<CancelIcon />}
                                                        onClick={() =>
                                                            handleApproveReject(asset, "REJECTED", 0)
                                                        }
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontSize: "0.75rem",
                                                            px: 1.5,
                                                            "&:hover": {
                                                                boxShadow: 3,
                                                                backgroundColor: "#ffebee",
                                                            },
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {expenses.length > itemsPerPage && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(e, val) => setCurrentPage(val)}
                        color="primary"
                        size="medium"
                    />
                </Box>
            )}

            {/* Approval Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, color: "#34449B" }}>
                    Confirm Approval
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ mt: 2 }}>
                    {selectedExpense && (
                        <>
                            <Typography variant="body2" sx={{ mb: 1.5 }}>
                                Employee: <b>{selectedExpense.employeeName}</b>
                                <br />
                                Claim Amount: <b>₹{selectedExpense.totalAmount}</b>
                                <br />
                                Expense Limit: <b>₹{selectedExpense.expenseLimit}</b>
                            </Typography>

                            {Number(selectedExpense.totalAmount) >
                                Number(selectedExpense.expenseLimit) ? (
                                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                    ⚠️ This claim exceeds the allocated limit. Choose your action carefully.
                                </Typography>
                            ) : (
                                <Typography variant="body2">
                                    Are you sure you want to approve this expense?
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    {selectedExpense?.totalAmount > selectedExpense?.expenseLimit && (
                        <Button
                            onClick={() => {
                                handleApproveReject(selectedExpense, "APPROVED", selectedExpense.expenseLimit);
                                handleCloseDialog();
                            }}
                            color="warning"
                            variant="contained"
                        >
                            Approve Within Limit
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            handleApproveReject(selectedExpense, "APPROVED", selectedExpense.totalAmount);
                            handleCloseDialog();
                        }}
                        color="success"
                        variant="contained"
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExpenseApproval;
