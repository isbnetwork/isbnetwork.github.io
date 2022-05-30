import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
export interface ImageUrl {
  url: string;
  lastUpdateDate: Timestamp;
}
export interface History {
 time: Timestamp;
 temperature: number;
 weight: number;
 images: ImageUrl[];
 lesions: string;
 treatment: string;
}
export interface Pet {
  name: string ;
  avatar: string;
  birthday: Timestamp;
  sex: string;
  code: string;
  species: string;
  description:string;
}
export interface Customer {
  fullName: string;
  phone: string;
  address: string;
  avatar: string;
  petTitle: string[];
  pets: Pet[]
}
