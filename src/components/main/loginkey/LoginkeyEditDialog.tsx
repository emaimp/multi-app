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
import { LoginKey, LOGINKEY_COLORS, LOGINKEY_COLORS_HEX } from '../../../types/loginkey';
import { ConfirmDialog, AvatarPicker } from '../../ui';

interface LoginkeyEditDialogProps {
  open: boolean;
  loginkey: LoginKey | null;
  onClose: () => void;
  onSave: (loginkey: LoginKey, image?: string | null) => void;
  onDelete: (loginKeyId: string) => void;
}

export function LoginkeyEditDialog({ open, loginkey, onClose, onSave, onDelete }: LoginkeyEditDialogProps) {
  const [siteName, setSiteName] = useState(loginkey?.site_name || '');
  const [color, setColor] = useState(loginkey?.color || 'blue');
  const [image, setImage] = useState<string | null>(loginkey?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (loginkey) {
      setSiteName(loginkey.site_name);
      setColor(loginkey.color);
      setImage(loginkey.image || null);
    }
  }, [loginkey]);

  if (!loginkey) return null;

  const handleSubmit = () => {
    if (siteName.trim()) {
      onSave({
        ...loginkey,
        site_name: siteName.trim(),
        color,
      }, image);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(loginkey.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Login Key</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AvatarPicker
                value={image}
                onChange={setImage}
                size={100}
                label={siteName.charAt(0).toUpperCase()}
              />
            </Box>

            <TextField
              label="Site Name"
              fullWidth
              variant="outlined"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
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
                {LOGINKEY_COLORS.map((c: string) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: LOGINKEY_COLORS_HEX[c],
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
          <Button onClick={handleSubmit} variant="contained" disabled={!siteName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Login Key"
        message={`Are you sure you want to delete "${loginkey.site_name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default LoginkeyEditDialog;
