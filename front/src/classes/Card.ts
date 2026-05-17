export class Card {
  id: string;
  question: string;
  answer: string;
  userId: string;
  cardListId: string;

  constructor(id: string, question: string, answer: string, cardListId: string, userId: string) {
    this.id = id;
    this.question = question;
    this.answer = answer;
    this.userId = userId;
    this.cardListId = cardListId;
  }
}

export default Card;