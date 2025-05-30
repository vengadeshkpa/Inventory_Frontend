import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, MenuItem, Select, InputLabel, FormControl, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";

const AddInventory = ({ onItemAdded, initialProductName = "" }) => {
    const [productName, setProductName] = useState(initialProductName);
    const [color, setColor] = useState("");
    const [yardAvailable, setYardAvailable] = useState("");
    const [pieceAvailable, setPieceAvailable] = useState("");
    const [masterProducts, setMasterProducts] = useState([]);
    const [inventoryUnit, setInventoryUnit] = useState("Meter");

    useEffect(() => {
        axios.get("http://localhost:8080/api/inventory/master-products")
            .then(response => {
                setMasterProducts(response.data || []);
            })
            .catch(error => {
                setMasterProducts([]);
            });
    }, []);

    useEffect(() => {
        if (initialProductName) setProductName(initialProductName);
    }, [initialProductName]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!productName || !color || !yardAvailable || !pieceAvailable || !inventoryUnit) {
            alert("All fields are required!");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/inventory", {
                productName,
                color,
                inventoryUnit,
                yardAvailable: parseFloat(yardAvailable),
                pieceAvailable: parseFloat(pieceAvailable),
            });

            setProductName("");
            setColor("");
            setInventoryUnit("Meter");
            setYardAvailable("");
            setPieceAvailable("");
            onItemAdded();
        } catch (error) {
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
                            disabled={!!initialProductName}
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