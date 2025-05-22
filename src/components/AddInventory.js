import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const AddInventory = ({ onItemAdded }) => {
    const [productName, setProductName] = useState(""); // Ensure controlled component
    const [color, setColor] = useState("");
    const [category, setCategory] = useState("");
    const [yardAvailable, setYardAvailable] = useState("");
    const [pieceAvailable, setPieceAvailable] = useState("");
    const [masterProducts, setMasterProducts] = useState([]); // Default empty array

    useEffect(() => {
        axios.get("http://localhost:8080/api/inventory/master-products")
            .then(response => {
                console.log(response.data); // Debugging
                setMasterProducts(response.data || []); // Ensure it's always an array
            })
            .catch(error => {
                console.error("Error fetching master products:", error);
                setMasterProducts([]); // Fallback to empty array
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !color || !category || !yardAvailable || !pieceAvailable) {
            alert("All fields are required!");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/inventory", {
                productName,
                color,
                category,
                yardAvailable: parseFloat(yardAvailable),
                pieceAvailable: parseFloat(pieceAvailable),
            });

            setProductName(""); // Reset after submission
            setColor("");
            setCategory("");
            setYardAvailable("");
            setPieceAvailable("");
            onItemAdded();
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item!");
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>

                    {/* Product Name Dropdown */}
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Product Name</InputLabel>
                        <Select
                            value={productName} // Always controlled
                            onChange={(e) => setProductName(e.target.value)}
                            label="Product Name"
                        >
                            <MenuItem value="">Select a product</MenuItem> {/* Placeholder */}
                            {masterProducts.map((product) => (
                                <MenuItem key={product.id} value={product.productName}>
                                    {product.productName} {/* Corrected field name */}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField label="Color" variant="outlined" fullWidth value={color} onChange={(e) => setColor(e.target.value)} />
                    <TextField label="Category" variant="outlined" fullWidth value={category} onChange={(e) => setCategory(e.target.value)} />
                    <TextField label="Yard Available" type="number" variant="outlined" fullWidth value={yardAvailable} onChange={(e) => setYardAvailable(e.target.value)} />
                    <TextField label="Piece Available" type="number" variant="outlined" fullWidth value={pieceAvailable} onChange={(e) => setPieceAvailable(e.target.value)} />
                    
                    <Button type="submit" variant="contained" color="primary" size="large">
                        Add Item
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default AddInventory;