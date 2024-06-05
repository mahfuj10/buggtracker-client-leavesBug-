import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({ open, toggleDialog = () => {}, toggleConfirm = () => {}, title, content = '' }) {

  return (
    <Dialog
      open={open}
      onClose={toggleDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" sx={{minWidth: 320}}>
        {title}
      </DialogTitle>
      <DialogContent>
        {
          content &&  <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={toggleDialog}>Cancel</Button>
        <Button onClick={toggleConfirm} autoFocus>
            Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
