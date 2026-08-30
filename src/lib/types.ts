export type Role = "learner" | "curator";

export type Format =
  | "Museum Tour"
  | "Lecdem"
  | "Walking Tour"
  | "Roundtable"
  | "Workshop";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Experience {
  id: string;
  curator_id: string;
  title: string;
  description: string;
  category: string;
  format: Format;
  location: string;
  event_date: string; // ISO date
  event_time: string; // e.g. "6:30 PM"
  price: number;
  capacity: number;
  spots_taken: number;
  image_url: string | null;
  is_exclusive: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  experience_id: string;
  user_id: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  experience?: Experience;
}
