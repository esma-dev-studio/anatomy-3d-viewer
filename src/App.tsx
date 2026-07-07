import { useEffect } from 'react';
import { Layout } from './components/Layout';

export default function App() {
  // マウント直後に数回リサイズを促し、R3F キャンバスを確実に親サイズへ追従させる
  // (環境により ResizeObserver の初回発火が遅れるケースへの保険)。
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event('resize'));
    const timers = [0, 80, 250, 600].map((ms) => window.setTimeout(fire, ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return <Layout />;
}
