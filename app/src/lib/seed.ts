import type { AppData, Item, Kind } from './types';

// Starting budget lines taken from the original "Monthly Budget" spreadsheet.
const SEED: [Kind, string, number][] = [
  ['income', 'Shafraz', 25000],
  ['income', 'Sharoo', 18000],
  ['income', 'Others (Kudu MIB)', 9000],
  ['income', 'Others (Kudu)', 0],

  ['expense', 'Rent', 12000],
  ['expense', 'Electricity', 2000],
  ['expense', 'Water', 500],
  ['expense', 'Phone Bill Shafraz', 1080],
  ['expense', 'Phone Bill Sharoona', 426],
  ['expense', 'Internet', 540],
  ['expense', 'MediaNet', 405],
  ['expense', 'Petrol - cycle', 300],
  ['expense', 'Cycle Service', 480],
  ['expense', 'Groceries', 5000],
  ['expense', 'Personal Supplies', 1000],
  ['expense', 'Clothing', 2000],
  ['expense', 'Salon/Barber', 200],
  ['expense', 'Dining/Eating Out', 2000],
  ['expense', 'Medical', 0],
  ['expense', 'Bus/Taxi/Train Fare', 500],
  ['expense', 'Personal Transfers', 0],
  ['expense', 'Misc', 0],
  ['expense', 'Saving', 20000],

  ['obligation', 'BML Loan', 0],
  ['obligation', 'Credit', 5000],
  ['obligation', 'Cycle Payment', 0],
  ['obligation', 'MIB House', 0],
  ['obligation', 'MIB Phone', 0],
  ['obligation', 'Pension', 550],
  ['obligation', 'Gym', 0],
  ['obligation', 'Medical Insurance', 558.29],
  ['obligation', 'Mom', 0],
  ['obligation', 'Car', 0],
];

export function seedData(): AppData {
  const start = '2000-01'; // budget applies to every month until edited
  const items: Item[] = SEED.map(([kind, name, budget], i) => ({
    id: `seed-${i}`,
    kind,
    name,
    budget,
    startMonth: start,
  }));
  return { version: 1, currency: 'MVR', items, overrides: {}, txns: [] };
}
