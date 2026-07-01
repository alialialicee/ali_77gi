import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { loadingMessages } from '../data/fortunes';
import loadingMudangUrl from '../assets/loading-mudang.png';
import jakduTrackUrl from '../assets/jakdu-track.png';

interface Props { onComplete: () => void; }

const completionMessages = [
  '봉인이 열렸습니다.',
  '일곱 금기가 기록되었습니다.',
  '이름이 올랐습니다.',
  '이제 보아도 됩니다.',
];

export default function LoadingRitual({ onComplete }: Props) {
  const duration = useMemo(() => 4000 + Math.floor(Math.random() * 2001), []);
  const completeMessage = useMemo(() => completionMessages[Math.floor(Math.random() * completionMessages.length)], []);
  const [message, setMessage] = useState(loadingMessages[0]);
  const [progress, setProgress] = useState(0);
  const isComplete = progress >= 100;
  const runnerLeft = 8 + progress * 0.84;

  useEffect(() => {
    let animationFrame = 0;
    let completeTimer = 0;
    const startedAt = performance.now();

    const advanceRitual = (now: number) => {
      const nextProgress = Math.min(((now - startedAt) / duration) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        animationFrame = window.requestAnimationFrame(advanceRitual);
        return;
      }

      setMessage(completeMessage);
      completeTimer = window.setTimeout(onComplete, 750);
    };

    animationFrame = window.requestAnimationFrame(advanceRitual);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(completeTimer);
    };
  }, [completeMessage, duration, onComplete]);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessage((currentMessage) => {
        if (currentMessage === completeMessage) return currentMessage;
        return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      });
    }, 850);

    return () => window.clearInterval(messageTimer);
  }, [completeMessage]);

  return (
    <section
      className={`screen loading-screen reveal${isComplete ? ' ritual-complete' : ''}`}
      style={
        {
          '--ritual-progress': `${progress}%`,
          '--shaman-left': `${runnerLeft}%`,
          '--loading-mudang-image': `url(${loadingMudangUrl})`,
          '--jakdu-track-image': `url(${jakduTrackUrl})`,
        } as CSSProperties
      }
      aria-live="polite"
    >
      <div className="ritual-circle"><span /><span /><span /></div>
      <div className="floating-talisman t1">符</div>
      <div className="floating-talisman t2">封</div>
      <div className="floating-talisman t3">禁</div>
      <div className="candle altar-left"><i /></div>
      <div className="candle altar-right"><i /></div>
      <div className="red-smoke" />

      <div className="loading-copy">
        <p className="loading-kicker">당신의 일주일을 들여다보는 중…</p>
        <h2 className="glitch-text">{message}</h2>
      </div>

      <div className="ritual-loader" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="의식 진행률">
        <div className="ritual-track">
          <div className="ritual-track-fill" />
          <div className="blade-glow" />
          <div className="blade-segments" aria-hidden="true" />
          <div className="track-seal" aria-hidden="true">封</div>
        </div>
        <div className="shaman-runner" aria-hidden="true">
          <div className="shaman-sprite">
            <img className="shaman-image" src={loadingMudangUrl} alt="" />
            <span className="shaman-bell" />
          </div>
        </div>
      </div>
    </section>
  );
}