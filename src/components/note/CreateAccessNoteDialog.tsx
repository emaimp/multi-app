import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface CreateAccessNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export function CreateAccessNoteDialog({ open, onClose, onCreate }: CreateAccessNoteDialogProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate(title.trim());
      setTitle('');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Access Note</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Access Note Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter a title for your access note"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateAccessNoteDialog;
