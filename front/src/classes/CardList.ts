import { Card } from './Card.ts';

export class CardList {
  id: string;
  title: string;
  cards: Card[];

  constructor(id: string, title: string, cards: Card[] = []) {
    this.id = id;
    this.title = title;
    this.cards = cards;
  }
}

export default CardList;