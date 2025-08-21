import { test, expect } from 'bun:test';
import { minorSuit, minorRank, makeMinorArcanaDeck, makeDealer } from './model';

test('minorSuit is an array', () => {
 expect(minorSuit).toBeInstanceOf(Array);
});

test('minorRank is an array', () => {
 expect(minorRank).toBeInstanceOf(Array);
});

test('makeMinorArcanaDeck returns an array of MinorArkanaCard', () => {
 const deck = makeMinorArcanaDeck();
 expect(deck).toBeInstanceOf(Array);
 expect(deck[0].type).toBe('MinorArkana');
});

test('makeDealer returns a function', () => {
 const getOrientation = async () => 'Upright';
 const getRandomCardNum = async (len: number) => 0;
 const dealer = makeDealer(getOrientation, getRandomCardNum);
 expect(typeof dealer).toBe('function');
});