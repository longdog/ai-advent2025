import { test, expect } from 'bun:test';
import { makeSpreadGen } from './spread';

test('makeSpreadGen returns an object with makeSpread', () => {
 const spreadGen = makeSpreadGen();
 expect(typeof spreadGen.makeSpread).toBe('function');
});

test('makeSpread returns a promise of SpreadResult', async () => {
 const spreadGen = makeSpreadGen();
 const spread = {
 name: 'test spread',
 question: 'test question',
 deckType: 'MinorArkana',
 selectCards: 5,
 };
 const result = await spreadGen.makeSpread(spread);
 expect(result).toHaveProperty('name', 'test spread');
 expect(result).toHaveProperty('question', 'test question');
 expect(result).toHaveProperty('cards');
 expect(result.cards).toBeInstanceOf(Array);
 expect(result.cards.length).toBe(5);
});