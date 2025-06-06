import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const InvoiceList = ({ onBack }) => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/invoices/getAllHeaders")
            .then(res => setInvoices(res.data))
            .catch(() => setInvoices([]));
    }, []);

    const fetchEntries = (invoiceNumber) => {
        axios.get(`http://localhost:8080/api/invoices/${invoiceNumber}/entries`)
            .then(res => {
                setEntries(res.data);
                setSelectedInvoice(invoiceNumber);
            })
            .catch(() => setEntries([]));
    };

    return (
        <Box mt={5} display="flex" justifyContent="center">
            <Box sx={{ width: "100%", maxWidth: 700 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", flex: 1 }}>
                        Orders
                    </Typography>
                    <Button variant="outlined" onClick={onBack}>Back</Button>
                </Box>
                <TableContainer component={Paper} elevation={4}>
                    <Table>
                        <TableHead sx={{ bgcolor: "#1976d2" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Invoice Number</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Customer Name</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Button
                                            variant="text"
                                            color="primary"
                                            onClick={() => fetchEntries(row.invoiceNumber)}
                                            sx={{ textTransform: "none", padding: 0, minWidth: 0 }}
                                        >
                                            {row.invoiceNumber}
                                        </Button>
                                    </TableCell>
                                    <TableCell>{row.customerName}</TableCell>
                                    <TableCell>{row.totalPrice}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {selectedInvoice && (
                    <Box mt={4}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Invoice Entries for: <b>{selectedInvoice}</b>
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell>Color</TableCell>
                                        <TableCell>Pieces</TableCell>
                                        <TableCell>Total Quantity</TableCell>
                                        <TableCell>Unit Price</TableCell>
                                        <TableCell>Total Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {entries.map((entry, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{entry.masterProduct}</TableCell>
                                            <TableCell>{entry.color}</TableCell>
                                            <TableCell>{entry.numPieces}</TableCell>
                                            <TableCell>{entry.totalQuantity}</TableCell>
                                            <TableCell>{entry.perUnitPrice}</TableCell>
                                            <TableCell>{entry.totalProductPrice}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button sx={{ mt: 2 }} onClick={() => { setSelectedInvoice(null); setEntries([]); }}>
                            Close
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default InvoiceList;