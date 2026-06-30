import type { FortuneResult } from '../utils/generateFortune';

interface Props { result: FortuneResult; onReset: () => void; }

export default function ResultScreen({ result, onReset }: Props) {
  return <section className="screen result-screen reveal"><article className="paper-card result-document"><p className="eyebrow">이번 주 금기 기록</p><h1>{result.title}</h1><p className="summary">{result.summary}</p><div className="common-warnings"><div><span>피해야 할 색</span><strong>{result.avoidColor}</strong></div><div><span>피해야 할 장소</span><strong>{result.avoidPlace}</strong></div><div><span>주의 시간</span><strong>{result.avoidTime}</strong></div></div><div className="daily-list">{result.dailyTaboos.map((taboo) => <section className="daily-card" key={taboo.dayLabel}><p>{taboo.tabooNumber}</p><h2>{taboo.dayLabel}</h2><p>{taboo.message}</p><dl><div><dt>시간</dt><dd>{taboo.time}</dd></div><div><dt>장소</dt><dd>{taboo.place}</dd></div></dl></section>)}</div><section className="absolute-taboo"><span>이번 주 절대 금기</span><p>{result.absoluteTaboo}</p></section><p className="final-warning">{result.finalWarning}</p><button className="primary-button" onClick={onReset}>다시 봉인한다</button><footer>본 콘텐츠는 오락용으로 제공됩니다. 실제 운세, 종교적 판단, 의학적 판단, 법적 판단, 중요한 의사결정의 근거로 사용하지 마세요.<br />앱 전체에서 사용자 입력값은 서버로 전송하지 않는다. 현재 앱은 외부 API를 사용하지 않으며, 입력값은 화면에서 결과를 생성하는 용도로만 사용한다.</footer></article></section>;
}
