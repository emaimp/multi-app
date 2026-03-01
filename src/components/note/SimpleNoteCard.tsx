import { useState } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Note } from '../../types/note';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SimpleNoteCardProps {
  note: Note;
  vault: Vault | undefined;
  isLockedByDefault?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  onUpdate: (noteId: string, title: string, content: string) => void;
  onDelete: (noteId: string) => void;
}

export function SimpleNoteCard({ note, vault, isLockedByDefault = false, dragAttributes, dragListeners, onUpdate, onDelete }: SimpleNoteCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [pasted, setPasted] = useState(false);
  const [cut, setCut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(isLockedByDefault);

  const vaultColor = vault ? VAULT_COLORS_HEX[vault.color] || VAULT_COLORS_HEX.primary : VAULT_COLORS_HEX.primary;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== note.title) {
      onUpdate(note.id, title, content);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleSave = () => {
    onUpdate(note.id, title, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    if (text) {
      setContent(text);
      setPasted(true);
      onUpdate(note.id, title, text);
      setTimeout(() => setPasted(false), 3000);
    }
  };

  const handleCut = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setContent('');
      setCut(true);
      onUpdate(note.id, title, '');
      setTimeout(() => setCut(false), 3000);
    }
  };

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
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
            px: 1,
            py: 1,
            bgcolor: vaultColor + '20',
            borderBottom: '2px solid',
            borderColor: vaultColor,
          }}
        >
          {isEditingTitle && !isLocked ? (
            <TextField
              autoFocus
              size="small"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              variant="standard"
              disabled={isLocked}
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
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.7 : 1,
                '&:hover': !isLocked ? {
                  bgcolor: 'rgba(255,255,255,0.1)',
                } : {},
                px: 0.5,
                borderRadius: 0.5,
              }}
              onClick={() => !isLocked && setIsEditingTitle(true)}
            >
              {note.title || 'Untitled Simple Note'}
            </Typography>
          )}

          <IconButton
            size="small"
            onClick={() => setIsLocked(!isLocked)}
            sx={{
              color: isLocked ? 'success.main' : 'inherit',
              opacity: isLocked ? 1 : 0.6,
              '&:hover': { opacity: 1 },
            }}
          >
            {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
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

          {dragListeners && (
            <DragIndicatorIcon
              sx={{
                color: 'action.active',
                cursor: 'grab',
                ml: 1,
              }}
              {...dragAttributes}
              {...dragListeners}
            />
          )}
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 0.5,
          px: 1,
          py: 0.5,
          bgcolor: vaultColor + '10',
          borderBottom: '1px solid',
          borderColor: 'divider'
          }}>
          <IconButton
            size="small"
            onClick={handlePaste}
            disabled={isLocked}
            sx={{
              color: pasted ? 'success.main' : 'inherit',
              opacity: pasted ? 1 : 0.6,
              '&:hover': { opacity: 1 },
            }}
          >
            {pasted ? <CheckIcon fontSize="small" /> : <ContentPasteIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCut}
            disabled={isLocked}
            sx={{
              color: cut ? 'success.main' : 'inherit',
              opacity: cut ? 1 : 0.6,
              '&:hover': { opacity: 1 },
            }}
          >
            {cut ? <CheckIcon fontSize="small" /> : <ContentCutIcon fontSize="small" />}
          </IconButton>
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
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            multiline
            fullWidth
            variant="standard"
            value={content}
            onChange={(e) => !isLocked && setContent(e.target.value)}
            placeholder="Write your simple note here..."
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
                lineHeight: 1.6,
                p: 0,
              },
            }}
            inputProps={{
              sx: {
                minHeight: '60px',
              },
            }}
          />
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Simple Note"
        message={`Are you sure you want to delete "${note.title || 'Untitled Simple Note'}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default SimpleNoteCard;
