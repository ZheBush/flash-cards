export type UserRole = 'guest' | 'user' | 'manager';

export interface User {
  id?: string;
  email?: string;
  role: UserRole;
  token?: string;
  tokenType?: string;
}

export interface UserAuth {
  email: string;
  token: string;
  tokenType: string;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  cardListId: string;
  userId: string;
}

export interface CardList {
  id: string;
  title: string;
  cards: Card[];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  detail?: string;
  access_token?: string;
  token_type?: string;
  card_list_id?: string;
  title?: string;
}

export interface LocationState {
  cardListId?: string;
  title?: string;
}

export interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  members_count: number;
}

export interface CardData {
  id: string;
  question: string;
  answer: string;
  card_list_id: string;
  user_id: string;
}

export interface CardListData {
  id: string;
  title: string;
  cards: CardData[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: string;
}

export interface Group {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  members_count?: number;
}