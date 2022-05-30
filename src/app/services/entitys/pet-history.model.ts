import { Entity } from "../firestore-crud.service";

export class PetHistoryModel implements Entity {
  id?: string;
  date: Date;
  temperature: number;
  weight: number;
  treatment: string;
  lesions: string;
  doctor: string;
  images: string[];
}
