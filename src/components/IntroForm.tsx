import { useState } from 'react';
import type { Gender, UserInput } from '../utils/generateFortune';

interface Props { onSubmit: (input: UserInput) => void; }

export default function IntroForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('other');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('이름 없는 자의 운명은 읽을 수 없습니다.');
    if (!birthDate) return setError('태어난 날이 비어 있습니다.');
    if (!birthTime) return setError('시간을 숨기면 기록은 열리지 않습니다.');
    if (!gender) return setError('아직 봉인이 완성되지 않았습니다.');
    setError('');
    onSubmit({ name: name.trim(), birthDate, birthTime, gender });
  };

  return <section className="screen intro-screen reveal"><div className="paper-card intro-card"><div className="seal-mark">禁</div><p className="eyebrow">봉인된 기록</p><h1>칠일금기</h1><p className="subtitle">당신의 이름으로 열린 일곱 개의 금기</p><form onSubmit={submit} className="ritual-form"><label>이름<input value={name} onChange={(e) => setName(e.target.value)} placeholder="기록될 이름" /></label><label>생년월일<input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} /></label><label>태어난 시간<input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} /></label><fieldset><legend>성별</legend><div className="gender-grid">{(['male','female','other'] as Gender[]).map((value) => <label key={value} className="radio-card"><input type="radio" checked={gender === value} onChange={() => setGender(value)} />{value === 'male' ? '남성' : value === 'female' ? '여성' : '기타 / 선택 안 함'}</label>)}</div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit">기록을 연다</button></form></div><div className="candle left"><i /></div><div className="candle right"><i /></div><div className="smoke" /></section>;
}
