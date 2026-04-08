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
import {
  IdCard,
  IDCARD_COLORS,
  IDCARD_COLORS_HEX
} from '../../../../types/id_card';
import { ConfirmDialog, AvatarPicker } from '../../../ui';

interface IdCardEditDialogProps {
  open: boolean;
  idCard: IdCard | null;
  onClose: () => void;
  onSave: (idCard: IdCard, image?: string | null) => void;
  onDelete: (idCardId: string) => void;
}

export function IdCardEditDialog({ open, idCard, onClose, onSave, onDelete }: IdCardEditDialogProps) {
  const [idName, setIdName] = useState(idCard?.id_name || '');
  const [color, setColor] = useState(idCard?.color || 'blue');
  const [image, setImage] = useState<string | null>(idCard?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (idCard) {
      setIdName(idCard.id_name);
      setColor(idCard.color);
      setImage(idCard.image || null);
    }
  }, [idCard]);

  if (!idCard) return null;

  const handleSubmit = () => {
    if (idName.trim()) {
      onSave({
        ...idCard,
        id_name: idName.trim(),
        color,
      }, image);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(idCard.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit ID Card</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AvatarPicker
                value={image}
                onChange={setImage}
                size={100}
                label={idName.charAt(0).toUpperCase() || 'I'}
              />
            </Box>

            <TextField
              label="ID Name"
              fullWidth
              variant="outlined"
              value={idName}
              onChange={(e) => setIdName(e.target.value)}
              placeholder="Name on ID"
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
                {IDCARD_COLORS.map((c: string) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: IDCARD_COLORS_HEX[c],
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
          <Button onClick={handleSubmit} variant="contained" disabled={!idName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete ID Card"
        message={`Are you sure you want to delete "${idCard.id_type}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default IdCardEditDialog;