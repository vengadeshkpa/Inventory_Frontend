import axios from "axios";
import { useEffect, useState } from "react";
import { FaTrash,FaEdit } from "react-icons/fa";
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Alert, Box, Fade, Button, Modal, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle,FormControl, InputLabel, Select, MenuItem, TextField
} from "@mui/material";
import AddInventory from "./AddInventory";
import * as XLSX from "xlsx";

const InventoryList = () => {
    const [items, setItems] = useState([]); // Full inventory list
    const [uniqueProducts, setUniqueProducts] = useState([]); // Unique products extracted from inventory
    const [selectedProduct, setSelectedProduct] = useState(""); // Selected product filter
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

    useEffect(() => {
        fetchInventory();
    }, []);

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
                "Yard Available": yardAvailable,
                "Piece Available": pieceAvailable,
                "Loaded Yards": loadedYards,
                "Loaded Pieces": loadedPieces,
                "Procurement Yards": procurementYards,
                "Procurement Pieces": procurementPieces,
                "Sale Yards": saleYards,
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

    const handleAddProductSubmit =(e)=>{
        e.preventDefault();

        if (!addProductName) {
            alert("All fields are required!");
            return;
        }

        try {
            axios.post("http://localhost:8080/api/inventory/addProduct", {
                addProductName
            });
            setAddProductName("");
            setOpenAddProductModal(false)
        } catch (error) {
            console.error("Error adding Product:", error);
            alert("Failed to add Product!");
            setOpenAddProductModal(false)
        }
    }

    const handleOperationSubmit = () => {
        if (!selectedItem) return;

        //setProductName(selectedItem?.product?.productName)
        //setColor(selectedItem?.color)
        //setCategory(selectedItem?.category)
        //console.log(editCategory)
    
        const updatedItem = {
            ...selectedItem,
            operationType,
            yards: editYards,
            pieces: editPieces,
        };
    
        // Call API or update state with new data
        console.log("Updated Item:", updatedItem);

        try {
            var id = selectedItem?.id
            var category = selectedItem?.category
            var color = selectedItem?.color
            var pName = selectedItem?.product?.productName

            axios.put(`http://localhost:8080/api/inventory/updatecond/${id}/${operationType}`,{
                productName : pName,
                color : color,
                category : category,
                yardAvailable:editYards,
                pieceAvailable:editPieces
            });
            setMessage("Item Edited successfully! ✅");
            setItems((prevItems) => prevItems.filter((item) => item.id !== selectedDeleteId));
            setSelectedItem(null);
            setTimeout(() => setMessage(""), 3000);
            
            
        } catch (error) {
            console.error("Error Editing item:", error);
            setMessage("Failed to Edit item!");
            setSelectedItem(null);
            setTimeout(() => setMessage(""), 3000);
        }
        setEditModalOpen(false);
        fetchInventory()
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
                setItems((prevItems) => prevItems.filter((item) => item.id !== selectedDeleteId));
                setDeletingId(null);
                setTimeout(() => setMessage(""), 3000);
            } catch (error) {
                console.error("Error deleting item:", error);
                setMessage("Failed to delete item! ❌");
                setDeletingId(null);
            }
        }, 500);
    };

    return (
        <Container maxWidth="md" sx={{ bgcolor: "#f4f6f8", p: 3, borderRadius: 2 }}>
            {/* Title & Dropdown Filter */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                    Inventory Management
                </Typography>
                {/* Dropdown for filtering inventory by product */}
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    style={{ padding: "8px", fontSize: "16px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="">All Products</option>
                    {uniqueProducts.map((product, index) => (
                        <option key={index} value={product}>
                            {product}
                        </option>
                    ))}
                </select>
            </Box>

            <Box mt={3}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
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
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ bgcolor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Color</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Category</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Yard Available</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Piece Available</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loaded Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loaded Pieces</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Procured Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Procured Pieces</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sold Yards</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Sold Pieces</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Yards On-Hold</TableCell>
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
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.yardAvailable}</TableCell>
                                            <TableCell>{item.pieceAvailable}</TableCell>
                                            <TableCell>{item.loadedYards}</TableCell>
                                            <TableCell>{item.loadedPieces}</TableCell>
                                            <TableCell>{item.procurementYards}</TableCell>
                                            <TableCell>{item.procurementPieces}</TableCell>
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
                        <AddInventory onItemAdded={() => {
                            fetchInventory();
                            setOpenAddModal(false);
                        }} />
                    </Box>
                </Fade>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} TransitionComponent={Fade}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this item?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="secondary">No</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Yes</Button>
                </DialogActions>
            </Dialog>

            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} closeAfterTransition disableEnforceFocus
  disableAutoFocus>
                <Fade in={editModalOpen}>
                    <Box sx={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                        width: 400, bgcolor: "white", p: 4, borderRadius: 2
                    }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Edit Inventory</Typography>

                        {/* Product & Color Display 
                        <Typography>Product: {selectedItem?.product.productName}</Typography>
                        <Typography>Color: {selectedItem?.color}</Typography>*/}

                        <TextField
                            label="Product"
                            value={selectedItem?.product?.productName || ""}
                            fullWidth
                            disabled
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="Color"
                            value={selectedItem?.color || ""}
                            fullWidth
                            disabled
                            sx={{ mb: 2 }}
                        />

                        {/* Operation Type Dropdown */}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="demo-simple-select-label">Operation Types</InputLabel>
                            <Select 
                                value={operationType} 
                                onChange={(e) => setOperationType(e.target.value)}
                                label="Operation Types"
                            >
                                <MenuItem value="Procure">Procurement</MenuItem>
                                <MenuItem value="Sales">Sale</MenuItem>
                                <MenuItem value="Hold">On Hold</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Yards & Pieces Input Fields */}
                        <TextField 
                            fullWidth label="Yards" type="number" 
                            value={editYards} 
                            onChange={(e) => setEditYards(e.target.value)} 
                            sx={{ mt: 2 }}
                        />
                        <TextField 
                            fullWidth label="Pieces" type="number" 
                            value={editPieces} 
                            onChange={(e) => setEditPieces(e.target.value)} 
                            sx={{ mt: 2 }}
                        />

                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleOperationSubmit} variant="contained" sx={{ ml: 2 }}>Submit</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

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