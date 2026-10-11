import { MotionObserver } from "./motion-observer";
import { SiteNav } from "./site-nav";
import { TeamLibraryStrip } from "./team-library-strip";
import { WorkUpdates } from "./work-updates";

const upcoming = [
  { badge: "OPEN", date: "Sat 18:30", title: "1ST GREEN TOURNAMENT", note: "32 teams · 3,700 THB prize pool", tone: "green" },
  { badge: "WEEKLY", date: "Fri 20:00", title: "POINTS SCRIM", note: "Entry [price]", tone: "pink" },
  { badge: "SOON", date: "[Date]", title: "SEASON FINALE", note: "Details to be announced", tone: "purple" },
];
const FACEBOOK_URL = "https://www.facebook.com/Phetvaravut?locale=th_TH";
const DISCORD_URL = "https://discord.gg/rrJvHZfkw";
const liveScores = [["NIGHT SQUAD", "▲2", "38"], ["REDLINE", "▼1", "33"], ["HOLLOW POINT", "▲1", "30"], ["GRIDLOCK", "—", "27"], ["PAN STRIKE", "▼2", "24"]];
const pastEvents = [
  { type: "FINAL · COMPLETED", date: "[Date]", meta: "Online · 32 teams", name: "DUO CUP", winner: "Night Squad · 3,700 THB prize pool", tone: "paper" },
  { type: "SCRIM · COMPLETED", date: "[Date]", meta: "Online · Squad", name: "WEEKLY SCRIM", winner: "Winner: [Team]", tone: "purple" },
  { type: "SCRIM · COMPLETED", date: "[Date]", meta: "Online · Squad", name: "PRACTICE SCRIM", winner: "Winner: [Team]", tone: "blue" },
];
const podium = [
  { rank: "2", short: "RL", team: "REDLINE", kills: 37, place: 9, points: 46, tone: "purple" },
  { rank: "1", short: "NS", team: "NIGHT SQUAD", kills: 24, place: 27, points: 51, tone: "green" },
  { rank: "3", short: "HP", team: "HOLLOW POINT", kills: 31, place: 13, points: 44, tone: "blue" },
];
const joinSteps = [
  ["JOIN OUR DISCORD", "Open the registration channel and post your team name and four players. Entry is free."],
  ["GET THE ROOM CODE", "The organizer sends the custom room code to your captain on Discord 15 minutes before start."],
  ["PLAY AND FOLLOW ALONG", "Watch the stream and live scores here. Final results go up after the last match."],
];

