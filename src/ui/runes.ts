// Runes de l'Elder Futhark dessinées en traits droits (boîte 10 × 16), pour un rendu gravé.
// Usage strictement décoratif : une rune ne porte jamais d'information.
export const runePaths = {
  fehu: 'M2 0V16M2 4L8 0M2 8L8 4',
  uruz: 'M2 16V0L8 5V16',
  thurisaz: 'M2 0V16M2 4L7 8L2 12',
  ansuz: 'M2 0V16M2 0L8 4M2 5L8 9',
  raido: 'M2 16V0L8 4L2 8L8 16',
  kenaz: 'M7 3L3 8L7 13',
  gebo: 'M1 1L9 15M9 1L1 15',
  wunjo: 'M2 0V16M2 0L8 4L2 8',
  hagalaz: 'M2 0V16M8 0V16M2 5L8 11',
  naudiz: 'M5 0V16M2 5L8 11',
  isa: 'M5 0V16',
  eihwaz: 'M5 0V16M5 0L8 3M5 16L2 13',
  algiz: 'M5 0V16M5 7L1 0M5 7L9 0',
  sowilo: 'M8 1L2 6L8 10L2 15',
  tiwaz: 'M5 0V16M5 0L1 5M5 0L9 5',
  berkano: 'M2 0V16M2 0L8 4L2 8L8 12L2 16',
  ehwaz: 'M2 16V0L5 5L8 0V16',
  mannaz: 'M2 0V16M8 0V16M2 0L8 7M8 0L2 7',
  laguz: 'M2 16V0L8 5',
  ingwaz: 'M5 3L9 8L5 13L1 8Z',
  dagaz: 'M1 0V16L9 0V16L1 0',
  othala: 'M1 16L9 7L5 2L1 7L9 16',
} as const;

export type RuneName = keyof typeof runePaths;

export const futhark = Object.keys(runePaths) as RuneName[];
