import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link,
    Button, Modal, Fade, TextField
} from "@mui/material";
import InventoryList from "./InventoryList";
import AddInventory from "./AddInventory";
import SaleProduct from "./SaleProduct"; // Add this import

const MasterProductList = () => {
    const [masterData, setMasterData] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openAddProductModal, setOpenAddProductModal] = useState(false);
    const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
    const [openSaleModal, setOpenSaleModal] = useState(false); // Add this state
    const [addProductName, setAddProductName] = useState("");
    const [message, setMessage] = useState("");

    const fetchAndGroup = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/inventory");
            const inventory = response.data;

            // Group by productName and sum yards and pieces
            const grouped = {};
            inventory.forEach(item => {
                const name = item.product.productName;
                if (!grouped[name]) {
                    grouped[name] = {
                        id: item.product.id,
                        productName: name,
                        totalYards: 0,
                        totalPieces: 0
                    };
                }
                grouped[name].totalYards += Number(item.yardAvailable) || 0;
                grouped[name].totalPieces += Number(item.pieceAvailable) || 0;
            });

            setMasterData(Object.values(grouped));
        } catch (error) {
            console.error("Error fetching master product data:", error);
        }
    };

    useEffect(() => {
        fetchAndGroup();
    }, []);

    // Handler for adding a product
    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        if (!addProductName) {
            alert("All fields are required!");
            return;
        }
        try {
            await axios.post("http://localhost:8080/api/inventory/addProduct", {
                addProductName
            });
            setAddProductName("");
            setOpenAddProductModal(false);
            setMessage("Master item added successfully! ✅");
            // Call your fetchProducts or equivalent here to refresh the list
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error adding Product:", error);
            alert("Failed to add Product!");
            setOpenAddProductModal(false);
        }
    };

    // If a product is selected, show InventoryList filtered by that product
    if (selectedProduct) {
        return (
            <InventoryList
                initialProduct={selectedProduct}
                onBack={() => setSelectedProduct(null)}
                onInventoryChange={fetchAndGroup} // <-- Add this prop
            />
        );
    }

    return (
        <Box mt={5} display="flex" justifyContent="center">
            <Box sx={{ width: "100%", maxWidth: 900 }}>
                <Typography
                    variant="h5"
                    align="center"
                    sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
                >
                    Master Product Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Button variant="contained" color="primary" onClick={() => setOpenAddProductModal(true)}>
                        Add Item
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenAddInventoryModal(true)}
                    >
                        Add Inventory
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setOpenSaleModal(true)}
                    >
                        Sale
                    </Button>
                </Box>
                <TableContainer
                    component={Paper}
                    elevation={4}
                    sx={{
                        borderRadius: 3,
                        boxShadow: 3,
                        overflowX: "auto",
                        mt: 2
                    }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Quantity Available</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Pieces Available</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {masterData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>
                                        <Link
                                            href="#"
                                            underline="hover"
                                            onClick={e => {
                                                e.preventDefault();
                                                setSelectedProduct(row.productName);
                                            }}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            {row.productName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{row.totalYards}</TableCell>
                                    <TableCell>{row.totalPieces}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Modal
                    open={openAddProductModal}
                    onClose={() => setOpenAddProductModal(false)}
                    closeAfterTransition
                    disableEnforceFocus
                    disableAutoFocus
                >
                    <Fade in={openAddProductModal}>
                        <Box sx={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            width: 900, bgcolor: "white", p: 4, borderRadius: 2
                        }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Add Product</Typography>
                            <TextField
                                fullWidth label="Product Name" type="Text"
                                value={addProductName}
                                onChange={(e) => setAddProductName(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                                <Button onClick={() => setOpenAddProductModal(false)}>Cancel</Button>
                                <Button onClick={handleAddProductSubmit} variant="contained" sx={{ ml: 2 }}>Submit</Button>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>

                <Modal
                    open={openAddInventoryModal}
                    onClose={() => setOpenAddInventoryModal(false)}
                    closeAfterTransition
                >
                    <Fade in={openAddInventoryModal}>
                        <Box sx={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            width: 400, bgcolor: "white", p: 4, borderRadius: 2
                        }}>
                            <AddInventory
                                masterData={masterData}
                                onItemAdded={() => {
                                    setOpenAddInventoryModal(false);
                                    setMessage("Inventory added successfully! ✅");
                                    fetchAndGroup();
                                    setTimeout(() => setMessage(""), 3000);
                                }}
                            />
                        </Box>
                    </Fade>
                </Modal>

                <Modal
                    open={openSaleModal}
                    onClose={() => setOpenSaleModal(false)}
                    closeAfterTransition
                >
                    <Fade in={openSaleModal}>
                        <Box sx={{
                            position: "absolute",
                            top: "45%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 900, // <-- Make popup wider
                            bgcolor: "white",
                            p: 4,
                            borderRadius: 2
                        }}>
                            <SaleProduct
                                masterData={masterData}
                                onClose={() => setOpenSaleModal(false)}
                                onSaleSuccess={fetchAndGroup} // <-- pass this prop
                            />
                        </Box>
                    </Fade>
                </Modal>

                {message && (
                    <Typography variant="body2" color="green" align="center" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default MasterProductList;