import React from "react";
import { Dialog, DialogTitle, DialogContent, Button, DialogActions, Typography } from "@mui/material";
import { styled } from "@mui/system";

// Custom styled components for modern look
const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 12px;
    padding: 20px;
    min-width: 300px; /* Adjust width for better display */
  }
`;

const Title = styled(DialogTitle)`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const StyledButton = styled(Button)`
  margin: 10px 0;
  font-size: 1.1rem;
  text-transform: none;
  border-radius: 8px;
  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
`;

const AttendanceDialog = ({ open, onClose, onStatusSelect }) => {
  const handleSelect = (status) => {
    onStatusSelect(status);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <Title>Select Attendance Status</Title>
      <DialogContent>
        <StyledButton
          variant="outlined"
          color="success"
          fullWidth
          onClick={() => handleSelect("Present")}
        >
          Present
        </StyledButton>
        <StyledButton
          variant="outlined"
          color="error"
          fullWidth
          onClick={() => handleSelect("Absent")}
        >
          Absent
        </StyledButton>
        <StyledButton
          variant="outlined"
          color="warning"
          fullWidth
          onClick={() => handleSelect("Cancelled")}
        >
          Cancelled
        </StyledButton>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" style={{ fontWeight: 'bold' }}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default AttendanceDialog;
