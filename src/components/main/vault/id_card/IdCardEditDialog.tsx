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
  const [idType, setIdType] = useState(idCard?.id_type || '');
  const [fullName, setFullName] = useState(idCard?.full_name || '');
  const [idNumber, setIdNumber] = useState(idCard?.id_number || '');
  const [color, setColor] = useState(idCard?.color || 'blue');
  const [image, setImage] = useState<string | null>(idCard?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (idCard) {
      setIdType(idCard.id_type);
      setFullName(idCard.full_name);
      setIdNumber(idCard.id_number);
      setColor(idCard.color);
      setImage(idCard.image || null);
    }
  }, [idCard]);

  if (!idCard) return null;

  const handleSubmit = () => {
    if (idType.trim()) {
      onSave({
        ...idCard,
        id_type: idType.trim(),
        full_name: fullName.trim(),
        id_number: idNumber.trim(),
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
                label={idType.charAt(0).toUpperCase() || 'I'}
              />
            </Box>

            <TextField
              label="ID Type"
              fullWidth
              variant="outlined"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
              placeholder="DNI, Passport, License..."
            />

            <TextField
              label="Full Name"
              fullWidth
              variant="outlined"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name on ID"
            />

            <TextField
              label="ID Number"
              fullWidth
              variant="outlined"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="ID number"
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
          <Button onClick={handleSubmit} variant="contained" disabled={!idType.trim()}>
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