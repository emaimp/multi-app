import { useState, useEffect, useRef } from 'react';
import { CreditCard } from '../types/credit_card';
import { useUser } from '../context/AuthContext';
import { useBackend } from './useBackend';
import { parseImageToBytes } from './usePositionUtils';

interface UseCreditCardsReturn {
  creditCards: CreditCard[];
  loadCreditCards: (vaultId: string) => Promise<void>;
  createCreditCard: (vaultId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color?: string) => Promise<CreditCard | undefined>;
  updateCreditCard: (creditCardId: string, cardName: string, holderName: string, cardNumber: string, expiry: string, cvv: string, color?: string, image?: string | null) => Promise<void>;
  deleteCreditCard: (creditCardId: string) => Promise<void>;
  reorderCreditCards: (creditCards: CreditCard[]) => Promise<void>;
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCard[]>>;
  clearCreditCards: () => void;
}

export function useCreditCards(): UseCreditCardsReturn {
  const { user } = useUser();
  const { invoke } = useBackend();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (!user) {
      setCreditCards([]);
    }
    prevUserRef.current = user;
  }, [user]);

  const loadCreditCards = async (vaultId: string) => {
    if (!user) return;
    const creditCardsData = await invoke<CreditCard[]>('get_credit_cards_decrypted', {
      vaultId,
      userId: user.id,
    });
    setCreditCards(creditCardsData);
  };

  const createCreditCard = async (
    vaultId: string,
    cardName: string,
    holderName: string,
    cardNumber: string,
    expiry: string,
    cvv: string,
    color: string = 'blue'
  ) => {
    if (!user) return undefined;
    const newCreditCard = await invoke<CreditCard>('create_credit_card', {
      vaultId,
      cardName,
      holderName,
      cardNumber,
      expiry,
      cvv,
      color,
      userId: user.id,
    });
    setCreditCards((prev) => [...prev, newCreditCard]);
    return newCreditCard;
  };

  const updateCreditCard = async (
    creditCardId: string,
    cardName: string,
    holderName: string,
    cardNumber: string,
    expiry: string,
    cvv: string,
    color?: string,
    image?: string | null
  ) => {
    const imageBytes = parseImageToBytes(image);
    await invoke('update_credit_card', {
      cardId: creditCardId,
      cardName,
      holderName,
      cardNumber,
      expiry,
      cvv,
      color: color || 'blue',
      image: imageBytes,
      userId: user?.id,
    });
    setCreditCards((prev) =>
      prev.map((cc) =>
        cc.id === creditCardId
          ? { ...cc, card_name: cardName, holder_name: holderName, card_number: cardNumber, expiry, cvv, color: color || cc.color }
          : cc
      )
    );
  };

  const deleteCreditCard = async (creditCardId: string) => {
    await invoke('delete_credit_card', { cardId: creditCardId });
    setCreditCards((prev) => prev.filter((cc) => cc.id !== creditCardId));
  };

  const reorderCreditCards = async (reorderedCreditCards: CreditCard[]) => {
    const updatedCreditCards = reorderedCreditCards.map((cc, i) => ({ ...cc, position: i }));
    setCreditCards(updatedCreditCards);
    for (let i = 0; i < updatedCreditCards.length; i++) {
      await invoke('update_credit_card_position', { cardId: updatedCreditCards[i].id, newPosition: i });
    }
  };

  const clearCreditCards = () => {
    setCreditCards([]);
  };

  return {
    creditCards,
    loadCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    reorderCreditCards,
    setCreditCards,
    clearCreditCards,
  };
}