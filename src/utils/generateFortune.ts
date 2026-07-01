import { absoluteTaboos, avoidColors, elementLabels, elementSummaries, finalWarnings, tabooThemes } from '../data/fortunes';
import type { FortuneElement, TabooTheme } from '../data/fortunes';

export type Gender = 'male' | 'female' | 'other';
export interface UserInput { name: string; birthDate: string; birthTime: string; gender: Gender; }
export interface DailyTaboo { dayLabel: string; tabooNumber: string; time: string; place: string; person: string; object: string; action: string; message: string; }
export interface FortuneResult { title: string; ownerName: string; summary: string; avoidColor: string; avoidPlace: string; avoidTime: string; dailyTaboos: DailyTaboo[]; absoluteTaboo: string; finalWarning: string; }

interface BirthProfile { seasonElement: FortuneElement; hourElement: FortuneElement; earthlyHour: string; favoredElements: FortuneElement[]; }

const dayLabels = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
const tabooNumbers = ['금기 一','금기 二','금기 三','금기 四','금기 五','금기 六','금기 七'];
const earthlyHours = ['자시','축시','인시','묘시','진시','사시','오시','미시','신시','유시','술시','해시'];
const earthlyHourElements: FortuneElement[] = ['water','earth','wood','wood','earth','fire','fire','earth','metal','metal','earth','water'];

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

function getSeasonElement(month: number): FortuneElement {
  if ([3, 4].includes(month)) return 'wood';
  if ([6, 7].includes(month)) return 'fire';
  if ([2, 5, 8, 11].includes(month)) return 'earth';
  if ([9, 10].includes(month)) return 'metal';
  return 'water';
}

function createBirthProfile(input: UserInput): BirthProfile {
  const month = Number(input.birthDate.split('-')[1]) || 1;
  const hour = Number(input.birthTime.split(':')[0]) || 0;
  const hourIndex = Math.floor(((hour + 1) % 24) / 2);
  const seasonElement = getSeasonElement(month);
  const hourElement = earthlyHourElements[hourIndex];
  const favoredElements = seasonElement === hourElement ? [seasonElement, hourElement] : [seasonElement, hourElement, seasonElement];

  return { seasonElement, hourElement, earthlyHour: earthlyHours[hourIndex], favoredElements };
}

function getTheme(element: FortuneElement): TabooTheme {
  return tabooThemes.find((theme) => theme.element === element) ?? tabooThemes[0];
}

function getWeekKey(now: Date): string {
  const weekStart = new Date(now);
  const day = weekStart.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diffToMonday);
  return `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
}

function buildMessage(theme: TabooTheme, seed: number, usedSituations: Set<string>): string {
  const situation = pickUnique(theme.situations, seed + 3, usedSituations, Math.min(4, theme.situations.length));
  const warning = seededPick(theme.warnings, seed + 5);
  const closingLine = seededPick(theme.closingLines, seed + 7);
  const useWarning = seededRandom(seed + 9) > 0.45;

  if (useWarning && !situation.includes(warning)) return `${situation} ${warning}`;
  return `${situation} ${closingLine}`;
}

export function generateFortune(input: UserInput, now = new Date()): FortuneResult {
  const birthProfile = createBirthProfile(input);
  const weekKey = getWeekKey(now);
  const baseSeed = hashString(`${input.name}|${input.birthDate}|${input.birthTime}|${input.gender}|${weekKey}|${birthProfile.seasonElement}|${birthProfile.earthlyHour}`);
  const commonSeed = baseSeed + 7001;
  const usedTimes = new Set<string>();
  const usedPlaces = new Set<string>();
  const usedSituations = new Set<string>();

  const dailyTaboos = dayLabels.map((dayLabel, dayIndex) => {
    const dailySeed = baseSeed + dayIndex * 97;
    const element = birthProfile.favoredElements[dayIndex % birthProfile.favoredElements.length];
    const theme = getTheme(element);
    const time = pickUnique(theme.times, dailySeed + 11, usedTimes, 5);
    const place = pickUnique(theme.places, dailySeed + 23, usedPlaces, 5);
    const object = seededPick(theme.objects, dailySeed + 41);
    const action = seededPick(theme.warnings, dailySeed + 53);
    const message = buildMessage(theme, dailySeed + 67, usedSituations);

    return { dayLabel, tabooNumber: tabooNumbers[dayIndex], time, place, person: `${elementLabels[element]} 기운의 표식`, object, action, message };
  });

  const summaryTheme = getTheme(birthProfile.seasonElement);
  const secondaryTheme = getTheme(birthProfile.hourElement);
  const profileLine = `${elementLabels[birthProfile.seasonElement]} 기운이 태어난 계절에서 올라오고, ${birthProfile.earthlyHour}의 ${elementLabels[birthProfile.hourElement]} 기운이 이번 주의 금기를 좁힙니다.`;

  return {
    title: `${input.name}님, 피해야 할 일곱 날의 예지`,
    ownerName: input.name,
    summary: `${seededPick(elementSummaries[birthProfile.seasonElement], commonSeed + 5)} ${profileLine}`,
    avoidColor: seededPick(avoidColors, commonSeed + 7),
    avoidPlace: seededPick(summaryTheme.places, commonSeed + 13),
    avoidTime: seededPick(secondaryTheme.times, commonSeed + 17),
    dailyTaboos,
    absoluteTaboo: seededPick(absoluteTaboos, commonSeed + 19),
    finalWarning: seededPick(finalWarnings, commonSeed + 29),
  };
}
