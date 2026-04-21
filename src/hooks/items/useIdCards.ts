import { useState, useEffect, useRef } from 'react';
import { IdCard } from '../../types/id_card';
import { useUser } from '../../context/AuthContext';
import { useBackend } from '../core/useBackend';
import { parseImageToBytes } from '../sensors/usePositionUtils';

interface UseIdCardsReturn {
  idCards: IdCard[];
  loadIdCards: (vaultId: string) => Promise<void>;
  createIdCard: (vaultId: string, idName: string, idType: string, fullName: string, idNumber: string, color?: string) => Promise<IdCard | undefined>;
  updateIdCard: (idCardId: string, idName: string, idType: string, fullName: string, idNumber: string, color?: string, image?: string | null) => Promise<void>;
  deleteIdCard: (idCardId: string) => Promise<void>;
  reorderIdCards: (idCards: IdCard[]) => Promise<void>;
  setIdCards: React.Dispatch<React.SetStateAction<IdCard[]>>;
  clearIdCards: () => void;
}

export function useIdCards(): UseIdCardsReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [idCards, setIdCards] = useState<IdCard[]>([]);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setIdCards([]);
    }
    prevUserRef.current = user;
  }, [user]);

  const loadIdCards = async (vaultId: string) => {
    if (!user) return;
    const idCardsData = await invoke<IdCard[]>('get_id_cards_decrypted', {
      vaultId,
      userId: user.id,
    });
    setIdCards(idCardsData);
  };

  const createIdCard = async (
    vaultId: string,
    idName: string,
    idType: string,
    fullName: string,
    idNumber: string,
    color: string = 'blue'
  ) => {
    if (!user) return undefined;
    const newIdCard = await invoke<IdCard>('create_id_card', {
      vaultId,
      idName,
      idType,
      fullName,
      idNumber,
      color,
      userId: user.id,
    });
    setIdCards((prev) => [...prev, newIdCard]);
    return newIdCard;
  };

  const updateIdCard = async (
    idCardId: string,
    idName: string,
    idType: string,
    fullName: string,
    idNumber: string,
    color?: string,
    image?: string | null
  ) => {
    const imageBytes = parseImageToBytes(image);
    await invoke('update_id_card', {
      cardId: idCardId,
      idName,
      idType,
      fullName,
      idNumber,
      color: color || 'blue',
      image: imageBytes,
      userId: user?.id,
    });
    setIdCards((prev) =>
      prev.map((ic) =>
        ic.id === idCardId
          ? { ...ic, id_name: idName, id_type: idType, full_name: fullName, id_number: idNumber, color: color || ic.color }
          : ic
      )
    );
  };

  const deleteIdCard = async (idCardId: string) => {
    await invoke('delete_id_card', { cardId: idCardId });
    setIdCards((prev) => prev.filter((ic) => ic.id !== idCardId));
  };

  const reorderIdCards = async (reorderedIdCards: IdCard[]) => {
    const updatedIdCards = reorderedIdCards.map((ic, i) => ({ ...ic, position: i }));
    setIdCards(updatedIdCards);
    for (let i = 0; i < updatedIdCards.length; i++) {
      await invoke('update_id_card_position', { cardId: updatedIdCards[i].id, newPosition: i });
    }
  };

  const clearIdCards = () => {
    setIdCards([]);
  };

  return {
    idCards,
    loadIdCards,
    createIdCard,
    updateIdCard,
    deleteIdCard,
    reorderIdCards,
    setIdCards,
    clearIdCards,
  };
}
