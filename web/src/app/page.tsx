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
  ["JOIN OUR DISCORD", "ติดตามประกาศการแข่งขันและช่องทางสมัครเข้าร่วมผ่าน Discord"],
  ["CHECK EVENT DETAILS", "ตรวจสอบกำหนดการ กติกา และรายละเอียดของแต่ละรายการก่อนสมัคร"],
  ["FOLLOW THE RESULTS", "รับชมถ่ายทอดสดและติดตามคะแนนกับผลการแข่งขันได้บนเว็บไซต์นี้"],
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
        <div className="container heroInner"><div className="heroCopy"><span className="tag">PUBG TOURNAMENTS &amp; LIVE SCORES</span><h1>การแข่งขัน <em>PUBG</em><br />และคะแนนสด</h1><p>ติดตามตารางแข่ง ถ่ายทอดสด คะแนนสด และผลการแข่งขันจาก GBG Battlegrounds</p><div className="buttonRow"><Button>JOIN DISCORD</Button><a className="button buttonLight" href="#live">WATCH LIVE</a></div></div><a className="nextMatch" href="#live"><small>FOLLOW THE MATCH</small><strong>LIVE SCORES</strong><span>ดูคะแนนและผลการแข่งขัน</span></a></div>
        <ManagedUpcomingEvents />
      </section>

      <ManagedLiveSection />

      <ManagedPastTournaments />

      <ManagedStandings />

      <TeamLibraryStrip />

      <section className="section infoSection"><div className="container">
        <div className="join" id="join"><h2>HOW TO JOIN</h2>{joinSteps.map(([title, text], index) => <div className="joinRow" key={title}><b>{index + 1}</b><strong>{title}</strong><p>{text}</p></div>)}<Button>JOIN DISCORD TO REGISTER</Button></div>
        <div className="about"><h2>ABOUT</h2><div><strong>GBG Battlegrounds จัดการแข่งขัน PUBG และรวบรวมข้อมูลรายการแข่งขันไว้ในที่เดียว</strong><p>ติดตามกำหนดการ รายละเอียดการสมัคร ถ่ายทอดสด คะแนน และผลการแข่งขันได้จากหน้านี้</p></div></div>
        <ManagedWorkUpdates />
      </div></section>

      <section className="contactSection" id="contact"><div className="contactCard"><div><h2>FOLLOW THE EVENTS OR<br />WORK WITH US</h2><p>ติดตามข่าวสารและติดต่อทีมงานผ่านช่องทางด้านล่าง</p></div><address><small>FACEBOOK</small><a href={FACEBOOK_URL} target="_blank" rel="noreferrer">facebook.com/Phetvaravut</a><small>DISCORD</small><a href={DISCORD_URL} target="_blank" rel="noreferrer">discord.gg/rrJvHZfkw</a></address></div></section>
    </main>
    <footer><span>© {new Date().getFullYear()} GBG Battlegrounds</span></footer>
  </></ManagedHomepageProvider>;
}
