import React from 'react';
import MuiDialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface KDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  children?: React.ReactNode;
}

function Dialog(props: KDialogProps) {
  const { open, onClose, title, children } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <MuiDialog open={open} onClose={handleClose} aria-labelledby="dialog-title">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} id="dialog-title">
        {title}
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
    </MuiDialog>
  );
}

export default Dialog;