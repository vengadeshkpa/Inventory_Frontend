import { useState } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box } from "@mui/material";

const AddInventory = ({ onItemAdded }) => {
    const [productName, setProductName] = useState("");
    const [color, setColor] = useState("");
    const [category, setCategory] = useState("");
    const [yardAvailable, setYardAvailable] = useState("");
    const [pieceAvailable, setPieceAvailable] = useState("");

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

            setProductName("");
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
                    <TextField label="Product Name" variant="outlined" fullWidth value={productName} onChange={(e) => setProductName(e.target.value)} />
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