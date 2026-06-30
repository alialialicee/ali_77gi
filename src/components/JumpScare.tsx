import { useEffect, useMemo } from 'react';
import { jumpScareMessages } from '../data/fortunes';

interface Props { onComplete: () => void; }

export default function JumpScare({ onComplete }: Props) {
  const message = useMemo(() => jumpScareMessages[Math.floor(Math.random() * jumpScareMessages.length)], []);
  useEffect(() => { const timer = window.setTimeout(onComplete, 1000); return () => window.clearTimeout(timer); }, [onComplete]);
  return <section className="screen jump-screen"><div className="mask-face"><span className="eye e1" /><span className="eye e2" /><span className="mouth" /></div><h2 className="jump-message glitch-text">{message}</h2></section>;
}
