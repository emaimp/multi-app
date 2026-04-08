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
  CreditCard,
  CREDITCARD_COLORS,
  CREDITCARD_COLORS_HEX
} from '../../../../types/credit_card';
import { ConfirmDialog, AvatarPicker } from '../../../ui';

interface CreditCardEditDialogProps {
  open: boolean;
  creditCard: CreditCard | null;
  onClose: () => void;
  onSave: (creditCard: CreditCard, image?: string | null) => void;
  onDelete: (creditCardId: string) => void;
}

export function CreditCardEditDialog({ open, creditCard, onClose, onSave, onDelete }: CreditCardEditDialogProps) {
  const [cardName, setCardName] = useState(creditCard?.card_name || '');
  const [color, setColor] = useState(creditCard?.color || 'blue');
  const [image, setImage] = useState<string | null>(creditCard?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (creditCard) {
      setCardName(creditCard.card_name);
      setColor(creditCard.color);
      setImage(creditCard.image || null);
    }
  }, [creditCard]);

  if (!creditCard) return null;

  const handleSubmit = () => {
    if (cardName.trim()) {
      onSave({
        ...creditCard,
        card_name: cardName.trim(),
        color,
      }, image);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(creditCard.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Credit Card</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AvatarPicker
                value={image}
                onChange={setImage}
                size={100}
                label={cardName.charAt(0).toUpperCase() || 'C'}
              />
            </Box>

            <TextField
              label="Card Name"
              fullWidth
              variant="outlined"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Name on card"
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
                {CREDITCARD_COLORS.map((c: string) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: CREDITCARD_COLORS_HEX[c],
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
          <Button onClick={handleSubmit} variant="contained" disabled={!cardName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Credit Card"
        message={`Are you sure you want to delete "${creditCard.card_name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default CreditCardEditDialog;