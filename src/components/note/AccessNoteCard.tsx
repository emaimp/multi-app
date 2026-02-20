import { useState } from 'react';
import { Box, TextField, IconButton, Typography, InputAdornment, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Note } from '../../types/note';
import { Vault, VAULT_COLORS_HEX } from '../../types/vault';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface AccessNoteCardProps {
  note: Note;
  vault: Vault | undefined;
  isLockedByDefault?: boolean;
  onUpdate: (noteId: string, title: string, content: string) => void;
  onDelete: (noteId: string) => void;
}

const ACCESS_NOTE_DELIMITER = '::';

export function AccessNoteCard({ note, vault, isLockedByDefault = false, onUpdate, onDelete }: AccessNoteCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [username, setUsername] = useState(() => {
    const parts = note.content.split(ACCESS_NOTE_DELIMITER);
    return parts[0] || '';
  });
  const [password, setPassword] = useState(() => {
    const parts = note.content.split(ACCESS_NOTE_DELIMITER);
    return parts[1] || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(isLockedByDefault);

  const vaultColor = vault ? VAULT_COLORS_HEX[vault.color] || VAULT_COLORS_HEX.primary : VAULT_COLORS_HEX.primary;

  const getContent = () => `${username}${ACCESS_NOTE_DELIMITER}${password}`;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== note.title) {
      onUpdate(note.id, title, getContent());
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleSave = () => {
    onUpdate(note.id, title, getContent());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyUsername = async () => {
    if (username) {
      await navigator.clipboard.writeText(username);
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 3000);
    }
  };

  const handleCopyPassword = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 3000);
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
            px: 2,
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
              {note.title || 'Untitled Access Note'}
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

          <Tooltip title="Copy username">
            <IconButton
              size="small"
              onClick={handleCopyUsername}
              sx={{
                color: copiedUsername ? 'success.main' : 'inherit',
                opacity: copiedUsername ? 1 : 0.6,
                '&:hover': { opacity: 1 },
              }}
            >
              {copiedUsername ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Copy password">
            <IconButton
              size="small"
              onClick={handleCopyPassword}
              sx={{
                color: copiedPassword ? 'success.main' : 'inherit',
                opacity: copiedPassword ? 1 : 0.6,
                '&:hover': { opacity: 1 },
              }}
            >
              {copiedPassword ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

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
            fullWidth
            variant="standard"
            type={showUsername ? 'text' : 'password'}
            value={username}
            onChange={(e) => !isLocked && setUsername(e.target.value)}
            placeholder="Username / Email"
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
                mb: 1,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showUsername ? 'Hide username' : 'Show username'}>
                    <IconButton
                      size="small"
                      onClick={() => setShowUsername(!showUsername)}
                      edge="end"
                      sx={{ opacity: 0.6 }}
                    >
                      {showUsername ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            variant="standard"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => !isLocked && setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLocked}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '0.9rem',
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ opacity: 0.6 }}
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Access Note"
        message={`Are you sure you want to delete "${note.title || 'Untitled Access Note'}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

export default AccessNoteCard;
