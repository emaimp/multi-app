import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Note, NOTE_COLORS_HEX } from '../../../../types/note';

interface NoteItemProps {
  note: Note;
  isLockedByDefault?: boolean;
  onUpdate: (noteId: string, title: string, content: string) => void;
}

export function NoteItem({ note, isLockedByDefault = false, onUpdate }: NoteItemProps) {
  const [content, setContent] = useState(note.content);
  const [pasted, setPasted] = useState(false);
  const [cut, setCut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLocked, setIsLocked] = useState(isLockedByDefault);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const noteColor = NOTE_COLORS_HEX[note.color] || NOTE_COLORS_HEX.blue;

  const handleSave = () => {
    onUpdate(note.id, note.title, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    if (text) {
      setContent(text);
      setPasted(true);
      onUpdate(note.id, note.title, text);
      setTimeout(() => setPasted(false), 3000);
    }
  };

  const handleCut = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setContent('');
      setCut(true);
      onUpdate(note.id, note.title, '');
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
          px: 1,
          py: 1,
          bgcolor: noteColor + '20',
          borderBottom: '2px solid',
          borderColor: noteColor,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
            opacity: isLocked ? 0.7 : 1,
            px: 0.5,
          }}
        >
          {note.title || 'Untitled Note'}
        </Typography>

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
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 0.5,
        px: 1,
        py: 0.5,
        bgcolor: noteColor + '10',
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
          placeholder="Write your note here..."
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
  );
}

export default NoteItem;
