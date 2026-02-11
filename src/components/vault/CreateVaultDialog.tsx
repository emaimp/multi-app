import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { VAULT_COLORS, VAULT_COLORS_HEX } from '../../types/vault';

interface CreateVaultDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export function CreateVaultDialog({ open, onClose, onCreate }: CreateVaultDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim(), color);
      setName('');
      setColor('blue');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setColor('blue');
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
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {VAULT_COLORS.map((c) => (
              <Box
                key={c}
                onClick={() => setColor(c)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: VAULT_COLORS_HEX[c],
                  cursor: 'pointer',
                  border: color === c ? '3px solid' : '2px solid',
                  borderColor: color === c ? 'text.primary' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              />
            ))}
          </Box>
        </Box>
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
