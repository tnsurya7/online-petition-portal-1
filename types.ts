
export type PetitionCategory = 'road' | 'water' | 'health' | 'education' | 'electricity' | 'other';
export type PetitionStatus = 'pending' | 'review' | 'resolved' | 'rejected';

export interface Petition {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: PetitionCategory;
  description: string;
  file?: File;
  status: PetitionStatus;
  date: string;
  remarks: string;
}

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}
