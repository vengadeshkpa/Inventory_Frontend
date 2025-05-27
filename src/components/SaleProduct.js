import React, { useState } from "react";
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
            category: "",
            quantities: [""]
        }
    ]);
    const [productColors, setProductColors] = useState({});
    const [productCategories, setProductCategories] = useState({}); // Add this with your other useState
    const [reviewMode, setReviewMode] = useState(false);
    const [success, setSuccess] = useState(false);

    // Helper to get product object by id
    const getProductById = (id) => masterData.find(p => String(p.id) === String(id));
    const getCategories = (product) => product?.categories || ["A", "B", "C"];

    const handleProductChange = async (idx, field, value) => {
        const updated = [...products];
        updated[idx][field] = value;
        // Reset dependent fields if product changes
        if (field === "productId") {
            updated[idx].color = "";
            updated[idx].category = "";

            // Fetch colors for the selected product from backend
            try {
                const response = await axios.get(`http://localhost:8080/api/inventory/colors/${value}`);
                setProductColors(prev => ({
                    ...prev,
                    [value]: response.data // assuming response.data is an array of colors
                }));
            } catch (error) {
                setProductColors(prev => ({
                    ...prev,
                    [value]: []
                }));
            }
            setProductCategories(prev => ({
                ...prev,
                [value]: {} // reset categories for this product
            }));
        }
        if (field === "color") {
            updated[idx].category = "";
            // Fetch categories for the selected product and color from backend
            try {
                const response = await axios.get(`http://localhost:8080/api/inventory/categories/${updated[idx].productId}/${value}`);
                setProductCategories(prev => ({
                    ...prev,
                    [updated[idx].productId]: {
                        ...(prev[updated[idx].productId] || {}),
                        [value]: response.data // assuming response.data is an array of categories
                    }
                }));
            } catch (error) {
                setProductCategories(prev => ({
                    ...prev,
                    [updated[idx].productId]: {
                        ...(prev[updated[idx].productId] || {}),
                        [value]: []
                    }
                }));
            }
        }
        setProducts(updated);
    };

    const handleQuantityChange = (prodIdx, qtyIdx, value) => {
        const updated = [...products];
        updated[prodIdx].quantities[qtyIdx] = value;
        setProducts(updated);
    };

    const handleAddQuantity = (prodIdx) => {
        const updated = [...products];
        updated[prodIdx].quantities.push("");
        setProducts(updated);
    };

    const handleRemoveQuantity = (prodIdx, qtyIdx) => {
        const updated = [...products];
        updated[prodIdx].quantities.splice(qtyIdx, 1);
        setProducts(updated);
    };

    const handleAddProduct = () => {
        setProducts([
            ...products,
            { productId: "", color: "", category: "", quantities: [""] }
        ]);
    };

    const handleRemoveProduct = (idx) => {
        const updated = [...products];
        updated.splice(idx, 1);
        setProducts(updated);
    };

    // Show review page on first submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setReviewMode(true);
    };

    // Final submit (API call can go here)
    const handleFinalSubmit = async () => {
        try {
            for (const prod of products) {
                const productId = prod.productId;
                const saleQuantities = prod.quantities.filter(q => q !== "").map(Number);
                const saleYards = saleQuantities.reduce((sum, q) => sum + q, 0);
                const salePieces = saleQuantities.length;

                await axios.put(`http://localhost:8080/api/inventory/sale`, {
                    productId,
                    color: prod.color,
                    category: prod.category,
                    saleYards,
                    salePieces
                });
            }
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
        return (
            <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                    Sale Review
                </Typography>
                {products.map((prod, idx) => {
                    const productObj = getProductById(prod.productId);
                    const filteredQuantities = prod.quantities.filter(q => q !== "");
                    const total = filteredQuantities.map(Number).reduce((sum, q) => sum + q, 0);
                    return (
                        <Paper key={idx} sx={{ mb: 2, p: 2, borderLeft: "5px solid #1976d2", bgcolor: "#f5fafd" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                Product: {productObj ? productObj.productName : ""}
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Color: <b>{prod.color}</b>
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                Category: <b>{prod.category}</b>
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
                                <Select
                                    fullWidth
                                    value={prod.category}
                                    onChange={e => handleProductChange(idx, "category", e.target.value)}
                                    displayEmpty
                                    required
                                    sx={{ minWidth: 120 }}
                                    disabled={!prod.productId || !prod.color}
                                >
                                    <MenuItem value="" disabled>Select Category</MenuItem>
                                    {(productCategories[prod.productId]?.[prod.color] || []).map((cat, i) => (
                                        <MenuItem key={i} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                                {products.length > 1 && (
                                    <IconButton onClick={() => handleRemoveProduct(idx)} color="error">
                                        <RemoveIcon />
                                    </IconButton>
                                )}
                            </Box>
                            <Box mt={2}>
                                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    {prod.quantities.map((qty, qIdx) => (
                                        <Box key={qIdx} display="flex" alignItems="center" gap={1} mb={1}>
                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                value={qty}
                                                onChange={e => handleQuantityChange(idx, qIdx, e.target.value)}
                                                required
                                                inputProps={{ min: 0, step: "any" }}
                                                sx={{ width: 120 }}
                                            />
                                            {prod.quantities.length > 1 && (
                                                <IconButton onClick={() => handleRemoveQuantity(idx, qIdx)} color="error">
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddQuantity(idx)}
                                    sx={{ mt: 1 }}
                                >
                                    Add more
                                </Button>
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