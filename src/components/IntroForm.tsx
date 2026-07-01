import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Gender, UserInput } from '../utils/generateFortune';

interface Props { onSubmit: (input: UserInput) => void; }

type BirthDatePart = 'year' | 'month' | 'day';

const birthDateMaxLengths: Record<BirthDatePart, number> = {
  year: 4,
  month: 2,
  day: 2,
};

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

function isValidBirthDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) return false;

  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  const currentYear = new Date().getFullYear();

  if (yearNumber < 1900 || yearNumber > currentYear) return false;
  if (monthNumber < 1 || monthNumber > 12) return false;
  if (dayNumber < 1 || dayNumber > 31) return false;

  const date = new Date(yearNumber, monthNumber - 1, dayNumber);
  return date.getFullYear() === yearNumber
    && date.getMonth() === monthNumber - 1
    && date.getDate() === dayNumber;
}

export default function IntroForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('other');
  const [error, setError] = useState('');
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);

  const handleBirthDateChange = (
    part: BirthDatePart,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = onlyDigits(event.target.value, birthDateMaxLengths[part]);

    if (part === 'year') {
      setBirthYear(value);
      if (value.length === birthDateMaxLengths.year) monthInputRef.current?.focus();
      return;
    }

    if (part === 'month') {
      setBirthMonth(value);
      if (value.length === birthDateMaxLengths.month) dayInputRef.current?.focus();
      return;
    }

    setBirthDay(value);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('이름 없는 자의 운명은 읽을 수 없습니다.');
    if (!birthYear || !birthMonth || !birthDay) return setError('태어난 날이 비어 있습니다.');
    if (!isValidBirthDate(birthYear, birthMonth, birthDay)) return setError('태어난 날의 기록이 올바르지 않습니다.');
    if (!birthTime) return setError('시간을 숨기면 기록은 열리지 않습니다.');
    if (!gender) return setError('아직 봉인이 완성되지 않았습니다.');

    const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;
    setError('');
    onSubmit({ name: name.trim(), birthDate, birthTime, gender });
  };

  return <section className="screen intro-screen reveal"><div className="paper-card intro-card"><div className="seal-mark">禁</div><p className="eyebrow">봉인된 기록</p><h1>칠일금기</h1><p className="subtitle">당신의 이름으로 열린 일곱 개의 금기</p><form onSubmit={submit} className="ritual-form"><label>이름<input value={name} onChange={(e) => setName(e.target.value)} placeholder="기록될 이름" /></label><label>생년월일<div className="birthdate-grid"><input value={birthYear} onChange={(event) => handleBirthDateChange('year', event)} placeholder="YYYY" aria-label="태어난 연도" inputMode="numeric" maxLength={birthDateMaxLengths.year} autoComplete="bday-year" /><input ref={monthInputRef} value={birthMonth} onChange={(event) => handleBirthDateChange('month', event)} placeholder="MM" aria-label="태어난 월" inputMode="numeric" maxLength={birthDateMaxLengths.month} autoComplete="bday-month" /><input ref={dayInputRef} value={birthDay} onChange={(event) => handleBirthDateChange('day', event)} placeholder="DD" aria-label="태어난 일" inputMode="numeric" maxLength={birthDateMaxLengths.day} autoComplete="bday-day" /></div></label><label>태어난 시간<input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} /></label><fieldset><legend>성별</legend><div className="gender-grid">{(['male','female','other'] as Gender[]).map((value) => <label key={value} className="radio-card"><input type="radio" checked={gender === value} onChange={() => setGender(value)} />{value === 'male' ? '남성' : value === 'female' ? '여성' : '기타 / 선택 안 함'}</label>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit">기록을 연다</button></form></div><div className="candle left"><i /></div><div className="candle right"><i /></div><div className="smoke" /></section>;
}