function Button({ children, dark = false, href = DISCORD_URL }: { children: React.ReactNode; dark?: boolean; href?: string }) {
  return <a className={dark ? "button buttonDark" : "button"} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export default function Home() {
  return <>
    <MotionObserver />
    <SiteNav />
    <main>
      <section className="hero" id="home">
        <div className="heroArt" aria-hidden="true"><video className="heroBackgroundVideo" autoPlay muted loop playsInline preload="auto"><source src="/media/hero-fluid-flow.mp4" type="video/mp4" /></video></div>
        <div className="container heroInner"><div className="heroCopy"><span className="tag">PUBG TOURNAMENT ORGANIZER</span><h1>WE RUN <em>PUBG</em><br />TOURNAMENTS</h1><p>A small team behind every event. Pick one, join on Discord,<br className="desktopBreak" /> then follow the live scores here.</p><div className="buttonRow"><Button>JOIN DISCORD</Button><a className="button buttonLight" href="#live">WATCH LIVE</a></div></div><aside className="nextMatch"><small>NEXT MATCH</small><strong>Sat 18:30</strong><span>starts in 2d 4h</span></aside></div>
        <div className="container upcomingBlock"><div className="miniHeading"><b>UPCOMING EVENTS</b><a href="#tournaments">All events →</a></div><div className="eventGrid">{upcoming.map((event) => <article className={`eventCard ${event.tone}`} key={event.title}><div className="eventTop"><span>{event.badge}</span><strong>{event.date}</strong></div><div className="eventBody"><h3>{event.title}</h3><p>{event.note}</p><Button dark>{event.badge === "SOON" ? "NOTIFY ME" : "JOIN ON DISCORD"}</Button></div></article>)}</div></div>
      </section>

      <section className="section liveSection" id="live"><div className="container"><div className="sectionHeading"><h2>LIVE <span>● ON AIR · SAMPLE</span></h2><small>Streamed on Facebook Live</small></div><div className="liveGrid"><div><div className="videoCard"><div className="videoStage"><span>LIVE</span><b>1,248 watching</b><button aria-label="Play live stream">▶</button></div><div className="videoInfo"><h3>FINAL · MATCH 2 OF 3</h3><p>The real Facebook or YouTube stream is embedded here.</p></div></div><div className="buttonRow"><Button href={FACEBOOK_URL}>WATCH ON FACEBOOK</Button><a className="button buttonDark" href="#">REPLAY</a></div></div><div className="scoreBoard"><small>LIVE SCORES · AFTER MATCH 2</small>{liveScores.map(([team, change, score], index) => <div className="scoreRow" key={team}><b>{index + 1}</b><strong>{team}</strong><span className={change.includes("▼") ? "down" : "up"}>{change}</span><em>{score}</em></div>)}</div></div></div></section>

      <section className="pastSection" id="tournaments"><div className="container"><div className="sectionHeading darkText"><h2>PAST TOURNAMENTS</h2><a href="#">All events</a></div><div className="pastGrid">{pastEvents.map((event) => <article className={`pastCard ${event.tone}`} key={event.name}><div className="pastTop"><small>{event.type}</small><strong>{event.date}</strong><span>{event.meta}</span></div><div className="pastBottom"><h3>{event.name}</h3><p>{event.winner}</p><a className="button buttonLight" href="#standings">VIEW RESULTS</a></div></article>)}</div></div></section>

      <section className="section standings" id="standings"><div className="container"><div className="sectionHeading"><div><small>FROM THE LATEST TOURNAMENT</small><h2>DUO CUP · FINAL STANDINGS</h2></div><a href="#">Full table</a></div><div className="podiumGrid">{podium.map((team) => <article className={`podiumCard ${team.tone} rank${team.rank}`} key={team.team}><div className="podiumTop"><strong>{team.rank}</strong><span className="teamBadge"/><b>{team.short}</b></div><div className="podiumBottom"><div><small>{team.kills} KILL</small><small>{team.place} PTS R</small></div><em>{team.points}<i>PTS</i></em><h3>{team.team}</h3></div></article>)}</div><p className="caption">Team names and scores are sample data. Replace the crests with real team logos.</p></div></section>

      <TeamLibraryStrip />

      <section className="section infoSection"><div className="container">
        <div className="join" id="join"><h2>HOW TO JOIN</h2>{joinSteps.map(([title, text], index) => <div className="joinRow" key={title}><b>{index + 1}</b><strong>{title}</strong><p>{text}</p></div>)}<Button>JOIN DISCORD TO REGISTER</Button></div>
        <div className="about"><h2>ABOUT</h2><div><strong>We are a small team that runs PUBG tournaments and builds this site for each event, so rules, schedule, scores and payout proof live in one place.</strong><p>[Add your story: team name, how long you have organized events, the biggest event so far, who does what.] What we do: organizing, live streaming, graphics, web design.</p></div></div>
        <WorkUpdates />
      </div></section>

      <section className="contactSection" id="contact"><div className="contactCard"><div><h2>FOLLOW THE EVENTS OR<br />WORK WITH US</h2><p>Questions and collaboration offers are welcome on any channel.</p></div><address><small>FACEBOOK</small><a href={FACEBOOK_URL} target="_blank" rel="noreferrer">facebook.com/Phetvaravut</a><small>DISCORD</small><a href={DISCORD_URL} target="_blank" rel="noreferrer">discord.gg/rrJvHZfkw</a><small>EMAIL</small><a href="mailto:your@email.com">[your@email.com]</a></address></div></section>
    </main>
    <footer><span>© 2026 [Your Name]. Tournament data on this page is sample content</span></footer>
  </>;
}
