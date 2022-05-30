import { Entity } from "../firestore-crud.service";
import { PetHistoryModel } from "./pet-history.model";

export class PetModel implements Entity  {
  id?: string;
  avatar: string;
  name: string;
  birthDay: string;
  breed: string;
  species: string;
  sex: string;
  code: string;
  customerId: string;
  histories? : PetHistoryModel[] ;
}
