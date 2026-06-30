import { useEffect, useMemo, useState } from 'react';
import { loadingMessages } from '../data/fortunes';

interface Props { onComplete: () => void; }

export default function LoadingRitual({ onComplete }: Props) {
  const duration = useMemo(() => 4000 + Math.floor(Math.random() * 2001), []);
  const [message, setMessage] = useState(loadingMessages[0]);
  useEffect(() => {
    const endTimer = window.setTimeout(onComplete, duration);
    const messageTimer = window.setInterval(() => setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]), 850);
    return () => { window.clearTimeout(endTimer); window.clearInterval(messageTimer); };
  }, [duration, onComplete]);
  return <section className="screen loading-screen reveal"><div className="ritual-circle"><span /><span /><span /></div><div className="shaman"><b /></div><div className="floating-talisman t1">符</div><div className="floating-talisman t2">封</div><div className="floating-talisman t3">禁</div><div className="candle altar-left"><i /></div><div className="candle altar-right"><i /></div><div className="red-smoke" /><p className="loading-kicker">당신의 일주일을 들여다보는 중…</p><h2 className="glitch-text">{message}</h2></section>;
}
