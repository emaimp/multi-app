import { useState } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Note } from '../../types/note';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface NoteCardProps {
  note: Note;
  vault: Vault | undefined;
  onUpdate: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, vault, onUpdate, onDelete }: NoteCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopy = async () => {
    if (note.content) {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(note.id);
    setConfirmOpen(false);
  };

  const autoResize = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  return (
    <>
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

          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              color: copied ? 'success.main' : 'inherit',
              opacity: copied ? 1 : 0.6,
              '&:hover': { opacity: 1 },
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>

          <IconButton
            size="small"
            onClick={handleSave}
            sx={{
              color: saved ? 'success.main' : 'inherit',
              opacity: saved ? 1 : 0.6,
              '&:hover': { opacity: 1 },
            }}
          >
            {saved ? <CheckIcon fontSize="small" /> : <SaveIcon fontSize="small" />}
          </IconButton>

          <IconButton size="small" onClick={handleDeleteClick} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Note"
        message={`Are you sure you want to delete "${note.title || 'Untitled Note'}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default NoteCard;
