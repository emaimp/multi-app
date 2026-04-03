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
import { Vault, VAULT_COLORS, VAULT_COLORS_HEX } from '../../../types/vault';
import { Collection } from '../../../types/collection';
import { ConfirmDialog, AvatarPicker } from '../../ui';

interface VaultEditDialogProps {
  open: boolean;
  vault: Vault | null;
  collections: Collection[];
  onClose: () => void;
  onSave: (vault: Vault, image?: string | null) => void;
  onDelete: (vaultId: string) => void;
  onUpdateCollection: (vaultId: string, collectionId: string | null) => void;
}

export function VaultEditDialog({ open, vault, collections, onClose, onSave, onDelete, onUpdateCollection }: VaultEditDialogProps) {
  const [name, setName] = useState(vault?.name || '');
  const [color, setColor] = useState(vault?.color || 'blue');
  const [image, setImage] = useState<string | null>(vault?.image || null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [originalCollection, setOriginalCollection] = useState<Collection | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (vault) {
      setName(vault.name);
      setColor(vault.color);
      setImage(vault.image || null);
      const vaultCollection = collections.find(c => c.vault_ids.includes(vault.id)) || null;
      setSelectedCollection(vaultCollection);
      setOriginalCollection(vaultCollection);
    }
  }, [vault, collections]);

  if (!vault) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({
        ...vault,
        name: name.trim(),
        color
      },
      image
      );

      if (originalCollection?.id !== selectedCollection?.id) {
        onUpdateCollection(vault.id, selectedCollection?.id || null);
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
              <AvatarPicker
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
              value={selectedCollection}
              onChange={(_, newValue) => {
                setSelectedCollection(newValue);
              }}
              options={collections}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params}
                  label="Select Collection"
                  variant="outlined"
                />
              )}
              disableClearable={false}
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
