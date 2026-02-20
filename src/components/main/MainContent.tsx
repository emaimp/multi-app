import { useState } from 'react';
import { Box, Typography, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyIcon from '@mui/icons-material/Key';
import { NoteList } from '../note/NoteList';
import { Note } from '../../types/note';
import { Vault } from '../../types/vault';

interface MainContentProps {
  selectedVault: Vault | undefined;
  vaultNotes: Note[];
  lockedNoteIds?: Set<string>;
  username?: string;
  onAddSimpleNote: () => void;
  onAddAccessNote: () => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function MainContent({
  selectedVault,
  vaultNotes,
  lockedNoteIds,
  username,
  onAddSimpleNote,
  onAddAccessNote,
  onUpdateNote,
  onDeleteNote,
}: MainContentProps) {
  const [createType, setCreateType] = useState<string | null>('simpleNote');

  const handleCreateType = (_: React.MouseEvent<HTMLElement>, newType: string | null) => {
    if (newType === 'simpleNote') {
      onAddSimpleNote();
    } else if (newType === 'accessNote') {
      onAddAccessNote();
    }
    setCreateType(newType);
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
      {selectedVault ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">
              {selectedVault.name}
            </Typography>
            <ToggleButtonGroup
              value={createType}
              exclusive
              onChange={handleCreateType}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  minWidth: 150,
                },
              }}
            >
              <ToggleButton value="simpleNote">
                <DescriptionIcon sx={{ mr: 1 }} /> Simple Note
              </ToggleButton>
              <ToggleButton value="accessNote">
                <KeyIcon sx={{ mr: 1 }} /> Access Note
              </ToggleButton>
            </ToggleButtonGroup>
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
