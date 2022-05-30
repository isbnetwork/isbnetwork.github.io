import { Entity } from "../firestore-crud.service";
import { PetModel } from "./pet.model";
export class CustomerModel  implements Entity  {
  id?: string;
  fullName: string;
  phone: string ;
  address: string;
  desc: string;
  url: string;
  search: string;
  seqNo: number;
  pets?: PetModel[];
}
