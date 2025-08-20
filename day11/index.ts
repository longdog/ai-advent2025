import { makeSpreadGen } from "./spread";
import {ISpreadGen} from "./model";

async function spreadGenerator(spreadGen: ISpreadGen){
  const spread = await spredGen.makeSpread({
        name: "Past, Present, Future",
        question: "Will I be lucky today?",
        deckType: "MajorArkana",
        selectCards: 3,
  });
  return spread;
}

if (import.meta.main){
	const spread = await spredGenerator(makeSpreadGen())
	console.log(JSON.stringify(spread, null, 2));
}
