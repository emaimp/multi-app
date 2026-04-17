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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog, AvatarPicker } from '../../ui';

interface ItemCardEditDialogProps {
  open: boolean;
  item: Record<string, unknown> | null;
  nameField: string;
  colors: readonly string[];
  colorsHex: Record<string, string>;
  title: string;
  label: string;
  placeholder?: string;
  onClose: () => void;
  onSave: (item: Record<string, unknown>, image?: string | null) => void;
  onDelete: (itemId: string) => void;
}

export function ItemCardEditDialog({
  open,
  item,
  nameField,
  colors,
  colorsHex,
  title,
  label,
  placeholder,
  onClose,
  onSave,
  onDelete,
}: ItemCardEditDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [image, setImage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (item) {
      const itemName = item[nameField];
      setName(typeof itemName === 'string' ? itemName : '');
      setColor(typeof item.color === 'string' ? item.color : 'blue');
      setImage(typeof item.image === 'string' ? item.image : null);
    }
  }, [item, nameField]);

  if (!item) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({
        ...item,
        [nameField]: name.trim(),
        color,
      }, image);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id as string);
    setConfirmOpen(false);
    onClose();
  };

  const itemName = item[nameField];
  const displayName = typeof itemName === 'string' ? itemName : '';

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AvatarPicker
                value={image}
                onChange={setImage}
                size={100}
                label={name.charAt(0).toUpperCase() || title.charAt(0)}
              />
            </Box>

            <TextField
              label={label}
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
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
                {colors.map((c: string) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: colorsHex[c],
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
        title={`Delete ${title.replace('Edit ', '')}`}
        message={`Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default ItemCardEditDialog;