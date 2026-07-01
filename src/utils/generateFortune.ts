import { absoluteTaboos, avoidColors, elementLabels, elementSummaries, finalWarnings, tabooThemes } from '../data/fortunes';
import type { FortuneElement, TabooTheme } from '../data/fortunes';
import { calculateSajuProfile, formatPillar } from './saju';
import type { SajuProfile } from './saju';

export type Gender = 'male' | 'female' | 'other';
export interface UserInput { name: string; birthDate: string; birthTime: string; gender: Gender; }
export interface DailyTaboo { dayLabel: string; tabooNumber: string; time: string; place: string; person: string; object: string; action: string; message: string; }
export interface FortuneResult { title: string; ownerName: string; summary: string; avoidColor: string; avoidPlace: string; avoidTime: string; dailyTaboos: DailyTaboo[]; absoluteTaboo: string; finalWarning: string; sajuProfile: SajuProfile; sajuLine: string; }

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

function buildElementCycle(profile: SajuProfile): FortuneElement[] {
  const cycle: FortuneElement[] = [profile.dominantElement, profile.dayMaster, profile.weakElement, profile.hourPillar.branchElement];
  return cycle.filter((element, index) => cycle.indexOf(element) === index).concat([profile.dominantElement, profile.dayMaster]);
}

function formatCounts(profile: SajuProfile): string {
  return (Object.keys(profile.elementCounts) as FortuneElement[])
    .map((element) => `${elementLabels[element]} ${profile.elementCounts[element]}`)
    .join(' · ');
}

export function generateFortune(input: UserInput, now = new Date()): FortuneResult {
  const sajuProfile = calculateSajuProfile(input.birthDate, input.birthTime);
  const weekKey = getWeekKey(now);
  const baseSeed = hashString(`${input.name}|${input.birthDate}|${input.birthTime}|${input.gender}|${weekKey}|${sajuProfile.dominantElement}|${sajuProfile.dayMaster}|${sajuProfile.hourBranchLabel}`);
  const commonSeed = baseSeed + 7001;
  const usedSets = new Set<(typeof tabooThemes)[number]['sets'][number]>();
  const elementCycle = buildElementCycle(sajuProfile);

  const dailyTaboos = dayLabels.map((dayLabel, dayIndex) => {
    const dailySeed = baseSeed + dayIndex * 97;
    const element = elementCycle[dayIndex % elementCycle.length];
    const theme = getTheme(element);
    const set = pickUnique(theme.sets, dailySeed + 11, usedSets, Math.min(4, theme.sets.length));

    return {
      dayLabel,
      tabooNumber: tabooNumbers[dayIndex],
      time: set.timeLabel,
      place: set.placeLabel,
      person: `${elementLabels[element]} 기운의 표식`,
      object: set.objectLabel,
      action: set.message,
      message: set.message,
    };
  });

  const dominantTheme = getTheme(sajuProfile.dominantElement);
  const hourTheme = getTheme(sajuProfile.hourPillar.branchElement);
  const sajuLine = [sajuProfile.yearPillar, sajuProfile.monthPillar, sajuProfile.dayPillar, sajuProfile.hourPillar].map(formatPillar).join(' · ');
  const profileLine = `사주 원국에서 일간은 ${elementLabels[sajuProfile.dayMaster]}이고, ${sajuProfile.hourBranchLabel}에는 ${elementLabels[sajuProfile.hourPillar.branchElement]} 기운이 함께 놓입니다. 오행 분포는 ${formatCounts(sajuProfile)}로 읽었습니다.`;

  return {
    title: `${input.name}님, 피해야 할 일곱 날의 예지`,
    ownerName: input.name,
    summary: `${seededPick(elementSummaries[sajuProfile.dominantElement], commonSeed + 5)} ${profileLine}`,
    avoidColor: seededPick(avoidColors, commonSeed + 7),
    avoidPlace: seededPick(dominantTheme.places, commonSeed + 13),
    avoidTime: seededPick(hourTheme.times, commonSeed + 17),
    dailyTaboos,
    absoluteTaboo: seededPick(absoluteTaboos, commonSeed + 19),
    finalWarning: seededPick(finalWarnings, commonSeed + 29),
    sajuProfile,
    sajuLine,
  };
}
