import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, MenuItem, Select, InputLabel, FormControl, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";

const AddInventory = ({ onItemAdded, initialProductName = "" }) => {
    const [productName, setProductName] = useState(initialProductName);
    const [color, setColor] = useState("");
    const [category, setCategory] = useState("");
    const [yardAvailable, setYardAvailable] = useState("");
    const [pieceAvailable, setPieceAvailable] = useState("");
    const [masterProducts, setMasterProducts] = useState([]); // Default empty array
    const [inventoryUnit, setInventoryUnit] = useState("Meter"); // Default to 'Meter'

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

    useEffect(() => {
        if (initialProductName) setProductName(initialProductName);
    }, [initialProductName]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !color || !category || !yardAvailable || !pieceAvailable || !inventoryUnit) {
            alert("All fields are required!");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/inventory", {
                productName,
                color,
                category,
                inventoryUnit: inventoryUnit, // Send as 'inventoryUnit' in payload
                yardAvailable: parseFloat(yardAvailable),
                pieceAvailable: parseFloat(pieceAvailable),
            });

            setProductName(""); // Reset after submission
            setColor("");
            setCategory("");
            setInventoryUnit("Meter"); // Reset to default
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
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            label="Product Name"
                            disabled={!!initialProductName} // Disable if initialProductName is set
                        >
                            <MenuItem value="">Select a product</MenuItem>
                            {masterProducts
                                .filter(product => product && product.productName)
                                .map((product) => (
                                    <MenuItem key={product.id} value={product.productName}>
                                        {product.productName}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    <TextField label="Color" variant="outlined" fullWidth value={color} onChange={(e) => setColor(e.target.value)} />

                    {/* Category Dropdown - Updated */}
                    <FormControl fullWidth>
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select
                            labelId="category-select-label"
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="">Select a category</MenuItem>
                            <MenuItem value="A">A</MenuItem>
                            <MenuItem value="B">B</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Unit Radio Group */}
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Unit</FormLabel>
                        <RadioGroup
                            row
                            value={inventoryUnit}
                            onChange={(e) => setInventoryUnit(e.target.value)}
                            name="unit-radio-group"
                        >
                            <FormControlLabel value="Meter" control={<Radio />} label="Meter" />
                            <FormControlLabel value="Yard" control={<Radio />} label="Yard" />
                        </RadioGroup>
                    </FormControl>

                    {/* Quantity and Pieces */}
                    <TextField label="Available Quantity" type="number" variant="outlined" fullWidth value={yardAvailable} onChange={(e) => setYardAvailable(e.target.value)} />
                    <TextField label="Available Pieces" type="number" variant="outlined" fullWidth value={pieceAvailable} onChange={(e) => setPieceAvailable(e.target.value)} />
                    
                    <Button type="submit" variant="contained" color="primary" size="large">
                        Add Item
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default AddInventory;