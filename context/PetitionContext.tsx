import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { Petition } from '../types';

// 🧩 Define context type
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
  refreshPetitionsFromDB: () => Promise<void>; // ✅ For dashboard auto-refresh
}

// 🧩 Create Context
const PetitionContext = createContext<PetitionContextType | undefined>(undefined);

// 🧩 Provider Component
export const PetitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);

  /**
   * ✅ Add a new petition (used in Citizen Portal form)
   */
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

  /**
   * ✅ Update petition locally (instant frontend change)
   */
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

  /**
   * ✅ Refresh petitions from database (for admin dashboard)
   */
  const refreshPetitionsFromDB = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/petitions');
      const data = await res.json();

      // 🔄 Normalize backend structure
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
      console.log('✅ Loaded petitions IDs:', normalized.map((p: any) => p.id));
    } catch (error) {
      console.error('❌ Failed to refresh petitions:', error);
    }
  }, []);

  /**
   * ✅ Get petition by ID or phone (for citizen tracking)
   * Supports formats like "PET123456", "123456", or numeric IDs
   */
  const getPetitionByIdOrPhone = (input: string): Petition | undefined => {
    if (!input) return undefined;

    const clean = input.trim().toUpperCase();

    // 🔹 Step 1: Match by phone number (exact)
    const byPhone = petitions.find((p) => p.phone === clean);
    if (byPhone) return byPhone;

    // 🔹 Step 2: Match by petition ID (with flexible pattern)
    const byId = petitions.find((p) => {
      const storedId = String(p.id || '').toUpperCase();

      // Direct match (handles PET123 or numeric)
      if (storedId === clean) return true;

      // Remove PET prefix from both sides and compare numeric parts
      const strip = (s: string) => s.replace(/^PET/i, '').replace(/^0+/, '');
      if (strip(storedId) === strip(clean)) return true;

      // Match numeric form if applicable
      const numericStored = Number(strip(storedId));
      const numericInput = Number(strip(clean));
      if (!Number.isNaN(numericStored) && numericStored === numericInput)
        return true;

      return false;
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
        refreshPetitionsFromDB, // ✅ exposed for dashboard
      }}
    >
      {children}
    </PetitionContext.Provider>
  );
};

/**
 * ✅ Custom hook to use petitions safely
 */
export const usePetitions = () => {
  const context = useContext(PetitionContext);
  if (!context)
    throw new Error('usePetitions must be used within a PetitionProvider');
  return context;
};