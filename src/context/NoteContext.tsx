import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note } from '../types/note';

interface NoteContextType {
  notes: Note[];
  addNote: (name: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (name: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      name,
      color: 'primary',
      createdAt: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within NoteProvider');
  }
  return context;
}
