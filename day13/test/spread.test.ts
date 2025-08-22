import { test, expect } from 'bun:test';
import { makeSpreadGen } from './spread';

test('makeSpreadGen returns an object with makeSpread method', () => {
 const spreadGen = makeSpreadGen();
 expect(spreadGen).toHaveProperty('makeSpread');
});

test('makeSpread returns a promise that resolves to SpreadResult', async () => {
 const spreadGen = makeSpreadGen();
 const data = {
 name: 'test spread',
 question: 'test question',
 deckType: 'MinorArkana',
 selectCards: 1,
 };
 const result = await spreadGen.makeSpread(data);
 expect(result).toHaveProperty('name');
 expect(result).toHaveProperty('question');
 expect(result).toHaveProperty('cards');
 expect(result.cards).toBeInstanceOf(Array);
});