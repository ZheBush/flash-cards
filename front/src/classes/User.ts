import { CardList } from './CardList.ts';

export class User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  history: CardList[];
  createdAt: Date;

  constructor(
    id: string, 
    email: string, 
    password: string, 
    fullName: string, 
    createdAt: Date,
    history: CardList[] = []
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.history = history;
    this.createdAt = createdAt;
  }
}

export default User;