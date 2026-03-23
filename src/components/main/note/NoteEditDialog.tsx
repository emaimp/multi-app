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
import { Note, NOTE_COLORS, NOTE_COLORS_HEX } from '../../../types/note';
import { ConfirmDialog, AvatarPicker } from '../../ui';

interface NoteEditDialogProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (note: Note, image?: string | null) => void;
  onDelete: (noteId: string) => void;
}

export function NoteEditDialog({ open, note, onClose, onSave, onDelete }: NoteEditDialogProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [color, setColor] = useState(note?.color || 'blue');
  const [image, setImage] = useState<string | null>(note?.image || null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setColor(note.color);
      setImage(note.image || null);
    }
  }, [note]);

  if (!note) return null;

  const handleSubmit = () => {
    if (title.trim()) {
      onSave({
        ...note,
        title: title.trim(),
        color,
      }, image);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note.id);
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AvatarPicker
                value={image}
                onChange={setImage}
                size={100}
                label={title.charAt(0).toUpperCase()}
              />
            </Box>

            <TextField
              label="Note Title"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                {NOTE_COLORS.map((c: string) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: NOTE_COLORS_HEX[c],
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
          <Button onClick={handleSubmit} variant="contained" disabled={!title.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default NoteEditDialog;
