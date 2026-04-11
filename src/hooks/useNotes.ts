import { useState, useEffect, useRef } from 'react';
import { Note } from '../types/note';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';
import { reorderItems, parseImageToBytes } from './usePositionUtils';

interface UseNotesReturn {
  // States
  notes: Note[];
  
  // Load functions
  loadNotes: (vaultId: string) => Promise<void>;
  
  // CRUD Notes
  createNote: (vaultId: string, title: string, content: string, color?: string) => Promise<Note | undefined>;
  updateNote: (noteId: string, title: string, content: string, color?: string, image?: string | null) => Promise<void>;
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
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setNotes([]);
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
  };

  // CRUD Notes
  const createNote = async (vaultId: string, title: string, content: string, color: string = 'blue') => {
    if (!user) return undefined;
    const newNote = await invoke<Note>('create_note', {
      vaultId,
      title,
      content,
      color,
      userId: user.id,
    });
    setNotes((prev) => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (noteId: string, title: string, content: string, color: string = 'blue', image?: string | null) => {
    if (!user) return;
    const imageBytes = parseImageToBytes(image);
    await invoke('update_note', {
      noteId,
      title,
      content,
      color,
      image: imageBytes,
      userId: user.id,
    });
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, note_name: title, content, color, image: image === null ? undefined : image, updated_at: Date.now() } : n
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
  };

  return {
    notes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    setNotes,
    clearNotes,
  };
}
