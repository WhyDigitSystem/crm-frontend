import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    MenuItem,
    Button,
    Rating,
    Stack,
} from "@mui/material";
import FullScreenLoader from "utils/FullScreenLoader";
import apiCalls from "apicall"; // your API handler
import { showToast } from "utils/toast-component";

export default function FeedbackComplianceForm() {
    const [mode, setMode] = useState("feedback");
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // URL params
    const [prefilled, setPrefilled] = useState({
        name: "",
        mobile: "",
        // customerId: "",
        // token: "",
    });

    // FEEDBACK
    const [feedbackData, setFeedbackData] = useState({
        rating: 0,
        comments: "",
        name: "",
        mobile: "",
    });

    // COMPLIANCE
    const [complianceData, setComplianceData] = useState({
        issueType: "",
        description: "",
        // attachment: null,
        name: "",
        mobile: "",
        customerId: "",
    });

    // VALIDATION ERRORS
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        console.log("Params:", Object.fromEntries(params.entries()));
        const name = params.get("name") || "";
        const mobile = params.get("mobile") || "";
        const customerId = params.get("docId") || "";
        // const token = params.get("token") || "";

        const fillData = {
            name,
            mobile,
            customerId,
            // token,
        };

        setPrefilled(fillData);

        setFeedbackData((prev) => ({
            ...prev,
            name,
            mobile,
        }));

        setComplianceData((prev) => ({
            ...prev,
            name,
            mobile,
            customerId,
        }));
    }, []);

    const handleFeedbackChange = (e) => {
        const { name, value } = e.target;
        setFeedbackData((prev) => ({ ...prev, [name]: value }));
    };

    const handleComplianceChange = (e) => {
        const { name, value, files } = e.target;
        setComplianceData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const validateCompliance = () => {
        const err = {};
        if (!complianceData.issueType)
            err.issueType = "Please select issue type";
        // if (!complianceData.description.trim())
        //     err.description = "Description required";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // =====================================================
    // 4️⃣ SUBMIT FEEDBACK
    // =====================================================
    const handleSaveFeedBack = async () => {
        setIsLoading(true);
        const payload = {
            clientName: prefilled.name,
            mobileNumber: prefilled.mobile,
            comments: feedbackData.comments,
            rating: feedbackData.rating,
            // token: prefilled.token,
        };

        try {
            const response = await apiCalls("post", "/checkin/createRating", payload);

            if (response.status) {
                showToast("success", "Thanks for your valuable feedback!");
                setSubmitted(true);
            } else {
                showToast("error", response.message || "Failed");
            }
        } catch (error) {
            showToast("error", "Failed: " + (error.message || "Error"));
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================================
    // 5️⃣ SUBMIT COMPLIANCE
    // =====================================================
    const handleSaveComplaint = async () => {
        if (!validateCompliance()) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append("clientName", prefilled.name);
        formData.append("mobileNumber", prefilled.mobile);
        formData.append("describes", complianceData.description);
        formData.append("issueType", complianceData.issueType);
        formData.append("customerId", prefilled.customerId);
        formData.append("token", prefilled.token);
        // if (complianceData.attachment) {
        //     formData.append("attachment", complianceData.attachment);
        // }

        try {
            const response = await apiCalls(
                "post",
                "/checkin/createMarketResearchFeedback",
                formData
            );

            if (response.status) {
                showToast("success", "Your complaint has been submitted!");
                setSubmitted(true);
            } else {
                showToast("error", response.message || "Failed");
            }
        } catch (error) {
            showToast("error", "Failed: " + (error.message || "Error"));
        } finally {
            setIsLoading(false);
        }
    };

    // =====================================================
    // 6️⃣ THANK YOU SCREEN
    // =====================================================
    if (submitted) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3 }}>
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
                    <Typography variant="h4" fontWeight={700} color="green">
                        ✔ Thank You!
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        We have received your response.
                    </Typography>
                </Card>
            </Box>
        );
    }

    return (
        <>
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: "45%",
                        left: "45%",
                        zIndex: 9999,
                    }}
                >
                    <FullScreenLoader />
                </div>
            )}

            <Box
                sx={{
                    maxWidth: 600,
                    mx: "auto",
                    p: 2,
                    mt: 3,
                    animation: "fadeIn 0.6s ease-in-out",
                }}
            >
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(240,240,240,0.8) 100%)",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        {/* Gradient Header */}
                        <Box
                            sx={{
                                background:
                                    "linear-gradient(90deg, #0d6efd, #6610f2)",
                                borderRadius: 3,
                                p: 2.5,
                                mb: 3,
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                }}
                            >
                                We Value Your Feedback
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                sx={{ color: "rgba(255,255,255,0.85)", mt: 0.5 }}
                            >
                                Help us improve your experience
                            </Typography>
                        </Box>

                        {/* Toggle Buttons */}
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            fullWidth
                            onChange={(e, val) => val && setMode(val)}
                            sx={{
                                mb: 3,
                                background: "#f1f3f5",
                                borderRadius: 3,
                                p: 0.5,
                                "& .MuiToggleButton-root": {
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontSize: 15,
                                    fontWeight: 600,
                                },
                                "& .Mui-selected": {
                                    background:
                                        "linear-gradient(90deg, #0d6efd, #6610f2)",
                                    color: "white !important",
                                },
                            }}
                        >
                            <ToggleButton value="feedback">⭐ Suggestion</ToggleButton>
                            <ToggleButton value="compliance">⚠ Complaint</ToggleButton>
                        </ToggleButtonGroup>

                        {/* FEEDBACK */}
                        {mode === "feedback" && (
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 600,
                                        color: "#333",
                                        mb: 0.5,
                                    }}
                                >
                                    ⭐ Rate Your Experience
                                </Typography>

                                <Rating
                                    name="rating"
                                    value={feedbackData.rating}
                                    onChange={(e, val) =>
                                        setFeedbackData((p) => ({ ...p, rating: val }))
                                    }
                                    sx={{
                                        fontSize: 48,
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                                    }}
                                />

                                <TextField
                                    label="Write your feedback"
                                    name="comments"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder="Tell us what you liked or what can be improved..."
                                    value={feedbackData.comments}
                                    onChange={handleFeedbackChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={handleSaveFeedBack}
                                    fullWidth
                                    sx={{
                                        py: 1.6,
                                        mt: 1,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        background:
                                            "linear-gradient(90deg, #0d6efd, #6610f2)",
                                        boxShadow: "0px 5px 15px rgba(13, 110, 253, 0.35)",
                                    }}
                                >
                                    Submit Feedback
                                </Button>
                            </Stack>
                        )}

                        {/* COMPLIANCE */}
                        {mode === "compliance" && (
                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <TextField
                                    label="Select Issue Type"
                                    name="issueType"
                                    select
                                    fullWidth
                                    value={complianceData.issueType}
                                    onChange={handleComplianceChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                >
                                    <MenuItem value="delivery">🚚 Delivery Issue</MenuItem>
                                    <MenuItem value="billing">🧾 Billing Issue</MenuItem>
                                    <MenuItem value="damage">📦 Damaged Product</MenuItem>
                                    <MenuItem value="behavior">👨‍💼 Staff Behaviour</MenuItem>
                                    <MenuItem value="other">❓ Other</MenuItem>
                                </TextField>

                                <TextField
                                    label="Describe the issue"
                                    name="description"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder="Explain the issue clearly..."
                                    value={complianceData.description}
                                    onChange={handleComplianceChange}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />

                                {/* <Button
                                    component="label"
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        py: 1.4,
                                        borderRadius: 3,
                                        fontWeight: 600,
                                        borderColor: "#6610f2",
                                        color: "#6610f2",
                                    }}
                                >
                                    Upload Attachment (Optional)
                                    <input
                                        type="file"
                                        name="attachment"
                                        hidden
                                        onChange={handleComplianceChange}
                                    />
                                </Button> */}

                                <Button
                                    variant="contained"
                                    onClick={handleSaveComplaint}
                                    fullWidth
                                    sx={{
                                        py: 1.6,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        borderRadius: 3,
                                        background:
                                            "linear-gradient(90deg, #ff5b5b, #ff1e1e)",
                                        boxShadow: "0px 5px 15px rgba(255, 69, 58, 0.35)",
                                    }}
                                >
                                    Submit Complaint
                                </Button>
                            </Stack>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}
