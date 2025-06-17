import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Fade, Box, Typography, TextField, Button, MenuItem } from "@mui/material";

const CustomerList = ({ open, onClose, onCustomerAdded, selectedCategory }) => {
    const [newCustomerName, setNewCustomerName] = useState("");
    const [customerMessage, setCustomerMessage] = useState("");
    const [newCustomerCategory, setNewCustomerCategory] = useState(selectedCategory || "A");
    const [newCustomerLocation, setNewCustomerLocation] = useState("");
    const [newCustomerAddress1, setNewCustomerAddress1] = useState("");
    const [newCustomerAddress2, setNewCustomerAddress2] = useState("");
    const [newCustomerPin, setNewCustomerPin] = useState("");
    const [newCustomerContact1, setNewCustomerContact1] = useState("");
    const [newCustomerContact2, setNewCustomerContact2] = useState("");
    const [newCustomerPOC, setNewCustomerPOC] = useState("");
    const [newCustomerPOCContact, setNewCustomerPOCContact] = useState("");
    const [internalSalesmen, setInternalSalesmen] = useState([]);
    const [selectedSalesman, setSelectedSalesman] = useState("");

    useEffect(() => {
        if (open) {
            axios.get("http://localhost:8080/api/customers/getInternalSalesmen")
                .then(res => setInternalSalesmen(res.data || []))
                .catch(() => setInternalSalesmen([]));
        }
    }, [open]);

    const handleAddCustomer = async () => {
        if (!newCustomerName.trim()) {
            setCustomerMessage("Customer name is required!");
            return;
        }
        try {
            await axios.post("http://localhost:8080/api/customers/addCustomer", {
                name: newCustomerName.trim(),
                category: newCustomerCategory,
                location: newCustomerLocation,
                addressLine1: newCustomerAddress1,
                addressLine2: newCustomerAddress2,
                pinCode: newCustomerPin,
                contactNumber1: newCustomerContact1,
                contactNumber2: newCustomerContact2,
                customerPOC: newCustomerPOC,
                customerPOCContact: newCustomerPOCContact,
                internalSalesManId: selectedSalesman
            });
            setCustomerMessage("Customer added successfully! ✅");
            setNewCustomerName("");
            setNewCustomerCategory(selectedCategory || "A");
            setNewCustomerLocation("");
            setNewCustomerAddress1("");
            setNewCustomerAddress2("");
            setNewCustomerPin("");
            setNewCustomerContact1("");
            setNewCustomerContact2("");
            setNewCustomerPOC("");
            setNewCustomerPOCContact("");
            if (onCustomerAdded) onCustomerAdded();
            setTimeout(() => {
                setCustomerMessage("");
                onClose();
            }, 1500);
        } catch (error) {
            setCustomerMessage("Failed to add customer!");
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
        >
            <Fade in={open}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 2,
                    maxHeight: "80vh",
                    overflowY: "auto"
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Add Customer</Typography>
                    <TextField
                        fullWidth
                        label="Customer Name"
                        value={newCustomerName}
                        onChange={e => setNewCustomerName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Category"
                        value={newCustomerCategory}
                        onChange={e => setNewCustomerCategory(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="A">Textile</MenuItem>
                        <MenuItem value="B">Kabulon</MenuItem>
                        <MenuItem value="C">MGT</MenuItem>
                    </TextField>
                    <TextField
                        select
                        fullWidth
                        label="Internal Salesman"
                        value={selectedSalesman}
                        onChange={e => setSelectedSalesman(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    >
                        <MenuItem value="" disabled>Select Salesman</MenuItem>
                        {internalSalesmen.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Location"
                        value={newCustomerLocation}
                        onChange={e => setNewCustomerLocation(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Address Line 1"
                        value={newCustomerAddress1}
                        onChange={e => setNewCustomerAddress1(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Address Line 2"
                        value={newCustomerAddress2}
                        onChange={e => setNewCustomerAddress2(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Pin Code"
                        value={newCustomerPin}
                        onChange={e => setNewCustomerPin(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Contact Number 1"
                        value={newCustomerContact1}
                        onChange={e => setNewCustomerContact1(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Contact Number 2"
                        value={newCustomerContact2}
                        onChange={e => setNewCustomerContact2(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Customer POC"
                        value={newCustomerPOC}
                        onChange={e => setNewCustomerPOC(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Customer POC Contact Number"
                        value={newCustomerPOCContact}
                        onChange={e => setNewCustomerPOCContact(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    
                    {customerMessage && (
                        <Typography variant="body2" color={customerMessage.includes("success") ? "green" : "error"} sx={{ mb: 2 }}>
                            {customerMessage}
                        </Typography>
                    )}
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddCustomer}
                        >
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CustomerList;