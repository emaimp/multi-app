import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventNoteIcon from '@mui/icons-material/EventNote';
import KeyIcon from '@mui/icons-material/Key';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { LoadingDialog, CreateDialog } from '../components/ui';
import { CreateCollectionDialog } from '../components/main/mainsidebar/CreateCollectionDialog';
import { useUser } from '../context/AuthContext';
import { useVaults } from '../context/VaultContext';
import { useBackend } from '../hooks/useBackend';
import {
  VaultListSkeleton,
  VaultEditDialog,
  VaultTypeSelector,
} from '../components/main/vault';
import { MainSidebar } from '../components/main/mainsidebar';
import { SecondarySidebar } from '../components/main/secondarysidebar';
import { NoteEditDialog } from '../components/main/vault/note';
import { LoginkeyEditDialog } from '../components/main/vault/loginkey';
import { CreditCardEditDialog } from '../components/main/vault/credit_card';
import { IdCardEditDialog } from '../components/main/vault/id_card';
import { Vault } from '../types/vault';
import { IdCard } from '../types/id_card';
import { CreditCard } from '../types/credit_card';
import { LoginKey } from '../types/loginkey';
import { Note } from '../types/note';
import { VaultContent } from '../components/main/vault';
import { SettingsView } from './user/SettingsView';

