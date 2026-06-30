import type { FortuneResult } from '../utils/generateFortune';

interface Props {
  result: FortuneResult;
  onReset: () => void;
}

export default function ResultScreen({ result, onReset }: Props) {
  return (
    <section className="screen result-screen reveal">
      <article className="paper-card result-document" aria-labelledby="result-title">
        <div className="document-seal" aria-hidden="true">
          七
        </div>
        <header className="result-hero">
          <p className="eyebrow">봉인된 칠일금기 기록</p>
          <h1 id="result-title" aria-label={result.title}>
            <span className="result-title__name">{result.ownerName}님,</span>
            <span className="result-title__omen">피해야 할 일곱 날의 예지</span>
          </h1>
          <p className="result-owner">봉인된 금기 문서가 이름을 기억했습니다.</p>
          <p className="summary">{result.summary}</p>
        </header>

        <section className="common-warnings" aria-label="이번 주 공통 금기 정보">
          <div>
            <span>피해야 할 색</span>
            <strong>{result.avoidColor}</strong>
          </div>
          <div>
            <span>피해야 할 장소</span>
            <strong>{result.avoidPlace}</strong>
          </div>
          <div>
            <span>주의 시간</span>
            <strong>{result.avoidTime}</strong>
          </div>
        </section>

        <div className="daily-list">
          {result.dailyTaboos.map((taboo) => (
            <section className="daily-card" key={taboo.dayLabel}>
              <div className="daily-card__stamp" aria-hidden="true">
                {taboo.tabooNumber}
              </div>
              <div className="daily-card__heading">
                <p>{taboo.tabooNumber}</p>
                <h2>{taboo.dayLabel}</h2>
              </div>
              <p className="daily-card__message">{taboo.message}</p>
              <dl>
                <div>
                  <dt>시간</dt>
                  <dd>{taboo.time}</dd>
                </div>
                <div>
                  <dt>장소</dt>
                  <dd>{taboo.place}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <section className="closing-ritual" aria-label="마지막 금기 안내">
          <div className="absolute-taboo">
            <span>이번 주 절대 금기</span>
            <p>{result.absoluteTaboo}</p>
          </div>
          <blockquote className="final-warning">{result.finalWarning}</blockquote>
          <button className="primary-button result-reset-button" onClick={onReset}>
            기록을 다시 봉인한다
          </button>
          <footer>
            본 콘텐츠는 오락용으로 제공됩니다. 실제 운세, 종교적 판단, 의학적 판단, 법적 판단, 중요한 의사결정의 근거로 사용하지 마세요.
            <br />앱 전체에서 사용자 입력값은 서버로 전송하지 않는다. 현재 앱은 외부 API를 사용하지 않으며, 입력값은 화면에서 결과를 생성하는 용도로만 사용한다.
          </footer>
        </section>
      </article>
    </section>
  );
}
