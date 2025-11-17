import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { Petition, PetitionStatus } from "../types";

interface PetitionContextType {
  petitions: Petition[];
  setPetitions: React.Dispatch<React.SetStateAction<Petition[]>>;
  updatePetition: (
    petitionCode: string,
    newStatus: PetitionStatus,
    newRemarks: string
  ) => void;
  getPetitionByIdOrPhone: (idOrPhone: string) => Petition | undefined;
  refreshPetitionsFromDB: () => Promise<void>;
}

const PetitionContext = createContext<PetitionContextType | undefined>(
  undefined
);

export const PetitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);

  /* 🔵 Update petition in state instantly */
  const updatePetition = (
    petitionCode: string,
    newStatus: PetitionStatus,
    newRemarks: string
  ) => {
    setPetitions((prev) =>
      prev.map((p) =>
        p.petition_code === petitionCode
          ? { ...p, status: newStatus, remarks: newRemarks }
          : p
      )
    );
  };

  /* 🔵 Load petitions from backend */
  const refreshPetitionsFromDB = useCallback(async () => {
    try {
      const res = await fetch(
        "https://petition-backend-ow0l.onrender.com/api/petitions"
      );

      const data = await res.json();

      const normalized = data.map((p: any) => ({
        petition_code: p.petition_code,
        id: p.id,
        name: p.name || "",
        phone: p.phone || "",
        email: p.email || "",
        title: p.title || "",
        category: p.category || "",
        description: p.description || "",
        status: (p.status || "pending").toLowerCase(),
        remarks: p.remarks || "",
        date: p.created_at || "",
      }));

      setPetitions(normalized);
      console.log("Loaded petitions:", normalized.map((p) => p.petition_code));
    } catch (error) {
      console.error("Failed to refresh petitions:", error);
    }
  }, []);

  /* 🔍 Search by ID or Phone */
  const getPetitionByIdOrPhone = (input: string): Petition | undefined => {
    if (!input) return undefined;

    const clean = input.trim().toUpperCase();

    const byPhone = petitions.find((p) => p.phone === clean);
    if (byPhone) return byPhone;

    const byId = petitions.find((p) => p.petition_code === clean);
    if (byId) return byId;

    return undefined;
  };

  return (
    <PetitionContext.Provider
      value={{
        petitions,
        setPetitions,
        updatePetition,
        getPetitionByIdOrPhone,
        refreshPetitionsFromDB,
      }}
    >
      {children}
    </PetitionContext.Provider>
  );
};

export const usePetitions = () => {
  const context = useContext(PetitionContext);
  if (!context)
    throw new Error("usePetitions must be used within a PetitionProvider");
  return context;
};