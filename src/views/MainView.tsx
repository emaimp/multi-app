import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventNoteIcon from '@mui/icons-material/EventNote';
import KeyIcon from '@mui/icons-material/Key';
import { LoadingDialog, CreateDialog } from '../components/ui';
import { CreateCollectionDialog } from '../components/main/mainsidebar/CreateCollectionDialog';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { useBackend } from '../hooks/useBackend';
import {
  VaultList,
  VaultListSkeleton,
  VaultEditDialog,
  VaultTypeSelector,
} from '../components/main/vault';
import { MainSidebar, CollectionEditDialog } from '../components/main/mainsidebar';
import { SecondarySidebar } from '../components/main/secondarysidebar';
import { NoteEditDialog } from '../components/main/note';
import { LoginkeyEditDialog } from '../components/main/loginkey';
import { Vault } from '../types/vault';
import { Collection } from '../types/collection';
import { Note } from '../types/note';
import { LoginKey } from '../types/loginkey';
import { VaultContent } from '../components/main/vault';
import { SettingsView } from './user/SettingsView';

export function MainView() {
  const navigate = useNavigate();
  const { user, logout, isLoadingContent, setIsLoadingContent, setUser } = useUser();
  const { invoke } = useBackend();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const {
    vaults,
    notes,
    loginKeys,
    collections,
    activeVault,
    selectVault,
    clearVaultSelect,
    loadingVaults,
    loadVaults,
    createVault,
    updateVault,
    deleteVault,
    reorderVaults,
    reorderVaultsInCollection,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    createLoginKey,
    updateLoginKey,
    deleteLoginKey,
    reorderLoginKeys,
    updateCollection,
    deleteCollection,
    reorderCollections,
  } = useVaults();

  useEffect(() => {
    if (user && isLoadingContent) {
      const masterKey = localStorage.getItem('masterKey');
      if (masterKey) {
        setAvatarLoading(true);
        Promise.all([
          invoke('init_session', { userId: user.id, masterKey }),
          loadVaults(),
        ]).then(() => {
          invoke<string | null>('get_user_avatar', { userId: user.id }).then((avatar) => {
            if (avatar) {
              setUser({ ...user, avatar });
            }
            setAvatarLoading(false);
            setIsLoadingContent(false);
          }).catch(() => {
            setAvatarLoading(false);
            setIsLoadingContent(false);
          });
        }).catch(() => {
          setAvatarLoading(false);
          setIsLoadingContent(false);
        });
      } else {
        setIsLoadingContent(false);
      }
    }
  }, []);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const [createLoginKeyDialogOpen, setCreateLoginKeyDialogOpen] = useState(false);
  const [vaultTypeSelectorOpen, setVaultTypeSelectorOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingLoginKey, setEditingLoginKey] = useState<LoginKey | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'loginKeys' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsLocked, setItemsLocked] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVault) {
      setItemsLocked(true);
    }
  }, [activeVault]);

  useEffect(() => {
    setSelectedItemId(null);
  }, [filterType]);

  const selectedVault = vaults.find((v) => v.id === activeVault);
  const vaultNotes = activeVault 
    ? notes.filter((n) => n.vault_id === activeVault)
    : [];

  const sortedVaultNotes = sortOrder 
    ? [...vaultNotes].sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comparison : -comparison;
      })
    : vaultNotes;

  const handleVaultClick = (vaultId: string) => {
    selectVault(vaultId);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleEditLoginKey = (loginkey: LoginKey) => {
    setEditingLoginKey(loginkey);
  };

  const handleSortNotes = () => {
    setSortOrder((prev) => {
      if (prev === null) return 'asc';
      if (prev === 'asc') return 'desc';
      return null;
    });
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleSelectVault = () => {
    setCreateDialogOpen(true);
  };

  const handleSelectCollection = () => {
    setCreateCollectionDialogOpen(true);
  };

  const handleCreateNote = async (title: string) => {
    if (activeVault && selectedVault) {
      const newNote = await createNote(activeVault, title, '', selectedVault.color);
      if (newNote) {
        setSelectedItemId(newNote.id);
        setItemsLocked(false);
      }
    }
  };

  const handleCreateLoginKey = async (siteName: string) => {
    if (activeVault && selectedVault) {
      const newLoginKey = await createLoginKey(activeVault, siteName, null, '', '', null, selectedVault.color);
      if (newLoginKey) {
        setSelectedItemId(newLoginKey.id);
        setItemsLocked(false);
      }
    }
  };

  const handleUpdateLoginKey = (loginKeyId: string, siteName: string, url: string | null, username: string, password: string, details?: string | null) => {
    updateLoginKey(loginKeyId, siteName, url, username, password, details || null, 'blue');
  };

  const handleDeleteLoginKey = (loginKeyId: string) => {
    deleteLoginKey(loginKeyId);
  };

  const handleReorderLoginKeys = (loginKeys: LoginKey[]) => {
    reorderLoginKeys(loginKeys);
  };

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <MainSidebar
              avatar={user?.avatar}
              avatarLoading={avatarLoading}
              onSettingsClick={handleSettingsClick}
              onHelpClick={() => {}}
              onLogoutClick={logout}
              onNewClick={() => setVaultTypeSelectorOpen(true)}
              onContentClick={clearVaultSelect}
            >
              {loadingVaults ? (
                <VaultListSkeleton />
              ) : (
                <VaultList
                  vaults={vaults}
                  collections={collections}
                  activeVault={activeVault}
                  onVaultClick={handleVaultClick}
                  onEditVault={(vault) => setEditingVault(vault)}
                  onEditCollection={(collection) => setEditingCollection(collection)}
                  onCollectionReorder={reorderCollections}
                  onVaultReorderInCollection={reorderVaultsInCollection}
                  unassignedVaults={vaults.filter(v => !collections.some(c => c.vault_ids.includes(v.id)))}
                  onReorderUnassignedVaults={reorderVaults}
                />
              )}
            </MainSidebar>

            <SecondarySidebar
              isLocked={!activeVault}
              animationKey={activeVault || undefined}
              notes={sortedVaultNotes}
              loginKeys={loginKeys}
              filterType={filterType}
              selectedItemId={selectedItemId}
              onFilterChange={setFilterType}
              onSelectItem={setSelectedItemId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSortClick={handleSortNotes}
              onCreateNote={() => setCreateNoteDialogOpen(true)}
              onCreateLoginKey={() => setCreateLoginKeyDialogOpen(true)}
              onEditNote={handleEditNote}
              onEditLoginKey={handleEditLoginKey}
              onReorderNotes={reorderNotes}
              onReorderLoginKeys={handleReorderLoginKeys}
            />

            <VaultContent
              selectedVault={selectedVault}
              vaultNotes={sortedVaultNotes}
              vaultLoginKeys={loginKeys}
              filterType={filterType}
              searchQuery={searchQuery}
              selectedItemId={selectedItemId}
              isLockedByDefault={itemsLocked}
              isLoading={isLoadingContent}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onReorderNotes={reorderNotes}
              onUpdateLoginKey={handleUpdateLoginKey}
              onDeleteLoginKey={handleDeleteLoginKey}
              onReorderLoginKeys={handleReorderLoginKeys}
            />

            <CreateDialog
              open={createDialogOpen}
              title="Create Vault"
              label="Vault Name"
              placeholder="Enter vault name"
              titleIcon={<InventoryIcon />}
              onClose={() => setCreateDialogOpen(false)}
              onCreate={(name) => createVault(name, 'blue')}
            />

            <CreateCollectionDialog
              open={createCollectionDialogOpen}
              onClose={() => setCreateCollectionDialogOpen(false)}
            />

            <CreateDialog
              open={createNoteDialogOpen}
              title="Create Note"
              label="Note Title"
              placeholder="Enter note title"
              titleIcon={<EventNoteIcon />}
              onClose={() => setCreateNoteDialogOpen(false)}
              onCreate={handleCreateNote}
            />

            <CreateDialog
              open={createLoginKeyDialogOpen}
              title="Create Login Key"
              label="Site Name"
              placeholder="Enter site name"
              titleIcon={<KeyIcon />}
              onClose={() => setCreateLoginKeyDialogOpen(false)}
              onCreate={handleCreateLoginKey}
            />

            <VaultEditDialog
              open={!!editingVault}
              vault={editingVault}
              onClose={() => setEditingVault(null)}
              onSave={updateVault}
              onDelete={deleteVault}
            />

            <NoteEditDialog
              open={!!editingNote}
              note={editingNote}
              onClose={() => setEditingNote(null)}
              onSave={(note, image) => {
                updateNote(
                  note.id,
                  note.title,
                  note.content,
                  note.color,
                  image
                );
              }}
              onDelete={deleteNote}
            />

            <LoginkeyEditDialog
              open={!!editingLoginKey}
              loginkey={editingLoginKey}
              onClose={() => setEditingLoginKey(null)}
              onSave={(loginkey, image) => {
                updateLoginKey(
                  loginkey.id,
                  loginkey.site_name,
                  loginkey.url,
                  loginkey.username,
                  loginkey.password,
                  loginkey.details,
                  loginkey.color,
                  image
                );
              }}
              onDelete={deleteLoginKey}
            />

            <CollectionEditDialog
              open={!!editingCollection}
              collection={editingCollection}
              onClose={() => setEditingCollection(null)}
              onSave={updateCollection}
              onDelete={deleteCollection}
            />

            <VaultTypeSelector
              open={vaultTypeSelectorOpen}
              onClose={() => setVaultTypeSelectorOpen(false)}
              onSelectVault={handleSelectVault}
              onSelectCollection={handleSelectCollection}
            />
          </Box>
        }
      />
      <Route path="/settings" element={<SettingsView />} />
    </Routes>
    <LoadingDialog open={isLoadingContent} />
    </>
  );
}

export default MainView;
