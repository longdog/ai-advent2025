import { test, expect, mock } from "bun:test";
import { makeSpreadGen, Spread } from "./spread";

test("makeSpreadGen generates correct spread", async () => {
  const gen = makeSpreadGen();
  const input: Spread = {
    name: "Sample",
    question: "What is my future?",
    deckType: "MinorArkana",
    selectCards: 3,
  };
  const result = await gen.makeSpread(input);
  expect(result.cards.length).toEqual(3);
});