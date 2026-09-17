import { useEffect, useState } from "react";

export function AthrIntro() {
  const [visible, setVisible] = useState(() => {
    try { return sessionStorage.getItem("athr-intro-seen") !== "1"; } catch { return true; }
  });
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("athr-intro-seen", "1"); } catch { /* storage unavailable */ }
    }, 1650);
    return () => window.clearTimeout(timer);
  }, [visible]);
  if (!visible) return null;
  return <div className="athr-intro" aria-label="ATHR Digital Solutions intro" role="status">
    <div className="athr-intro__grid" />
    <div className="athr-intro__orb athr-intro__orb--one" />
    <div className="athr-intro__orb athr-intro__orb--two" />
    <div className="athr-intro__mark">أثر</div>
    <div className="athr-intro__tagline">من الفكرة إلى الأثر</div>
    <div className="athr-intro__rule"><span /><i /><span /></div>
  </div>;
}
