export type SajuElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface Pillar {
  stem: string;
  stemHanja: string;
  branch: string;
  branchHanja: string;
  stemElement: SajuElement;
  branchElement: SajuElement;
}

export interface SajuProfile {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  dayMaster: Pillar['stemElement'];
  dominantElement: SajuElement;
  weakElement: SajuElement;
  elementCounts: Record<SajuElement, number>;
  hourBranchLabel: string;
}

type Stem = { ko: string; hanja: string; element: SajuElement };
type Branch = { ko: string; hanja: string; element: SajuElement };

export const STEMS: Stem[] = [
  { ko: '갑', hanja: '甲', element: 'wood' },
  { ko: '을', hanja: '乙', element: 'wood' },
  { ko: '병', hanja: '丙', element: 'fire' },
  { ko: '정', hanja: '丁', element: 'fire' },
  { ko: '무', hanja: '戊', element: 'earth' },
  { ko: '기', hanja: '己', element: 'earth' },
  { ko: '경', hanja: '庚', element: 'metal' },
  { ko: '신', hanja: '辛', element: 'metal' },
  { ko: '임', hanja: '壬', element: 'water' },
  { ko: '계', hanja: '癸', element: 'water' },
];

export const BRANCHES: Branch[] = [
  { ko: '자', hanja: '子', element: 'water' },
  { ko: '축', hanja: '丑', element: 'earth' },
  { ko: '인', hanja: '寅', element: 'wood' },
  { ko: '묘', hanja: '卯', element: 'wood' },
  { ko: '진', hanja: '辰', element: 'earth' },
  { ko: '사', hanja: '巳', element: 'fire' },
  { ko: '오', hanja: '午', element: 'fire' },
  { ko: '미', hanja: '未', element: 'earth' },
  { ko: '신', hanja: '申', element: 'metal' },
  { ko: '유', hanja: '酉', element: 'metal' },
  { ko: '술', hanja: '戌', element: 'earth' },
  { ko: '해', hanja: '亥', element: 'water' },
];

const ELEMENT_ORDER: SajuElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

const SOLAR_TERMS = [
  { branchIndex: 1, month: 1, day: 6 }, // 소한: 축월 시작(근사)
  { branchIndex: 2, month: 2, day: 4 }, // 입춘: 인월 시작, 사주 연도 시작(근사)
  { branchIndex: 3, month: 3, day: 6 }, // 경칩
  { branchIndex: 4, month: 4, day: 5 }, // 청명
  { branchIndex: 5, month: 5, day: 6 }, // 입하
  { branchIndex: 6, month: 6, day: 6 }, // 망종
  { branchIndex: 7, month: 7, day: 7 }, // 소서
  { branchIndex: 8, month: 8, day: 8 }, // 입추
  { branchIndex: 9, month: 9, day: 8 }, // 백로
  { branchIndex: 10, month: 10, day: 8 }, // 한로
  { branchIndex: 11, month: 11, day: 8 }, // 입동
  { branchIndex: 0, month: 12, day: 7 }, // 대설: 자월 시작
];

const mod = (value: number, by: number) => ((value % by) + by) % by;

function makePillar(stemIndex: number, branchIndex: number): Pillar {
  const stem = STEMS[mod(stemIndex, 10)];
  const branch = BRANCHES[mod(branchIndex, 12)];
  return { stem: stem.ko, stemHanja: stem.hanja, branch: branch.ko, branchHanja: branch.hanja, stemElement: stem.element, branchElement: branch.element };
}

function getSajuYear(date: Date): number {
  // 실제 입춘 시각은 해마다 달라지므로 여기서는 2월 4일 00:00(로컬 입력일 기준)을 근사 입춘으로 둔다.
  // SOLAR_TERMS를 분리해 두어 추후 정확한 절기 시각 테이블로 보정할 수 있다.
  const year = date.getFullYear();
  const lichun = new Date(year, 1, 4);
  return date < lichun ? year - 1 : year;
}

