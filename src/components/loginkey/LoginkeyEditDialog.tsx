import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoginKey } from '../../types/loginkey';
import { ConfirmDialog, AvatarPicker } from '../ui';

interface LoginkeyEditDialogProps {
  open: boolean;
  loginkey: LoginKey | null;
  onClose: () => void;
  onSave: (loginkey: LoginKey, image?: string | null) => void;
  onDelete: (loginKeyId: string) => void;
}

export function LoginkeyEditDialog({ open, loginkey, onClose, onSave, onDelete }: LoginkeyEditDialogProps) {
  const [siteName, setSiteName] = useState(loginkey?.site_name || '');
  const [url, setUrl] = useState(loginkey?.url || '');
  const [username, setUsername] = useState(loginkey?.username || '');
  const [password, setPassword] = useState(loginkey?.password || '');
  const [details, setDetails] = useState(loginkey?.details || '');
  const [color, setColor] = useState(loginkey?.color || 'blue');
  const [image, setImage] = useState<string | null>(loginkey?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (loginkey) {
      setSiteName(loginkey.site_name);
      setUrl(loginkey.url || '');
      setUsername(loginkey.username);
      setPassword(loginkey.password);
      setDetails(loginkey.details || '');
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
        url: url || null,
        username,
        password,
        details: details || null,
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

            <TextField
              label="URL"
              fullWidth
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />

            <TextField
              label="Username / Email"
              fullWidth
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Password"
              fullWidth
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              label="Details"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
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
