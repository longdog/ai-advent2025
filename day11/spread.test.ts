import { describe, it, expect } from "bun:test";
import { makeSpreadGen } from "./spread";
import { SpreadResult } from "./model";

describe("Spread Generation", () => {
  it("should generate a spread with the correct shape and data", async () => {
    const spreadGen = makeSpreadGen();
    const spread = await spreadGen.makeSpread({
      name: "Test Spread",
      question: "Will this test pass?",
      deckType: "MajorArkana",
      selectCards: 3,
    });

    expect(spread.name).toBe("Test Spread");
    expect(spread.question).toBe("Will this test pass?");
    expect(spread.cards.length).toBe(3);
    expect(spread.cards[0].card.type).toBe("MajorArkana");
  });
});
