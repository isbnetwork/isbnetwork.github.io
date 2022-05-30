import { Entity } from "../firestore-crud.service";
import { Role } from "../role.enum";

export interface User {

}
export class UserModel implements Entity {
  id?: string;
  passport: string;
  displayName: string;
  phone: string;
  email: string;
  password: string;
  date: Date;
  uid: string;
  address: string;
  emailVerified: boolean;
  photoURL?: string;
  role?: Role;
  active?: boolean;
  token?: string;
}

export class UserDoctor {
  displayName: string;
  role: string
}
