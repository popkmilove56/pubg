"use client";

import { useState } from "react";

const workItems = [
  ["GRAPHICS", "Posters, leaderboards and stream overlays"],
  ["TEAM UPDATES", "Rosters, results and announcements"],
  ["BEHIND THE SCENES", "How each event is built and run"],
  ["SITE & TOOLS", "The pages and tools behind the events"],
];

export function WorkUpdates() {
  const [active, setActive] = useState<number | null>(0);

  return <div className="work" id="work">
    <div className="workTitle"><h2>WORK &amp; UPDATES</h2><span>Hover a row to see the latest.</span></div>
    {workItems.map(([title, text], index) => {
      const isOpen = active === index;
      return <div className={`workItem ${isOpen ? "isOpen" : ""}`} key={title} onMouseEnter={() => setActive(index)}>
        <button className="workSummary" type="button" aria-expanded={isOpen} onClick={() => setActive(isOpen ? null : index)} onFocus={() => setActive(index)}>
          <small>0{index + 1}</small><strong>{title}</strong><span>{text}</span><b>{isOpen ? "×" : "+"}</b>
        </button>
        <div className="workReveal" aria-hidden={!isOpen}>
          {index === 0 ? <div className="workPanel"><div className="posterPreview"><strong>POSTER PREVIEW</strong></div><div className="latestWork"><small>LATEST</small><a href="#"><span>Final standings leaderboard</span><b>OCT 2026</b></a><a href="#"><span>Season poster v2</span><b>SEP 2026</b></a><a href="#"><span>Stream overlay pack</span><b>AUG 2026</b></a><a className="allGraphics" href="#">SEE ALL GRAPHICS →</a></div></div> : <p>Updates for {title.toLowerCase()} will appear here.</p>}
        </div>
      </div>;
    })}
    <small>Sample updates. Replace with your real posts. On touch screens, tap a row to open.</small>
  </div>;
}