function getYearPillar(date: Date): Pillar {
  const sajuYear = getSajuYear(date);
  return makePillar(sajuYear - 4, sajuYear - 4); // 4년이 갑자년인 60갑자 순환
}

function getMonthBranchIndex(date: Date): number {
  let current = SOLAR_TERMS[0].branchIndex;
  for (const term of SOLAR_TERMS) {
    const boundary = new Date(date.getFullYear(), term.month - 1, term.day);
    if (date >= boundary) current = term.branchIndex;
  }
  return current;
}

function getMonthPillar(date: Date, yearStemIndex: number): Pillar {
  const branchIndex = getMonthBranchIndex(date);
  const monthOrderFromTiger = mod(branchIndex - 2, 12);
  // 갑/기년 병인월, 을/경년 무인월, 병/신년 경인월, 정/임년 임인월, 무/계년 갑인월에서 순행.
  const tigerStemByYearStem = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  return makePillar(tigerStemByYearStem[yearStemIndex] + monthOrderFromTiger, branchIndex);
}

function getJulianDayNumber(year: number, month: number, day: number): number {
  // Gregorian calendar Julian Day Number. JDN 차이를 이용해 검증 가능한 60갑자 일진 순환을 만든다.
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getDayPillar(year: number, month: number, day: number): Pillar {
  const anchorJdn = getJulianDayNumber(1984, 2, 2); // 널리 쓰는 甲子일 기준점
  const jdn = getJulianDayNumber(year, month, day);
  const index = mod(jdn - anchorJdn, 60);
  return makePillar(index, index);
}

function getHourPillar(hour: number, dayStemIndex: number): Pillar {
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  // 갑/기일 갑자시, 을/경일 병자시, 병/신일 무자시, 정/임일 경자시, 무/계일 임자시에서 순행.
  const ratStemByDayStem = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  return makePillar(ratStemByDayStem[dayStemIndex] + branchIndex, branchIndex);
}

function pickElementByCount(counts: Record<SajuElement, number>, direction: 'max' | 'min'): SajuElement {
  return ELEMENT_ORDER.reduce((selected, element) => {
    if (direction === 'max') return counts[element] > counts[selected] ? element : selected;
    return counts[element] < counts[selected] ? element : selected;
  }, ELEMENT_ORDER[0]);
}

export function formatPillar(pillar: Pillar): string {
  return `${pillar.stem}${pillar.branch}(${pillar.stemHanja}${pillar.branchHanja})`;
}

export function calculateSajuProfile(birthDate: string, birthTime: string): SajuProfile {
  const [year, month, day] = birthDate.split('-').map(Number);
  const hour = Number(birthTime.split(':')[0]) || 0;
  const date = new Date(year, month - 1, day);
  const yearPillar = getYearPillar(date);
  const yearStemIndex = STEMS.findIndex((stem) => stem.ko === yearPillar.stem);
  const monthPillar = getMonthPillar(date, yearStemIndex);
  const dayPillar = getDayPillar(year, month, day);
  const dayStemIndex = STEMS.findIndex((stem) => stem.ko === dayPillar.stem);
  const hourPillar = getHourPillar(hour, dayStemIndex);
  const elementCounts = ELEMENT_ORDER.reduce((acc, element) => ({ ...acc, [element]: 0 }), {} as Record<SajuElement, number>);

  [yearPillar, monthPillar, dayPillar, hourPillar].forEach((pillar) => {
    elementCounts[pillar.stemElement] += 1;
    elementCounts[pillar.branchElement] += 1;
  });

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: dayPillar.stemElement,
    dominantElement: pickElementByCount(elementCounts, 'max'),
    weakElement: pickElementByCount(elementCounts, 'min'),
    elementCounts,
    hourBranchLabel: `${hourPillar.branch}시(${hourPillar.branchHanja}時)`,
  };
}
