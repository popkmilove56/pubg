import { MotionObserver } from "./motion-observer";
import {
  ManagedHomepageProvider,
  ManagedLiveSection,
  ManagedPastTournaments,
  ManagedStandings,
  ManagedUpcomingEvents,
  ManagedWorkUpdates,
} from "./managed-homepage";
import { SiteNav } from "./site-nav";
import { TeamLibraryStrip } from "./team-library-strip";

const FACEBOOK_URL = "https://www.facebook.com/Phetvaravut?locale=th_TH";
const DISCORD_URL = "https://discord.gg/rrJvHZfkw";
const joinSteps = [
  ["JOIN OUR DISCORD", "Follow tournament announcements and find registration details on Discord."],
  ["CHECK EVENT DETAILS", "Review each event's schedule, rules, and registration details before joining."],
  ["FOLLOW THE RESULTS", "Watch live streams and follow scores and final results here."],
];

function Button({ children, href = DISCORD_URL }: { children: React.ReactNode; href?: string }) {
  return <a className="button" href={href} target="_blank" rel="noreferrer">{children}</a>;
}

export default function Home() {
  return <ManagedHomepageProvider><>
    <MotionObserver />
    <SiteNav />
    <main>
      <section className="hero" id="home">
        <div className="heroArt" aria-hidden="true"><video className="heroBackgroundVideo" autoPlay muted loop playsInline preload="auto"><source src="/media/hero-fluid-flow.mp4" type="video/mp4" /></video></div>
        <div className="container heroInner"><div className="heroCopy"><span className="tag">PUBG TOURNAMENT ORGANIZER</span><h1>WE RUN <em>PUBG</em><br />TOURNAMENTS</h1><p>A small team behind every event. Pick one, join on Discord,<br className="desktopBreak" /> then follow the live scores here.</p><div className="buttonRow"><Button>JOIN DISCORD</Button><a className="button buttonLight" href="#live">WATCH LIVE</a></div></div><a className="nextMatch" href="#live"><small>FOLLOW THE MATCH</small><strong>LIVE SCORES</strong><span>View scores and tournament results</span></a></div>
        <ManagedUpcomingEvents />
      </section>

      <ManagedLiveSection />

      <ManagedPastTournaments />

      <ManagedStandings />

      <TeamLibraryStrip />

      <section className="section infoSection"><div className="container">
        <div className="join" id="join"><h2>HOW TO JOIN</h2>{joinSteps.map(([title, text], index) => <div className="joinRow" key={title}><b>{index + 1}</b><strong>{title}</strong><p>{text}</p></div>)}<Button>JOIN DISCORD TO REGISTER</Button></div>
        <div className="about"><h2>ABOUT</h2><div><strong>GBG Battlegrounds organizes PUBG tournaments and brings event information together in one place.</strong><p>Follow schedules, registration details, live streams, scores, and tournament results here.</p></div></div>
        <ManagedWorkUpdates />
      </div></section>

      <section className="contactSection" id="contact"><div className="contactCard"><div><h2>FOLLOW THE EVENTS OR<br />WORK WITH US</h2><p>Follow the events or get in touch with our team through these channels.</p></div><address><small>FACEBOOK</small><a href={FACEBOOK_URL} target="_blank" rel="noreferrer">facebook.com/Phetvaravut</a><small>DISCORD</small><a href={DISCORD_URL} target="_blank" rel="noreferrer">discord.gg/rrJvHZfkw</a></address></div></section>
    </main>
    <footer><span>© {new Date().getFullYear()} GBG Battlegrounds</span></footer>
  </></ManagedHomepageProvider>;
}
