import { useState, useEffect, useRef } from 'react';
import { Note } from '../types/note';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';
import { reorderItems } from './usePositionUtils';

interface UseNotesReturn {
  // States
  notes: Note[];
  
  // Loading states
  lockedNotes: Set<string>;
  
  // Load functions
  loadNotes: (vaultId: string) => Promise<void>;
  
  // CRUD Notes
  createNote: (vaultId: string, title: string, content: string) => Promise<Note | undefined>;
  updateNote: (noteId: string, title: string, content: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  reorderNotes: (notes: Note[]) => Promise<void>;
  
  // Internal
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  clearNotes: () => void;
}

export function useNotes(): UseNotesReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [notes, setNotes] = useState<Note[]>([]);
  const [lockedNotes, setLockedNoteIds] = useState<Set<string>>(new Set());
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLockedNoteIds(new Set());
    }
    prevUserRef.current = user;
  }, [user]);

  // Load functions
  const loadNotes = async (vaultId: string) => {
    if (!user) return;
    const notesData = await invoke<Note[]>('get_notes_decrypted', {
      vaultId,
      userId: user.id,
    });
    setNotes(notesData);
    setLockedNoteIds(new Set(notesData.map((n) => n.id)));
  };

  // CRUD Notes
  const createNote = async (vaultId: string, title: string, content: string) => {
    if (!user) return undefined;
    const newNote = await invoke<Note>('create_note', {
      vaultId,
      title,
      content,
      userId: user.id,
    });
    setNotes((prev) => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    if (!user) return;
    await invoke('update_note', {
      noteId,
      title,
      content,
      userId: user.id,
    });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, title, content, updated_at: Date.now() } : n
      )
    );
  };

  const deleteNote = async (noteId: string) => {
    await invoke('delete_note', { noteId });
    const remainingNotes = notes
      .filter((n) => n.id !== noteId)
      .sort((a, b) => a.position - b.position);
    for (let i = 0; i < remainingNotes.length; i++) {
      await invoke('update_note_position', { noteId: remainingNotes[i].id, newPosition: i });
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const reorderNotes = async (reorderedNotes: Note[]) => {
    const updatedNotes = reorderItems(reorderedNotes);
    setNotes(updatedNotes);
    for (let i = 0; i < updatedNotes.length; i++) {
      await invoke('update_note_position', { noteId: updatedNotes[i].id, newPosition: i });
    }
  };

  const clearNotes = () => {
    setNotes([]);
    setLockedNoteIds(new Set());
  };

  return {
    notes,
    lockedNotes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    setNotes,
    clearNotes,
  };
}
