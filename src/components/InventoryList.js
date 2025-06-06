import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrash,FaEdit } from "react-icons/fa";
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Alert, Box, Fade, Button, Modal, TextField
} from "@mui/material";
import AddInventory from "./AddInventory";
import EditInventory from "./EditInventory";
import DeleteInventory from "./DeleteInventory";
import * as XLSX from "xlsx";

const InventoryList = ({ initialProduct = "", onBack, onInventoryChange }) => {
    const [items, setItems] = useState([]); // Full inventory list
    const [uniqueProducts, setUniqueProducts] = useState([]); // Unique products extracted from inventory
    const [uniqueMasterProducts, setUniqueMasterProducts] = useState([]); // Unique products extracted from master products
    const [selectedProduct, setSelectedProduct] = useState(initialProduct); // Selected product filter
    const [message, setMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [openAddProductModal, setOpenAddProductModal] = useState(false);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [operationType, setOperationType] = useState("");
    const [editYards, setEditYards] = useState("");
    const [editPieces, setEditPieces] = useState("");
    const [addProductName, setAddProductName] = useState("");
    //const [editProductName, setProductName] = useState("");
    //const [editColor, setColor] = useState("");
    //const [editCategory, setCategory] = useState("");


    // Fetch inventory and extract unique product names
    const fetchInventory = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/inventory");
            const inventoryData = response.data;

            // Extract unique product names
            const productsSet = new Set(inventoryData.map((item) => item.product.productName));
            setUniqueProducts([...productsSet]); // Convert Set to Array

            setItems(inventoryData);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/inventory/master-products");
            const inventoryData = response.data;

            // Extract unique product names
            const masterProductsSet = new Set(inventoryData.map((item) => item.productName));
            setUniqueMasterProducts([...masterProductsSet]); // Convert Set to Array

        } catch (error) {
            console.error("Error fetching master products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchInventory();
    }, []);

    // Set selectedProduct if initialProduct changes (for navigation)
    useEffect(() => {
        if (initialProduct) setSelectedProduct(initialProduct);
    }, [initialProduct]);

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            items.map(({ 
                id, 
                product, 
                color, 
                category, 
                yardAvailable, 
                pieceAvailable, 
                loadedYards, 
                loadedPieces, 
                procurementYards, 
                procurementPieces, 
                saleYards, 
                salePieces, 
                yardsOnHold, 
                piecesOnHold 
            }) => ({
                ID: id,
                "Product Name": product.productName,
                Color: color,
                Category: category,
                "Quantity Available": yardAvailable,
                "Piece Available": pieceAvailable,
                "Loaded Yards": loadedYards,
                "Loaded Pieces": loadedPieces,
                "Procurement Quantity": procurementYards,
                "Procurement Pieces": procurementPieces,
                "Sale Quantity": saleYards,
                "Sale Pieces": salePieces,
                "Yards On Hold": yardsOnHold,
                "Pieces On Hold": piecesOnHold,
            }))
        );
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
        XLSX.writeFile(workbook, "inventory.xlsx");
    };        

    const handleEditClick = (item) => {
        console.log("Edit button clicked for:", item);
        setSelectedItem(item);
        setOperationType(item.operationType || "");
        setEditYards(item.yards || "");
        setEditPieces(item.pieces || "");
        setEditModalOpen(true);
    };

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
            await fetchProducts(); // Await to ensure state updates
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error adding Product:", error);
            alert("Failed to add Product!");
            setOpenAddProductModal(false);
        }
    }

    const handleOperationSubmit = async () => {
        if (!selectedItem) return;

        // const updatedItem = {
        //     ...selectedItem,
        //     operationType,
        //     yards: editYards,
        //     pieces: editPieces,
        // };

        try {
            var id = selectedItem?.id;
            var category = selectedItem?.category;
            var color = selectedItem?.color;
            var pName = selectedItem?.product?.productName;

            await axios.put(`http://localhost:8080/api/inventory/updatecond/${id}/${operationType}`, {
                productName: pName,
                color: color,
                category: category,
                yardAvailable: editYards,
                pieceAvailable: editPieces
            });
            setMessage("Item Edited successfully! ✅");
            setEditModalOpen(false);
            setSelectedItem(null);
            await fetchInventory(); // Await to ensure UI updates
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error Editing item:", error);
            setMessage("Failed to Edit item!");
            setEditModalOpen(false);
            setSelectedItem(null);
            setTimeout(() => setMessage(""), 3000);
        }
    };
    

    // Open delete confirmation modal
    const confirmDelete = (id) => {
        setSelectedDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    // Delete item after confirmation
    const handleDelete = async () => {
        setDeletingId(selectedDeleteId);
        setDeleteConfirmOpen(false);

        setTimeout(async () => {
            try {
                await axios.delete(`http://localhost:8080/api/inventory/${selectedDeleteId}`);
                setMessage("Item deleted successfully! ✅");
                setDeletingId(null);
                await fetchInventory(); // Await to ensure UI updates
                setTimeout(() => setMessage(""), 3000);
            } catch (error) {
                console.error("Error deleting item:", error);
                setMessage("Failed to delete item! ❌");
                setDeletingId(null);
            }
        }, 500);
    };

    return (
        <Container maxWidth="lx" sx={{ bgcolor: "#f4f6f8", p: 3, borderRadius: 2 }}>
            {/* Back Button if navigated from MasterProductList */}
            <Box display="flex" justifyContent="flex-end">
                {onBack && (
                    <Button variant="outlined" sx={{ mb: 2 }} onClick={onBack}>
                        &larr; Back to Master Product List
                    </Button>
                )}
            </Box>

            {/* Title & Dropdown Filter */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                
                {/* Dropdown for filtering inventory by product */}
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    style={{ padding: "8px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="">All Products</option>
                    {uniqueMasterProducts.map((product, index) => (
                        <option key={index} value={product}>
                            {product}
                        </option>
                    ))}
                </select>
            </Box>

            <Box mt={3}>
                <Typography
                    variant="h5"
                    align="center"
                    sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
                >
                    Inventory List
                </Typography>

                {message && (
                    <Fade in={Boolean(message)} timeout={500}>
                        <Alert severity={message.includes("Failed") ? "error" : "success"} sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    </Fade>
                )}

                {/* Inventory Table */}
                <TableContainer component={Paper} elevation={3} sx={{ width: "100%" }}>
                    <Table>
                        <TableHead sx={{ bgcolor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Color</TableCell>
                                {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>Category</TableCell> */}
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Unit</TableCell> {/* New UNIT column */}
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Quantity Available</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Piece Available</TableCell>
                                
                                {/*Commenting as these are for internal purpose*/}
                                {/*<TableCell sx={{ color: "white", fontWeight: "bold" }}>Loaded Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loaded Pieces</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Procured Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Procured Pieces</TableCell>*/}
                                
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sold Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sold Pieces</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Quantity On-Hold</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pieces On-Hold</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items
                                .filter((item) => !selectedProduct || item.product.productName === selectedProduct)
                                .map((item) => (
                                    <Fade key={item.id} in={deletingId !== item.id} timeout={500}>
                                        <TableRow hover>
                                            <TableCell>{item.id}</TableCell>
                                            <TableCell>{item.product.productName}</TableCell>
                                            <TableCell>{item.color}</TableCell>
                                            {/* <TableCell>{item.category}</TableCell> */}
                                            <TableCell>{item.inventoryUnit}</TableCell> 
                                            <TableCell>{item.yardAvailable}</TableCell>
                                            <TableCell>{item.pieceAvailable}</TableCell>
                                            {/* <TableCell>{item.loadedYards}</TableCell>
                                            <TableCell>{item.loadedPieces}</TableCell>
                                            <TableCell>{item.procurementYards}</TableCell>
                                            <TableCell>{item.procurementPieces}</TableCell> */}
                                            <TableCell>{item.saleYards}</TableCell>
                                            <TableCell>{item.salePieces}</TableCell>
                                            <TableCell>{item.yardsOnHold}</TableCell>
                                            <TableCell>{item.piecesOnHold}</TableCell>
                                            <TableCell>
                                                <IconButton color="primary" onClick={() => handleEditClick(item)} disabled={deletingId === item.id}>
                                                    <FaEdit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => confirmDelete(item.id)} disabled={deletingId === item.id}>
                                                    <FaTrash />
                                                </IconButton>
                                                
                                            </TableCell>
                                        </TableRow>
                                    </Fade>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Buttons for Add & Update */}
            <Box mt={3} display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="primary" onClick={() => setOpenAddProductModal(true)}>Add Item</Button>
                <Button variant="contained" color="primary" onClick={() => setOpenAddModal(true)}>Add Inventory</Button>
                <Button variant="contained" color="secondary" onClick={downloadExcel}>Export to Excel</Button>
            </Box>

            {/* Add Item Modal */}
            <Modal open={openAddModal} onClose={() => setOpenAddModal(false)} closeAfterTransition>
                <Fade in={openAddModal}>
                    <Box sx={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        width: 400, bgcolor: "white", p: 4, borderRadius: 2
                    }}>
                        
                        <AddInventory
                            onItemAdded={async () => {
                                await fetchInventory();
                                setOpenAddModal(false);
                                if (onInventoryChange) {
                                    onInventoryChange(); // Notify parent to refresh master data
                                }
                            }}
                            initialProductName={selectedProduct} // Pass selectedProduct here
                            
                        />
                        
                    </Box>
                </Fade>
            </Modal>

            <EditInventory
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                selectedItem={selectedItem}
                operationType={operationType}
                setOperationType={setOperationType}
                editYards={editYards}
                setEditYards={setEditYards}
                editPieces={editPieces}
                setEditPieces={setEditPieces}
                onSubmit={handleOperationSubmit}
            />

            <DeleteInventory
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
            />

            <Modal open={openAddProductModal} onClose={() => setOpenAddProductModal(false)} closeAfterTransition disableEnforceFocus
  disableAutoFocus>
                <Fade in={openAddProductModal}>
                    <Box sx={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        width: 400, bgcolor: "white", p: 4, borderRadius: 2
                    }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Add Product</Typography>
                        
                        <TextField 
                            fullWidth label="Product Name" type="Text" 
                            value={addProductName} 
                            onChange={(e) => setAddProductName(e.target.value)} 
                            sx={{ mt: 2 }}
                        />

                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                            <Button onClick={() => setOpenAddProductModal(false)}>Cancel</Button>
                            <Button onClick={handleAddProductSubmit} variant="contained" sx={{ ml: 2 }}>Submit</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

        </Container>
    );
};

export default InventoryList;