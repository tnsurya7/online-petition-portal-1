import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { Petition } from '../types';

// Context Type
interface PetitionContextType {
  petitions: Petition[];
  setPetitions: React.Dispatch<React.SetStateAction<Petition[]>>;
  addPetition: (
    petition: Omit<Petition, 'id' | 'status' | 'date' | 'remarks'>
  ) => string;
  updatePetition: (
    id: string,
    newStatus: Petition['status'],
    newRemarks: string
  ) => void;
  getPetitionByIdOrPhone: (idOrPhone: string) => Petition | undefined;
  refreshPetitionsFromDB: () => Promise<void>;
}

// Context
const PetitionContext = createContext<PetitionContextType | undefined>(
  undefined
);

// Provider
export const PetitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);

  // Add petition
  const addPetition = (
    petitionData: Omit<Petition, 'id' | 'status' | 'date' | 'remarks'>
  ) => {
    const newId = `PET${Date.now().toString().slice(-6)}`;

    const newPetition: Petition = {
      id: newId,
      ...petitionData,
      status: 'pending',
      date: new Date().toLocaleDateString(),
      remarks: '',
    };

    setPetitions((prev) => [...prev, newPetition]);
    return newId;
  };

  // Update petition
  const updatePetition = (
    id: string,
    newStatus: Petition['status'],
    newRemarks: string
  ) => {
    setPetitions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: newStatus, remarks: newRemarks } : p
      )
    );
  };

  // Refresh petitions from DB
  const refreshPetitionsFromDB = useCallback(async () => {
    try {
      const res = await fetch(
        'https://petition-backend-ow0l.onrender.com/api/petitions'
      );
      const data = await res.json();

      const normalized = data.map((p: any) => ({
        id: p.id || p.petition_id,
        name: p.name || p.full_name || '',
        category: p.category || p.petition_category || '',
        status: (p.status || p.petition_status || 'pending').toLowerCase(),
        phone: p.phone || p.mobile || '',
        email: p.email || '',
        description: p.description || p.petition_description || '',
        date: p.date || p.created_at || '',
        remarks: p.remarks || '',
      }));

      setPetitions(normalized);
      console.log('Loaded petitions:', normalized.map((p: any) => p.id));
    } catch (error) {
      console.error('Failed to refresh petitions:', error);
    }
  }, []);

  // Search petition by ID OR phone
  const getPetitionByIdOrPhone = (input: string): Petition | undefined => {
    if (!input) return undefined;

    const clean = input.trim().toUpperCase();

    // Match by phone
    const byPhone = petitions.find((p) => p.phone === clean);
    if (byPhone) return byPhone;

    // Match by ID
    const byId = petitions.find((p) => {
      const storedId = String(p.id || '').toUpperCase();

      if (storedId === clean) return true;

      const strip = (s: string) => s.replace(/^PET/i, '').replace(/^0+/, '');

      if (strip(storedId) === strip(clean)) return true;

      const numericStored = Number(strip(storedId));
      const numericInput = Number(strip(clean));

      return !isNaN(numericStored) && numericStored === numericInput;
    });

    return byId;
  };

  return (
    <PetitionContext.Provider
      value={{
        petitions,
        setPetitions,
        addPetition,
        updatePetition,
        getPetitionByIdOrPhone,
        refreshPetitionsFromDB,
      }}
    >
      {children}
    </PetitionContext.Provider>
  );
};

// Hook
export const usePetitions = () => {
  const context = useContext(PetitionContext);
  if (!context)
    throw new Error('usePetitions must be used within a PetitionProvider');
  return context;
};