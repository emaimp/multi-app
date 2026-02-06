import { useState, useRef } from 'react';
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
import { Note, NOTE_COLORS, NoteColor } from '../../types/note';

interface EditNoteDialogProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const NOTE_COLORS_HEX: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0891b2',
};

export function EditNoteDialog({ open, note, onClose, onSave, onDelete }: EditNoteDialogProps) {
  const [name, setName] = useState(note?.name || '');
  const [color, setColor] = useState<NoteColor>(note?.color as NoteColor || 'primary');
  const [image, setImage] = useState<string | undefined>(note?.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!note) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({
        ...note,
        name: name.trim(),
        color,
        image,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(note.id);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Note</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                border: '4px solid',
                borderColor: NOTE_COLORS_HEX[color],
                bgcolor: 'transparent',
                overflow: 'hidden',
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
            label="Note Name"
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
              {NOTE_COLORS.map((c) => (
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
        <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>
          Delete
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditNoteDialog;
