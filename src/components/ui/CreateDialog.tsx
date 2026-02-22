import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface CreateDialogProps {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  onClose: () => void;
  onCreate: (value: string) => void;
}

export function CreateDialog({ open, title, label, placeholder, onClose, onCreate }: CreateDialogProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onCreate(value.trim());
      setValue('');
      onClose();
    }
  };

  const handleClose = () => {
    setValue('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          placeholder={placeholder}
          fullWidth
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!value.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateDialog;
