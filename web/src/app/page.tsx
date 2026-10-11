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
  ["JOIN OUR DISCORD", "Open the registration channel and post your team name and four players. Entry is free."],
  ["GET THE ROOM CODE", "The organizer sends the custom room code to your captain on Discord 15 minutes before start."],
  ["PLAY AND FOLLOW ALONG", "Watch the stream and live scores here. Final results go up after the last match."],
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
        <div className="container heroInner"><div className="heroCopy"><span className="tag">PUBG TOURNAMENT ORGANIZER</span><h1>WE RUN <em>PUBG</em><br />TOURNAMENTS</h1><p>A small team behind every event. Pick one, join on Discord,<br className="desktopBreak" /> then follow the live scores here.</p><div className="buttonRow"><Button>JOIN DISCORD</Button><a className="button buttonLight" href="#live">WATCH LIVE</a></div></div><aside className="nextMatch"><small>NEXT MATCH</small><strong>Sat 18:30</strong><span>starts in 2d 4h</span></aside></div>
        <ManagedUpcomingEvents />
      </section>

      <ManagedLiveSection />

      <ManagedPastTournaments />

      <ManagedStandings />

      <TeamLibraryStrip />

      <section className="section infoSection"><div className="container">
        <div className="join" id="join"><h2>HOW TO JOIN</h2>{joinSteps.map(([title, text], index) => <div className="joinRow" key={title}><b>{index + 1}</b><strong>{title}</strong><p>{text}</p></div>)}<Button>JOIN DISCORD TO REGISTER</Button></div>
        <div className="about"><h2>ABOUT</h2><div><strong>We are a small team that runs PUBG tournaments and builds this site for each event, so rules, schedule, scores and payout proof live in one place.</strong><p>[Add your story: team name, how long you have organized events, the biggest event so far, who does what.] What we do: organizing, live streaming, graphics, web design.</p></div></div>
        <ManagedWorkUpdates />
      </div></section>

      <section className="contactSection" id="contact"><div className="contactCard"><div><h2>FOLLOW THE EVENTS OR<br />WORK WITH US</h2><p>Questions and collaboration offers are welcome on any channel.</p></div><address><small>FACEBOOK</small><a href={FACEBOOK_URL} target="_blank" rel="noreferrer">facebook.com/Phetvaravut</a><small>DISCORD</small><a href={DISCORD_URL} target="_blank" rel="noreferrer">discord.gg/rrJvHZfkw</a><small>EMAIL</small><a href="mailto:your@email.com">[your@email.com]</a></address></div></section>
    </main>
    <footer><span>© 2026 [Your Name]. Tournament data on this page is sample content</span></footer>
  </></ManagedHomepageProvider>;
}
