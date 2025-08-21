
import { describe, it, expect, mock } from "bun:test";
import { makeSpreadGen } from "./spread";
import { Spread, SpreadResult } from "./model";

describe("makeSpreadGen", () => {
  it("should create a spread with the correct data", async () => {
    const spreadData: Spread = {
      name: "Test Spread",
      question: "Will this test pass?",
      deckType: "MajorArkana",
      selectCards: 3,
    };

    const spreadGen = makeSpreadGen();
    const result: SpreadResult = await spreadGen.makeSpread(spreadData);

    expect(result.name).toBe(spreadData.name);
    expect(result.question).toBe(spreadData.question);
    expect(result.cards.length).toBe(spreadData.selectCards);
  });

  it("should use the provided random functions", async () => {
    const spreadData: Spread = {
      name: "Test Spread",
      question: "Will this test pass?",
      deckType: "MajorArkana",
      selectCards: 1,
    };

    const getRandomNum = (len: number) => 0;
    const getRandomCardNum = async (len: number) => getRandomNum(len);
    const getRandomOrientation = async () => "Reversed";

    const crypto = {
        getRandomValues: (arr: any) => arr.fill(0)
    }

    global.crypto = crypto as any;

    const spreadGen = makeSpreadGen();
    const result: SpreadResult = await spreadGen.makeSpread(spreadData);

    expect(result.cards[0].orientation).toBe("Upright");
  });
});