export function MainView() {
  const navigate = useNavigate();
  const { user, logout, isLoadingContent, setIsLoadingContent, setUser } = useUser();
  const { invoke } = useBackend();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const {
    vaults,
    collections,
    idCards,
    creditCards,
    loginKeys,
    notes,
    activeVault,
    selectVault,
    clearVaultSelect,
    loadingVaults,
    loadVaults,
    createVault,
    updateVault,
    deleteVault,
    reorderVaultsUnassigned,
    reorderVaultsInCollection,
    createIdCard,
    updateIdCard,
    deleteIdCard,
    reorderIdCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    reorderCreditCards,
    createLoginKey,
    updateLoginKey,
    deleteLoginKey,
    reorderLoginKeys,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
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
  const [createIdCardDialogOpen, setCreateIdCardDialogOpen] = useState(false);
  const [createCreditCardDialogOpen, setCreateCreditCardDialogOpen] = useState(false);
  const [createLoginKeyDialogOpen, setCreateLoginKeyDialogOpen] = useState(false);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const [vaultTypeSelectorOpen, setVaultTypeSelectorOpen] = useState(false);
  const [editingVault, setEditingVault] = useState<Vault | null>(null);
  const [editingIdCard, setEditingIdCard] = useState<IdCard | null>(null);
  const [editingCreditCard, setEditingCreditCard] = useState<CreditCard | null>(null);
  const [editingLoginKey, setEditingLoginKey] = useState<LoginKey | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'loginKeys' | 'notes' | 'idCards' | 'creditCards'>('all');
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

  const handleEditIdCard = (idCard: IdCard) => {
    setEditingIdCard(idCard);
  };

  const handleEditCreditCard = (creditCard: CreditCard) => {
    setEditingCreditCard(creditCard);
  };

  const handleEditLoginKey = (loginkey: LoginKey) => {
    setEditingLoginKey(loginkey);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
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

  const handleCreateIdCard = async (idName: string) => {
    if (activeVault && selectedVault) {
      const newIdCard = await createIdCard(activeVault, idName, '', '', '', selectedVault.color);
      if (newIdCard) {
        setSelectedItemId(newIdCard.id);
        setItemsLocked(false);
      }
    }
  };

  const handleCreateCreditCard = async (cardName: string) => {
    if (activeVault && selectedVault) {
      const newCreditCard = await createCreditCard(activeVault, cardName, '', '', '', '', selectedVault.color);
      if (newCreditCard) {
        setSelectedItemId(newCreditCard.id);
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

  const handleCreateNote = async (title: string) => {
    if (activeVault && selectedVault) {
      const newNote = await createNote(activeVault, title, '', selectedVault.color);
      if (newNote) {
        setSelectedItemId(newNote.id);
        setItemsLocked(false);
      }
    }
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
              vaults={vaults}
              collections={collections}
              activeVault={activeVault}
              onVaultClick={handleVaultClick}
              onEditVault={(vault) => setEditingVault(vault)}
              onCollectionReorder={reorderCollections}
              onVaultReorderInCollection={reorderVaultsInCollection}
              unassignedVaults={vaults.filter(v => !collections.some(c => c.vault_ids.includes(v.id)))}
              onReorderUnassignedVaults={(vaults) => reorderVaultsUnassigned(vaults, collections.flatMap(c => c.vault_ids))}
            >
              {loadingVaults && <VaultListSkeleton />}
            </MainSidebar>

            <SecondarySidebar
              isLocked={!activeVault}
              isLoadingContent={isLoadingContent}
              animationKey={activeVault || undefined}
              idCards={idCards}
              creditCards={creditCards}
              loginKeys={loginKeys}
              notes={sortedVaultNotes}
              filterType={filterType}
              selectedItemId={selectedItemId}
              onFilterChange={setFilterType}
              onSelectItem={setSelectedItemId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSortClick={handleSortNotes}
              onCreateIdCard={() => setCreateIdCardDialogOpen(true)}
              onCreateCreditCard={() => setCreateCreditCardDialogOpen(true)}
              onCreateLoginKey={() => setCreateLoginKeyDialogOpen(true)}
              onCreateNote={() => setCreateNoteDialogOpen(true)}
              onEditIdCard={handleEditIdCard}
              onEditCreditCard={handleEditCreditCard}
              onEditLoginKey={handleEditLoginKey}
              onEditNote={handleEditNote}
              onReorderIdCards={reorderIdCards}
              onReorderCreditCards={reorderCreditCards}
              onReorderLoginKeys={reorderLoginKeys}
              onReorderNotes={reorderNotes}
            />

            <VaultContent
              selectedVault={selectedVault}
              vaultIdCards={idCards}
              vaultCreditCards={creditCards}
              vaultLoginKeys={loginKeys}
              vaultNotes={sortedVaultNotes}
              filterType={filterType}
              searchQuery={searchQuery}
              selectedItemId={selectedItemId}
              isLockedByDefault={itemsLocked}
              isLoading={isLoadingContent}
              onUpdateIdCard={updateIdCard}
              onUpdateCreditCard={updateCreditCard}
              onUpdateLoginKey={updateLoginKey}
              onUpdateNote={updateNote}
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
              open={createIdCardDialogOpen}
              title="Create ID Card"
              label="ID Name"
              placeholder="Enter ID name"
              titleIcon={<KeyIcon />}
              onClose={() => setCreateIdCardDialogOpen(false)}
              onCreate={handleCreateIdCard}
            />

            <CreateDialog
              open={createCreditCardDialogOpen}
              title="Create Credit Card"
              label="Card Name"
              placeholder="Enter card name"
              titleIcon={<CreditCardIcon />}
              onClose={() => setCreateCreditCardDialogOpen(false)}
              onCreate={handleCreateCreditCard}
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

            <CreateDialog
              open={createNoteDialogOpen}
              title="Create Note"
              label="Note Title"
              placeholder="Enter note title"
              titleIcon={<EventNoteIcon />}
              onClose={() => setCreateNoteDialogOpen(false)}
              onCreate={handleCreateNote}
            />

            <VaultEditDialog
              open={!!editingVault}
              vault={editingVault}
              collections={collections}
              onClose={() => setEditingVault(null)}
              onSave={updateVault}
              onDelete={deleteVault}
              onUpdateCollection={(vaultId, collectionId) => {
                if (!collectionId) {
                  const currentCollection = collections.find(c => c.vault_ids.includes(vaultId));
                  if (currentCollection) {
                    const newVaultIds = currentCollection.vault_ids.filter(id => id !== vaultId);
                    reorderVaultsInCollection(currentCollection.id, newVaultIds);
                  }
                } else {
                  const targetCollection = collections.find(c => c.id === collectionId);
                  if (targetCollection) {
                    const currentCollection = collections.find(c => c.vault_ids.includes(vaultId));
                    if (currentCollection && currentCollection.id !== collectionId) {
                      const newVaultIds = currentCollection.vault_ids.filter(id => id !== vaultId);
                      reorderVaultsInCollection(currentCollection.id, newVaultIds);
                    }
                    const newVaultIds = [...targetCollection.vault_ids, vaultId];
                    reorderVaultsInCollection(collectionId, newVaultIds);
                  }
                }
              }}
            />

            <IdCardEditDialog
              open={!!editingIdCard}
              idCard={editingIdCard}
              onClose={() => setEditingIdCard(null)}
              onSave={(idCard, image) => {
                updateIdCard(
                  idCard.id,
                  idCard.id_name,
                  idCard.id_type,
                  idCard.full_name,
                  idCard.id_number,
                  idCard.color,
                  image
                );
              }}
              onDelete={deleteIdCard}
            />

            <CreditCardEditDialog
              open={!!editingCreditCard}
              creditCard={editingCreditCard}
              onClose={() => setEditingCreditCard(null)}
              onSave={(creditCard, image) => {
                updateCreditCard(
                  creditCard.id,
                  creditCard.card_name,
                  creditCard.holder_name,
                  creditCard.card_number,
                  creditCard.expiry,
                  creditCard.cvv,
                  creditCard.color,
                  image
                );
              }}
              onDelete={deleteCreditCard}
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
