export type PetitionCategory =
  | "road"
  | "water"
  | "health"
  | "education"
  | "electricity"
  | "other";

export type PetitionStatus =
  | "pending"
  | "review"
  | "resolved"
  | "rejected";

export interface Petition {
  // DB identifiers
  petition_code: string;       // PET000010
  id: string | number;         // numeric ID from DB

  // Citizen info
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;

  // Petition content
  title: string;
  category: PetitionCategory;
  description: string;

  // File
  attachment?: string | null;  // "uploads/xxxxx.png" or null

  // Status
  status: PetitionStatus;
  remarks: string;

  // Dates
  date: string;                // use `date` or `created_at` from DB
}

export interface ChatMessage {
  type: "user" | "bot";
  text: string;
}