import { describe, it, expect } from "bun:test";
import {
  makeMajorArcanaDeck,
  makeMinorArcanaDeck,
  makeFullDeck,
  makeDealer,
  CardDeck,
  Orientation,
} from "./model";

describe("Deck Creation", () => {
  it("should create a Major Arcana deck with 22 cards", () => {
    const deck = makeMajorArcanaDeck();
    expect(deck.length).toBe(22);
  });

  it("should create a Minor Arcana deck with 56 cards", () => {
    const deck = makeMinorArcanaDeck();
    expect(deck.length).toBe(56);
  });

  it("should create a Full deck with 78 cards", () => {
    const deck = makeFullDeck();
    expect(deck.length).toBe(78);
  });
});

describe("Dealer", () => {
  it("should deal the correct number of cards", async () => {
    const deck = makeFullDeck();
    const getOrientation = async () => "Upright" as Orientation;
    const getRandomCardNum = async (len: number) => 0;
    const dealer = makeDealer(getOrientation, getRandomCardNum);
    const hand = dealer(deck, 5);
    let count = 0;
    for await (const card of hand) {
      count++;
    }
    expect(count).toBe(5);
  });

  it("should remove dealt cards from the deck", async () => {
    const deck: CardDeck = [
      { type: "MajorArkana", value: "The Fool" },
      { type: "MajorArkana", value: "The Magician" },
      { type: "MajorArkana", value: "The High Priestess" },
    ];
    const getOrientation = async () => "Upright" as Orientation;
    const getRandomCardNum = async (len: number) => len - 1;
    const dealer = makeDealer(getOrientation, getRandomCardNum);
    const hand = dealer(deck, 2);
    const dealtCards = [];
    for await (const card of hand) {
      dealtCards.push(card);
    }
    expect(dealtCards.length).toBe(2);
    expect(dealtCards[0].card.value).toBe("The High Priestess");
    expect(dealtCards[1].card.value).toBe("The Magician");
  });
});
