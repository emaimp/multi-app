import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { VAULT_COLORS } from '../../types/vault';

interface CreateVaultDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export function CreateVaultDialog({ open, onClose, onCreate }: CreateVaultDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('primary');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim(), color);
      setName('');
      setColor('primary');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setColor('primary');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Vault</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Vault Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth>
          <InputLabel>Color</InputLabel>
          <Select
            value={color}
            label="Color"
            onChange={(e) => setColor(e.target.value)}
          >
            {VAULT_COLORS.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateVaultDialog;
