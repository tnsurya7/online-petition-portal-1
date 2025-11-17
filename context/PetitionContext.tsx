import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { Petition, PetitionStatus } from "../types";

const API_BASE = "https://petition-backend-ow0l.onrender.com/api";

interface PetitionContextType {
  petitions: Petition[];
  refreshPetitionsFromDB: () => Promise<void>;
  updatePetition: (
    code: string,
    newStatus: PetitionStatus,
    newRemarks: string
  ) => void;
  deletePetitionLocal: (code: string) => void;
}

const PetitionContext = createContext<PetitionContextType | undefined>(
  undefined
);

export const PetitionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);

  const refreshPetitionsFromDB = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/petitions`);
      const data = await res.json();

      const normalized: Petition[] = data.map((p: any) => ({
        id: p.id ?? p.petition_code,
        petition_code: p.petition_code,
        name: p.name,
        address: p.address,
        phone: p.phone,
        pincode: p.pincode,
        email: p.email,
        title: p.title,
        category: p.category,
        description: p.description,
        attachment: p.attachment ?? null,
        status: p.status,
        remarks: p.remarks ?? "",
        date: p.date || p.created_at || "",
      }));

      setPetitions(normalized);
      console.log("Loaded petitions:", normalized.map((p) => p.petition_code));
    } catch (error) {
      console.error("❌ Failed to refresh petitions:", error);
    }
  }, []);

  const updatePetition = (
    code: string,
    newStatus: PetitionStatus,
    newRemarks: string
  ) => {
    setPetitions((prev) =>
      prev.map((p) =>
        p.petition_code === code
          ? { ...p, status: newStatus, remarks: newRemarks }
          : p
      )
    );
  };

  const deletePetitionLocal = (code: string) => {
    setPetitions((prev) => prev.filter((p) => p.petition_code !== code));
  };

  return (
    <PetitionContext.Provider
      value={{
        petitions,
        refreshPetitionsFromDB,
        updatePetition,
        deletePetitionLocal,
      }}
    >
      {children}
    </PetitionContext.Provider>
  );
};

export const usePetitions = () => {
  const ctx = useContext(PetitionContext);
  if (!ctx)
    throw new Error("usePetitions must be used within a PetitionProvider");
  return ctx;
};