
import { describe, it, expect } from "bun:test";
import {
  makeMajorArcanaDeck,
  makeMinorArcanaDeck,
  makeFullDeck,
  makeDealer,
  TarotCard,
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

  it("should create a Full Deck with 78 cards", () => {
    const deck = makeFullDeck();
    expect(deck.length).toBe(78);
  });
});

describe("makeDealer", () => {
  it("should deal the specified number of cards", async () => {
    const deck = makeMajorArcanaDeck();
    const getOrientation = async () => "Upright" as Orientation;
    const getRandomCardNum = async (len: number) => 0;
    const dealer = makeDealer(getOrientation, getRandomCardNum);
    const hand = dealer(deck, 3);
    let count = 0;
    for await (const card of hand) {
      count++;
    }
    expect(count).toBe(3);
  });

  it("should deal unique cards", async () => {
    const deck = makeMajorArcanaDeck();
    const getOrientation = async () => "Upright" as Orientation;
    const getRandomCardNum = async (len: number) => len - 1;
    const dealer = makeDealer(getOrientation, getRandomCardNum);
    const hand = dealer(deck, 3);
    const dealtCards = new Set<TarotCard>();
    for await (const card of hand) {
      dealtCards.add(card.card);
    }
    expect(dealtCards.size).toBe(3);
  });
});
