import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Fade } from "@mui/material";

const DeleteInventory = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose} TransitionComponent={Fade}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <DialogContentText>Are you sure you want to delete this item?</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color="secondary">No</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Yes</Button>
        </DialogActions>
    </Dialog>
);

export default DeleteInventory;