import { absoluteTaboos, avoidActions, avoidColors, avoidObjects, avoidPeople, avoidPlaces, avoidTimes, dailyWarningTemplates, finalWarnings, weeklySummaries } from '../data/fortunes';

export type Gender = 'male' | 'female' | 'other';
export interface UserInput { name: string; birthDate: string; birthTime: string; gender: Gender; }
export interface DailyTaboo { dayLabel: string; tabooNumber: string; time: string; place: string; person: string; object: string; action: string; message: string; }
export interface FortuneResult { title: string; summary: string; avoidColor: string; avoidPlace: string; avoidTime: string; dailyTaboos: DailyTaboo[]; absoluteTaboo: string; finalWarning: string; }

const dayLabels = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
const tabooNumbers = ['금기 一','금기 二','금기 三','금기 四','금기 五','금기 六','금기 七'];

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function seededPick<T>(items: readonly T[], seed: number): T {
  return items[Math.floor(seededRandom(seed) * items.length) % items.length];
}

function pickUnique<T>(items: readonly T[], seed: number, used: Set<T>, minUniqueCount: number): T {
  const preferred = items.map((_, index) => seededPick(items, seed + index * 101)).find((item) => !used.has(item));
  const picked = used.size < minUniqueCount && preferred ? preferred : seededPick(items, seed);
  used.add(picked);
  return picked;
}

function applyTemplate(template: string, taboo: Omit<DailyTaboo, 'dayLabel' | 'tabooNumber' | 'message'>): string {
  return template
    .replace('{time}', taboo.time)
    .replace('{place}', taboo.place)
    .replace('{person}', taboo.person)
    .replace('{object}', taboo.object)
    .replace('{action}', taboo.action);
}

export function generateFortune(input: UserInput, now = new Date()): FortuneResult {
  const weekKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const baseSeed = hashString(`${input.name}|${input.birthDate}|${input.birthTime}|${input.gender}|${weekKey}`);
  const commonSeed = baseSeed + 7001;
  const usedTimes = new Set<string>();
  const usedPlaces = new Set<string>();
  const usedCombos = new Set<string>();
  const usedTemplates = new Set<string>();

  const dailyTaboos = dayLabels.map((dayLabel, dayIndex) => {
    const dailySeed = baseSeed + dayIndex * 97;
    const time = pickUnique(avoidTimes, dailySeed + 11, usedTimes, 5);
    const place = pickUnique(avoidPlaces, dailySeed + 23, usedPlaces, 5);
    let person = seededPick(avoidPeople, dailySeed + 37);
    let object = seededPick(avoidObjects, dailySeed + 41);
    let action = seededPick(avoidActions, dailySeed + 53);
    let combo = `${person}|${object}|${action}`;
    let guard = 0;
    while (usedCombos.has(combo) && guard < 8) {
      guard += 1;
      person = seededPick(avoidPeople, dailySeed + 37 + guard * 17);
      object = seededPick(avoidObjects, dailySeed + 41 + guard * 19);
      action = seededPick(avoidActions, dailySeed + 53 + guard * 23);
      combo = `${person}|${object}|${action}`;
    }
    usedCombos.add(combo);
    const template = pickUnique(dailyWarningTemplates, dailySeed + 67, usedTemplates, 7);
    const taboo = { time, place, person, object, action };
    return { dayLabel, tabooNumber: tabooNumbers[dayIndex], ...taboo, message: applyTemplate(template, taboo) };
  });

  const titleFormats = [`${input.name}님의 이름으로 열린 칠일금기`, `${input.name}님의 이레 금기 기록`, `${input.name}님, 피해야 할 일곱 기록`];
  return {
    title: seededPick(titleFormats, commonSeed + 3),
    summary: seededPick(weeklySummaries, commonSeed + 5),
    avoidColor: seededPick(avoidColors, commonSeed + 7),
    avoidPlace: seededPick(avoidPlaces, commonSeed + 13),
    avoidTime: seededPick(avoidTimes, commonSeed + 17),
    dailyTaboos,
    absoluteTaboo: seededPick(absoluteTaboos, commonSeed + 19),
    finalWarning: seededPick(finalWarnings, commonSeed + 29),
  };
}
