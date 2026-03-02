import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Typography,
} from '@mui/material';
import { useVaults } from '../../context/VaultContext';

interface VaultCreateDialogProps {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  onClose: () => void;
}

export function VaultCreateDialog({ open, title, label, placeholder, onClose }: VaultCreateDialogProps) {
  const { addVault, collections } = useVaults();
  const [name, setName] = useState('');
  const [color] = useState('blue');
  const [collection, setCollection] = useState<string>('');

  const handleSubmit = () => {
    if (name.trim()) {
      addVault(name.trim(), color, collection.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setCollection('');
    onClose();
  };

  const handleCollectionChange = (_: any, newValue: string | null) => {
    setCollection(newValue || '');
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        
        <Autocomplete
          freeSolo={false}
          options={collections.map(c => c.name)}
          value={collection || null}
          onChange={handleCollectionChange}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Collection (opcional)"
              placeholder="Select a collection"
            />
          )}
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
          Collections allow you to organize your vaults into groups. If collections exist, you can assign the vault to one.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!name.trim()}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VaultCreateDialog;
