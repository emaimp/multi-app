import { Box, Typography, Button, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { NoteList } from '../note/NoteList';
import { Vault } from '../../types/vault';
import { Note } from '../../types/note';

interface MainContentProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  lockedNoteIds?: Set<string>;
  username?: string;
  onAddNote: () => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function MainContent({
  selectedVault,
  vaultNotes,
  lockedNoteIds,
  username,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: MainContentProps) {
  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              {selectedVault.name}
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddNote}>
              New Note
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <NoteList
              notes={vaultNotes}
              vault={selectedVault}
              lockedNoteIds={lockedNoteIds}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
            />
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Welcome, {username}
          </Typography>
          <Typography color="text.secondary">
            Select a vault from the list to view details.
          </Typography>
        </>
      )}
    </Box>
  );
}

export default MainContent;
