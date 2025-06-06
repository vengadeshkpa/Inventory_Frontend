import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Button, Typography, MenuItem, Select, TextField, IconButton, Paper, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const SaleProduct = ({ masterData, onClose, onSaleSuccess }) => {
    const [products, setProducts] = useState([
        {
            productId: "",
            color: "",
            pieces: 1,
            quantities: [""],
            unitPrice: ""
        }
    ]);
    const [productColors, setProductColors] = useState({});
    const [reviewMode, setReviewMode] = useState(false);
    const [success, setSuccess] = useState(false);

    // New state for invoice number and customers
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");

    // Fetch customers on mount
    useEffect(() => {
        axios.get("http://localhost:8080/api/customers")
            .then(res => setCustomers(res.data || []))
            .catch(() => setCustomers([]));
    }, []);

    // Helper to get product object by id
    const getProductById = (id) => masterData.find(p => String(p.id) === String(id));

    const handleProductChange = async (idx, field, value) => {
        const updated = [...products];
        updated[idx][field] = value;
        if (field === "productId") {
            updated[idx].color = "";
            // Fetch colors for the selected product from backend
            try {
                const response = await axios.get(`http://localhost:8080/api/inventory/colors/${value}`);
                setProductColors(prev => ({
                    ...prev,
                    [value]: response.data
                }));
            } catch (error) {
                setProductColors(prev => ({
                    ...prev,
                    [value]: []
                }));
            }
        }
        setProducts(updated);
    };

    // Handle change in number of pieces
    const handlePiecesChange = (idx, value) => {
        let pieces = parseInt(value, 10);
        if (isNaN(pieces) || pieces < 1) pieces = 1;
        const updated = [...products];
        updated[idx].pieces = pieces;
        // Adjust quantities array length
        if (updated[idx].quantities.length < pieces) {
            updated[idx].quantities = [
                ...updated[idx].quantities,
                ...Array(pieces - updated[idx].quantities.length).fill("")
            ];
        } else if (updated[idx].quantities.length > pieces) {
            updated[idx].quantities = updated[idx].quantities.slice(0, pieces);
        }
        setProducts(updated);
    };

    const handleQuantityChange = (prodIdx, qtyIdx, value) => {
        const updated = [...products];
        updated[prodIdx].quantities[qtyIdx] = value;
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([
            ...products,
            { productId: "", color: "", pieces: 1, quantities: [""], unitPrice: "" }
        ]);
    };

    const handleRemoveProduct = (idx) => {
        const updated = [...products];
        updated.splice(idx, 1);
        setProducts(updated);
    };

    // Handle unit price change
    const handleUnitPriceChange = (idx, value) => {
        const updated = [...products];
        updated[idx].unitPrice = value;
        setProducts(updated);
    };

    // Show review page on first submit
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate all quantities are filled
        for (const prod of products) {
            if (prod.quantities.some(q => q === "" || q === null || q === undefined)) {
                alert("Please fill all quantity fields.");
                return;
            }
        }
        if (!invoiceNumber) {
            alert("Please enter invoice number.");
            return;
        }
        if (!selectedCustomer) {
            alert("Please select a customer.");
            return;
        }
        setReviewMode(true);
    };

    // Final submit (API call can go here)
    const handleFinalSubmit = async () => {
        try {
            // 1. Existing sale API calls (keep as is)
            for (const prod of products) {
                const productId = prod.productId;
                const saleQuantities = prod.quantities.filter(q => q !== "").map(Number);
                const saleYards = saleQuantities.reduce((sum, q) => sum + q, 0);
                const salePieces = saleQuantities.length;

                await axios.put(`http://localhost:8080/api/inventory/sale`, {
                    productId,
                    color: prod.color,
                    saleYards,
                    salePieces,
                    invoiceNumber,
                });
            }

            // 2. Additional step: Save invoice header and entries
            const customerObj = customers.find(c => String(c.id) === String(selectedCustomer));
            const grandTotal = products.reduce((sum, prod) => {
                const filteredQuantities = prod.quantities.filter(q => q !== "");
                const total = filteredQuantities.map(Number).reduce((s, q) => s + q, 0);
                const totalPrice = prod.unitPrice && total ? parseFloat(prod.unitPrice) * total : 0;
                return sum + totalPrice;
            }, 0);

            const invoiceHeader = {
                invoiceNumber,
                customerId: customerObj ? Number(customerObj.id) : null,
                customerName: customerObj ? customerObj.name : "",
                totalPrice: grandTotal,
            };

            console.log("Invoice Header:", invoiceHeader);
            //console.log("Products for Invoice:", products);

            const invoiceEntries = products.map(prod => {
                const filteredQuantities = prod.quantities.filter(q => q !== "");
                const totalQuantity = filteredQuantities.map(Number).reduce((sum, q) => sum + q, 0);
                const totalProductPrice = prod.unitPrice && totalQuantity ? parseFloat(prod.unitPrice) * totalQuantity : 0;
                return {
                    color: prod.color,
                    productName: masterData.find(p => String(p.id) === String(prod.productId))?.productName || "",
                    pieceAvailable: filteredQuantities.length,
                    quantity: totalQuantity,
                    totalProductPrice,
                    unitPrice: prod.unitPrice,
                };
            });

            console.log("Invoice Entries:", invoiceEntries);

            await axios.post("http://localhost:8080/api/invoices", {
                invoiceHeader,
                invoiceEntries,
            });

            setSuccess(true);
            if (onSaleSuccess) {
                await onSaleSuccess(); // Refresh master data in parent
            }
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            alert("Sale failed. Please try again.");
        }
    };

    // Back to edit mode
    const handleBack = () => setReviewMode(false);

    if (success) {
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: "bold", mb: 2 }}>
                    Sale successfully processed
                </Typography>
            </Box>
        );
    }

    if (reviewMode) {
        // Find the selected customer object
        const customerObj = customers.find(c => String(c.id) === String(selectedCustomer));
        // Calculate total price for all products (keep as number)
        const grandTotal = products.reduce((sum, prod) => {
            const filteredQuantities = prod.quantities.filter(q => q !== "");
            const total = filteredQuantities.map(Number).reduce((s, q) => s + q, 0);
            const totalPrice = prod.unitPrice && total ? parseFloat(prod.unitPrice) * total : 0;
            return sum + totalPrice;
        }, 0);

        return (
            <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 2 }}>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold", flex: 1 }}>
                        Sale Review
                    </Typography>
                    <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
                        <span style={{ fontWeight: "normal", fontSize: 16 }}>
                            | Invoice: <b>{invoiceNumber}</b>
                            {customerObj && (
                                <>
                                    {" | Customer: "}
                                    <b>{customerObj.name}</b>
                                </>
                            )}
                            {" | Total Price: "}
                            <b>{grandTotal.toFixed(2)}</b>
                        </span>
                    </Box>
                </Box>
                {products.map((prod, idx) => {
                    const productObj = getProductById(prod.productId);
                    const filteredQuantities = prod.quantities.filter(q => q !== "");
                    const total = filteredQuantities.map(Number).reduce((sum, q) => sum + q, 0);
                    const totalPrice = prod.unitPrice && total ? (parseFloat(prod.unitPrice) * total).toFixed(2) : "";
                    return (
                        <Paper key={idx} sx={{ mb: 2, p: 2, borderLeft: "5px solid #1976d2", bgcolor: "#f5fafd" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                Product: {productObj ? productObj.productName : ""}
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Color: <b>{prod.color}</b>
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Unit Price: <b>{prod.unitPrice}</b>
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Quantities: {
                                    filteredQuantities.length === 1
                                        ? <b>{filteredQuantities[0]}</b>
                                        : (
                                            <>
                                                {filteredQuantities.map((q, i) => (
                                                    <span key={i}>
                                                        <b>{q}</b>
                                                        {i < filteredQuantities.length - 1 ? " + " : ""}
                                                    </span>
                                                ))}
                                                {" = "}
                                                <b>{total}</b>
                                            </>
                                        )
                                }
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Pieces: <b>{filteredQuantities.length}</b>
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Total Price: <b>{totalPrice}</b>
                            </Typography>
                        </Paper>
                    );
                })}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" onClick={handleBack}>Back</Button>
                    <Button variant="contained" color="primary" onClick={handleFinalSubmit}>Submit</Button>
                </Box>
            </Box>
        );
    }

    // Normal entry form
    return (
        <form onSubmit={handleSubmit}>
            <Box
                sx={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    pr: 2,
                }}
            >
                <Typography variant="h6" sx={{ mb: 2 }}>Sale Product</Typography>
                {/* Invoice number and customer dropdown */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <TextField
                        label="Invoice Number"
                        value={invoiceNumber}
                        onChange={e => setInvoiceNumber(e.target.value)}
                        required
                        sx={{ width: 200 }}
                    />
                    <Select
                        value={selectedCustomer}
                        onChange={e => {
                            console.log("Selected customer:", e.target.value+"--"+selectedCustomer);
                            setSelectedCustomer(String(e.target.value));
                        }}
                        displayEmpty
                        required
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="" disabled>Select Customer</MenuItem>
                        {customers.map((cust) => (
                            <MenuItem key={cust.customerId} value={String(cust.customerId)}>
                                {cust.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
                {products.map((prod, idx) => {
                    const productObj = getProductById(prod.productId);
                    return (
                        <Box key={idx} sx={{ mb: 3, border: "1px solid #eee", p: 2, borderRadius: 1 }}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Select
                                    fullWidth
                                    value={prod.productId}
                                    onChange={e => handleProductChange(idx, "productId", e.target.value)}
                                    displayEmpty
                                    required
                                    sx={{ minWidth: 180 }}
                                >
                                    <MenuItem value="" disabled>Select Master Product</MenuItem>
                                    {masterData.map((p) => (
                                        <MenuItem key={p.id} value={p.id}>{p.productName}</MenuItem>
                                    ))}
                                </Select>
                                <Select
                                    fullWidth
                                    value={prod.color}
                                    onChange={e => handleProductChange(idx, "color", e.target.value)}
                                    displayEmpty
                                    required
                                    sx={{ minWidth: 120 }}
                                    disabled={!prod.productId}
                                >
                                    <MenuItem value="" disabled>Select Color</MenuItem>
                                    {(productColors[prod.productId] || []).map((color, i) => (
                                        <MenuItem key={i} value={color}>{color}</MenuItem>
                                    ))}
                                </Select>
                                {products.length > 1 && (
                                    <IconButton onClick={() => handleRemoveProduct(idx)} color="error">
                                        <RemoveIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <Box mt={2} display="flex" alignItems="center" gap={2}>
                                <TextField
                                    label="Number of Pieces"
                                    type="number"
                                    value={prod.pieces}
                                    onChange={e => handlePiecesChange(idx, e.target.value)}
                                    required
                                    inputProps={{ min: 1 }}
                                    sx={{ width: 160 }}
                                />
                                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    {Array.from({ length: prod.pieces }).map((_, qIdx) => (
                                        <TextField
                                            key={qIdx}
                                            label={`Quantity ${qIdx + 1}`}
                                            type="number"
                                            value={prod.quantities[qIdx] || ""}
                                            onChange={e => handleQuantityChange(idx, qIdx, e.target.value)}
                                            required
                                            inputProps={{ min: 0, step: "any" }}
                                            sx={{ width: 120 }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                            <Box mt={2} display="flex" alignItems="center">
                                <TextField
                                    label="Unit Price"
                                    type="number"
                                    value={prod.unitPrice}
                                    onChange={e => handleUnitPriceChange(idx, e.target.value)}
                                    required
                                    inputProps={{ min: 0, step: "any" }}
                                    sx={{ width: 160 }}
                                />
                            </Box>
                        </Box>
                    );
                })}
                <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddProduct}
                    >
                        Add product
                    </Button>
                </Box>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">Submit</Button>
                </Box>
            </Box>
        </form>
    );
};

export default SaleProduct;