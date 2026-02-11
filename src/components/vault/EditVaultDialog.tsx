import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Vault, VAULT_COLORS, VAULT_COLORS_HEX } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface EditVaultDialogProps {
  open: boolean;
  vault: Vault | null;
  onClose: () => void;
  onSave: (vault: Vault) => void;
  onDelete: (vaultId: string) => void;
}

export function EditVaultDialog({ open, vault, onClose, onSave, onDelete }: EditVaultDialogProps) {
  const [name, setName] = useState(vault?.name || '');
  const [color, setColor] = useState(vault?.color || 'blue');
  const [image, setImage] = useState<string | undefined>(vault?.image);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vault) {
      setName(vault.name);
      setColor(vault.color);
      setImage(vault.image);
    }
  }, [vault]);

  if (!vault) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({
        ...vault,
        name: name.trim(),
        color,
        image,
      });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Vault</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  border: '4px solid',
                  borderColor: VAULT_COLORS_HEX[color],
                  bgcolor: 'transparent',
                  overflow: 'hidden',
                  color: 'text.primary',
                }}
                src={image}
                onClick={() => fileInputRef.current?.click()}
              >
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Box>

            {image && (
              <Box sx={{ textAlign: 'center' }}>
                <Button size="small" onClick={handleRemoveImage}>
                  Remove Image
                </Button>
              </Box>
            )}

            <TextField
              label="Vault Name"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

export default EditVaultDialog;
