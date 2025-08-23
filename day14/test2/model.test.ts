import { test, expect, mock } from "bun:test";
import {
  makeMinorArcanaDeck,
  makeDealer,
  matchDeck,
  Spread,
  SpreadResult,
  CardInGame,
  TarotCard,
  Orientation,
  MajorArkana,
  MinorArkana,
  MinorArkanaCard,
  DeckType,
  CardDeck,
  GetRandomOrientationFn,
  GetRandomCardNumFn,
} from "./model";

test("makeMinorArcanaDeck creates correct deck", () => {
  const deck = makeMinorArcanaDeck();
  expect(deck.length).toEqual(56);
});

test("matchDeck returns correct deck maker", () => {
  expect(matchDeck.MinorArkana()).toHaveLength(56);
});

test("makeDealer yields correct number of cards", async () => {
  const getOrientationMock = mock(() => Promise.resolve("Upright"));
  const getRandomCardNumMock = mock((len) => Promise.resolve(Math.floor(Math.random() * len)));
  const dealer = makeDealer(getOrientationMock, getRandomCardNumMock);
  const deck = makeMinorArcanaDeck();
  const result = [];
  for await (const card of dealer(deck, 5)) {
    result.push(card);
  }
  expect(result.length).toEqual(5);
});