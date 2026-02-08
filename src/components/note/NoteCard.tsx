import { useState } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';

interface NoteCardProps {
  note: Note;
  vault: Vault | undefined;
  onUpdate: (note: Note) => void;
}

const VAULT_COLORS_HEX: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0891b2',
};

export function NoteCard({ note, vault, onUpdate }: NoteCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(note.title);

  const vaultColor = vault ? VAULT_COLORS_HEX[vault.color] || VAULT_COLORS_HEX.primary : VAULT_COLORS_HEX.primary;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== note.title) {
      onUpdate({ ...note, title });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...note, content: e.target.value });
  };

  const handleSave = () => {
    onUpdate(note);
  };

  const autoResize = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        mb: 2,
        boxShadow: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: vaultColor + '20',
          borderBottom: '2px solid',
          borderColor: vaultColor,
        }}
      >
        {isEditingTitle ? (
          <TextField
            autoFocus
            size="small"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
                fontWeight: 500,
              },
            }}
            sx={{
              flexGrow: 1,
            }}
          />
        ) : (
          <Typography
            variant="subtitle2"
            sx={{
              flexGrow: 1,
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              },
              px: 0.5,
              borderRadius: 0.5,
            }}
            onClick={() => setIsEditingTitle(true)}
          >
            {note.title || 'Untitled Note'}
          </Typography>
        )}

        <IconButton size="small" onClick={handleSave} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
          <SaveIcon fontSize="small" />
        </IconButton>

        <IconButton size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <TextField
          multiline
          fullWidth
          variant="standard"
          placeholder="Write your note here..."
          value={note.content}
          onChange={handleContentChange}
          onFocus={autoResize}
          inputProps={{
            style: {
              resize: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              lineHeight: 1.6,
              padding: 0,
            },
          }}
          InputProps={{
            disableUnderline: true,
          }}
          sx={{
            width: '100%',
          }}
        />
      </Box>
    </Box>
  );
}

export default NoteCard;
