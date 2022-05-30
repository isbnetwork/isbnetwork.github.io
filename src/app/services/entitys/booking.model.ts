import { Entity } from "../firestore-crud.service";

export class BookingModel implements Entity {
  id?: string;
  userName: string;
  petName: string;
  priority: string;
  time: Date;
  note: string;
  cusId: string;
  brand: string;
}
