export type Orientation = "Upright" | "Reversed";

export const minorSuit = ["Cups", "Pentacles", "Swords", "Wands"] as const;

export const minorRank = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Page",
  "Knight",
  "Queen",
  "King",
] as const;

export type MinorSuit = (typeof minorSuit)[number];

export type MinorRank = (typeof minorRank)[number];

export type MinorArkana = {
  rank: MinorRank;
  suit: MinorSuit;
};

export type MinorArkanaCard = {
  type: "MinorArkana";
  value: MinorArkana;
};

export type DeckType = "MinorArkana";

export type TarotCard = MinorArkanaCard;

export type CardDeck = Array<TarotCard>;

export const makeMinorArcanaDeck = (): CardDeck =>
  minorSuit
    .flatMap((suit) =>
      minorRank.map((value) => value).map((rank) => ({ rank, suit }))
    )
    .map((value) => ({ value, type: "MinorArkana" }));

export type CardInGame = {
  card: TarotCard;
  orientation: Orientation;
};

export type GetRandomOrientationFn = () => Promise<Orientation>;
export type GetRandomCardNumFn = (len: number) => Promise<number>;

export function makeDealer(
  getOrientation: GetRandomOrientationFn,
  getRandomCardNum: GetRandomCardNumFn
) {
  return async function* (deck: CardDeck, cardsNum: number) {
    let gameDeck = [...deck];
    while (cardsNum > 0) {
      const [orientation, position] = await Promise.all([
        getOrientation(),
        getRandomCardNum(gameDeck.length),
      ]);
      const card = { orientation, card: gameDeck.at(position)! };
      gameDeck = gameDeck.filter((_, i) => i !== position);
      cardsNum--;
      yield card;
    }
  };
}

export const matchDeck: Record<DeckType, () => CardDeck> = {
  MinorArkana: makeMinorArcanaDeck,
};

export type Spread = {
  name: string;
  question: string;
  deckType: DeckType;
  selectCards: number;
};

export type SpreadResult = {
  name: string;
  question: string;
  cards: Array<CardInGame>;
};
