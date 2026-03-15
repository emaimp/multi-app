import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Vault, VAULT_COLORS, VAULT_COLORS_HEX } from '../../types/vault';
import { Collection } from '../../types/collection';
import { ConfirmDialog, ImagePicker } from '../ui';
import { useVaults } from '../../context/VaultContext';

interface VaultEditDialogProps {
  open: boolean;
  vault: Vault | null;
  onClose: () => void;
  onSave: (vault: Vault, image?: string | null) => void;
  onDelete: (vaultId: string) => void;
}

export function VaultEditDialog({ open, vault, onClose, onSave, onDelete }: VaultEditDialogProps) {
  const { collections, updateCollection } = useVaults();
  const [name, setName] = useState(vault?.name || '');
  const [color, setColor] = useState(vault?.color || 'blue');
  const [image, setImage] = useState<string | null>(vault?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useEffect(() => {
    if (vault) {
      setName(vault.name);
      setColor(vault.color);
      setImage(vault.image || null);
      
      const currentCollection = collections.find(c => c.vault_ids.includes(vault.id)) || null;
      setSelectedCollection(currentCollection);
    }
  }, [vault, collections]);

  if (!vault) return null;

  const handleSubmit = async () => {
    if (name.trim()) {
      onSave({
        ...vault,
        name: name.trim(),
        color
        },
      image
      );

      const currentCollection = collections.find(c => c.vault_ids.includes(vault.id)) || null;
      
      if (selectedCollection !== currentCollection) {
        if (currentCollection) {
          const updatedVaultIds = currentCollection.vault_ids.filter(id => id !== vault.id);
          await updateCollection({ ...currentCollection, vault_ids: updatedVaultIds });
        }
        
        if (selectedCollection) {
          const updatedVaultIds = [...selectedCollection.vault_ids, vault.id];
          await updateCollection({ ...selectedCollection, vault_ids: updatedVaultIds });
        }
      }
      
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(vault.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Vault</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <ImagePicker
                value={image}
                onChange={setImage}
                size={100}
                label={name.charAt(0).toUpperCase()}
              />
            </Box>

            <TextField
              label="Vault Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Autocomplete
              options={collections}
              value={selectedCollection}
              onChange={(_, newValue) => setSelectedCollection(newValue)}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Collection (optional)"
                  placeholder="Select a collection"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              clearOnBlur
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Color
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}>
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
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClick} color="error" startIcon={<DeleteIcon />}>
            Delete
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Vault"
        message={`Are you sure you want to delete "${vault.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default VaultEditDialog;
