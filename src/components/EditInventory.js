import React from "react";
import { Modal, Fade, Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

const EditInventory = ({
    open,
    onClose,
    selectedItem,
    operationType,
    setOperationType,
    editYards,
    setEditYards,
    editPieces,
    setEditPieces,
    onSubmit
}) => (
    <Modal open={open} onClose={onClose} closeAfterTransition disableEnforceFocus disableAutoFocus>
        <Fade in={open}>
            <Box sx={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 400, bgcolor: "white", p: 4, borderRadius: 2
            }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Edit Inventory</Typography>
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
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="demo-simple-select-label">Operation Types</InputLabel>
                    <Select
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value)}
                        label="Operation Types"
                    >
                        <MenuItem value="Procure">Procurement</MenuItem>
                        <MenuItem value="Hold">On Hold</MenuItem>
                        <MenuItem value="Release">Release Hold</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    fullWidth label="Quantity" type="number"
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
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={onSubmit} variant="contained" sx={{ ml: 2 }}>Submit</Button>
                </Box>
            </Box>
        </Fade>
    </Modal>
);

export default EditInventory;