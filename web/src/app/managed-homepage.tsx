"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase/client";
import "./managed-homepage.css";

type EventCard = {
  badge: string;
  date: string;
  registrationStatus: "open" | "ended";
  title: string;
  note: string;
  details: string;
  imageUrl: string;
  tone: "green" | "pink" | "purple";
  action: string;
  href: string;
};

type WorkUpdate = {
  title: string;
  summary: string;
  detail: string;
  imageUrl: string;
};

type HomepageContent = {
  upcomingEvents: EventCard[];
  live: {
    isOnAir: boolean;
    streamLabel: string;
    matchTitle: string;
    description: string;
    streamUrl: string;
    replayUrl: string;
    tournamentId: string;
  };
  pastTournamentIds: string[];
  pastTournamentMedia: Record<string, { imageUrl: string; details: string }>;
  featuredTournamentId: string;
  workTitle: string;
  workUpdates: WorkUpdate[];
};

type Tournament = {
  id: string;
  name: string;
  category: string | null;
  status: string;
  total_maps: number;
  current_map: number;
  created_at: string;
  team_ids: string[] | null;
  team_slots: (string | null)[] | null;
  points_adjustments: Record<string, number> | null;
  kills_adjustments: Record<string, number> | null;
};

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  logo: string | null;
  team_color: string | null;
  active: boolean;
};

type MapRow = {
  id: string;
  tournament_id: string;
  map_number: number;
  status: string;
};

type MapScore = {
  map_id: string;
  team_id: string;
  kills: number;
  placement_points: number;
};

type Standing = Team & { points: number; kills: number };

const defaults: HomepageContent = {
  upcomingEvents: [
    { badge: "OPEN", date: "Sat 18:30", registrationStatus: "open", title: "1ST GREEN TOURNAMENT", note: "32 teams · 3,700 THB prize pool", details: "", imageUrl: "", tone: "green", action: "JOIN ON DISCORD", href: "https://discord.gg/rrJvHZfkw" },
    { badge: "WEEKLY", date: "Fri 20:00", registrationStatus: "open", title: "POINTS SCRIM", note: "Entry [price]", details: "", imageUrl: "", tone: "pink", action: "JOIN ON DISCORD", href: "https://discord.gg/rrJvHZfkw" },
    { badge: "SOON", date: "[Date]", registrationStatus: "open", title: "SEASON FINALE", note: "Details to be announced", details: "", imageUrl: "", tone: "purple", action: "NOTIFY ME", href: "https://discord.gg/rrJvHZfkw" },
  ],
  live: { isOnAir: false, streamLabel: "Streamed on Facebook Live", matchTitle: "FINAL · MATCH 2 OF 3", description: "The real Facebook or YouTube stream is embedded here.", streamUrl: "https://www.facebook.com/Phetvaravut?locale=th_TH", replayUrl: "", tournamentId: "" },
  pastTournamentIds: [],
  pastTournamentMedia: {},
  featuredTournamentId: "",
  workTitle: "WORK & UPDATES",
  workUpdates: [
    { title: "GRAPHICS", summary: "Posters, leaderboards and stream overlays", detail: "Updates for graphics will appear here.", imageUrl: "" },
    { title: "TEAM UPDATES", summary: "Rosters, results and announcements", detail: "Updates for team updates will appear here.", imageUrl: "" },
    { title: "BEHIND THE SCENES", summary: "How each event is built and run", detail: "Updates from behind the scenes will appear here.", imageUrl: "" },
    { title: "SITE & TOOLS", summary: "The pages and tools behind the events", detail: "Updates about the site and tools will appear here.", imageUrl: "" },
  ],
};

type HomepageData = {
  content: HomepageContent;
  tournaments: Tournament[];
  teams: Team[];
  maps: MapRow[];
  scores: MapScore[];
  loading: boolean;
  error: string | null;
};

const initialData: HomepageData = {
  content: defaults,
  tournaments: [],
  teams: [],
  maps: [],
  scores: [],
  loading: true,
  error: null,
};

const HomepageContext = createContext<HomepageData>(initialData);
const useHomepage = () => useContext(HomepageContext);

function normalizeContent(value: Partial<HomepageContent> | null | undefined): HomepageContent {
  return {
    ...defaults,
    ...value,
    live: { ...defaults.live, ...value?.live },
    upcomingEvents: Array.isArray(value?.upcomingEvents)
      ? value.upcomingEvents.map((event, index) => ({
        ...defaults.upcomingEvents[index % defaults.upcomingEvents.length],
        ...event,
        registrationStatus: event.registrationStatus === "ended" ? "ended" : "open",
        details: event.details || "",
        imageUrl: event.imageUrl || "",
      }))
      : defaults.upcomingEvents,
    pastTournamentIds: Array.isArray(value?.pastTournamentIds) ? value.pastTournamentIds : [],
    pastTournamentMedia: value?.pastTournamentMedia && typeof value.pastTournamentMedia === "object" ? value.pastTournamentMedia : {},
    workUpdates: Array.isArray(value?.workUpdates)
      ? value.workUpdates.map((item, index) => ({
        ...defaults.workUpdates[index % defaults.workUpdates.length],
        ...item,
        imageUrl: item.imageUrl || "",
      }))
      : defaults.workUpdates,
  };
}

export function ManagedHomepageProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<HomepageData>(initialData);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [contentResult, tournamentResult, teamResult, mapResult, scoreResult] = await Promise.all([
        supabase.from("site_content").select("content").eq("key", "homepage").maybeSingle(),
        supabase.from("tournaments").select("id,name,category,status,total_maps,current_map,created_at,team_ids,team_slots,points_adjustments,kills_adjustments").order("created_at", { ascending: false }),
        supabase.from("teams").select("id,name,short_name,logo,team_color,active"),
        supabase.from("maps").select("id,tournament_id,map_number,status"),
        supabase.from("map_scores").select("map_id,team_id,kills,placement_points"),
      ]);

      const queryError = contentResult.error || tournamentResult.error || teamResult.error || mapResult.error || scoreResult.error;
      if (!mounted) return;
      if (queryError) {
        setData({ ...initialData, loading: false, error: queryError.message });
        return;
      }

      setData({
        content: normalizeContent(contentResult.data?.content),
        tournaments: (tournamentResult.data || []) as Tournament[],
        teams: (teamResult.data || []) as Team[],
        maps: (mapResult.data || []) as MapRow[],
        scores: (scoreResult.data || []) as MapScore[],
        loading: false,
        error: null,
      });
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return <HomepageContext.Provider value={data}>
    {data.error && <div className="managedGlobalError" role="alert">Some homepage content could not be loaded: {data.error}</div>}
    {children}
  </HomepageContext.Provider>;
}

function statusMessage({ loading }: HomepageData) {
  if (loading) return <p className="managedStatus" role="status">Loading website content…</p>;
  return null;
}

function safeHref(value: string) {
  const href = value.trim();
  if (/^https?:\/\//i.test(href) || href.startsWith("/") || href.startsWith("#")) return href;
  return "";
}

function liveVideoEmbed(value: string) {
  try {
    const videoUrl = new URL(value);
    const hostname = videoUrl.hostname.toLowerCase();
    const isFacebookHost = hostname === "facebook.com"
      || hostname.endsWith(".facebook.com")
      || hostname === "fb.watch";
    const isFacebookVideoLink = hostname === "fb.watch"
      || videoUrl.searchParams.has("v")
      || /\/(videos?|watch|live|reel|share\/v)(\/|$)/i.test(videoUrl.pathname);
    if (isFacebookHost && videoUrl.protocol === "https:" && isFacebookVideoLink) {
      return {
        provider: "facebook",
        url: `https://www.facebook.com/plugins/video.php?${new URLSearchParams({
          href: videoUrl.toString(),
          show_text: "false",
          autoplay: "true",
          mute: "true",
        }).toString()}`,
      };
    }

    const isYouTubeHost = hostname === "youtube.com"
      || hostname === "www.youtube.com"
      || hostname === "m.youtube.com"
      || hostname === "youtu.be";
    if (!isYouTubeHost || videoUrl.protocol !== "https:") return null;

    const videoId = hostname === "youtu.be"
      ? videoUrl.pathname.split("/").filter(Boolean)[0]
      : videoUrl.searchParams.get("v") || videoUrl.pathname.match(/^\/(?:live|embed|shorts)\/([^/?]+)/)?.[1];
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;

    return {
      provider: "youtube",
      url: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&controls=1&rel=0`,
    };
  } catch {
    return null;
  }
}

function tournamentTeams(tournament: Tournament, teams: Team[]) {
  const ids = tournament.team_slots?.length
    ? tournament.team_slots.filter((id): id is string => Boolean(id))
    : tournament.team_ids?.length
      ? tournament.team_ids
      : teams.filter((team) => team.active).map((team) => team.id);
  return ids.map((id) => teams.find((team) => team.id === id)).filter((team): team is Team => Boolean(team));
}

function standingsFor(tournament: Tournament, data: HomepageData): Standing[] {
  const selectedTeams = tournamentTeams(tournament, data.teams);
  const tournamentMaps = data.maps.filter((map) => map.tournament_id === tournament.id);
  const countedMaps = tournamentMaps.filter((map) => map.status === "completed" || map.status === "live");
  const countedMapIds = new Set(countedMaps.map((map) => map.id));

  return selectedTeams.map((team) => {
    const total = data.scores
      .filter((score) => score.team_id === team.id && countedMapIds.has(score.map_id))
      .reduce((sum, score) => ({ points: sum.points + score.kills + score.placement_points, kills: sum.kills + score.kills }), { points: 0, kills: 0 });
    return {
      ...team,
      points: total.points + Number(tournament.points_adjustments?.[team.id] || 0),
      kills: total.kills + Number(tournament.kills_adjustments?.[team.id] || 0),
    };
  }).sort((a, b) => b.points - a.points || b.kills - a.kills || a.name.localeCompare(b.name));
}

function TeamLogo({ team, className = "logo" }: { team: Team; className?: string }) {
  if (team.logo) return <img className={className} src={team.logo} alt="" />;
  return <span className={`${className} placeholderLogo`}>{team.short_name?.slice(0, 3) || team.name.slice(0, 1)}</span>;
}

function CardPopup({ title, imageUrl, onClose, children }: { title: string; imageUrl: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return createPortal(<div className="cardPopupBackdrop" role="presentation" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section className="cardPopup" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="cardPopupClose" onClick={onClose} aria-label="Close details">×</button>
      {imageUrl && <img className="cardPopupImage" src={imageUrl} alt="" />}
      <div className="cardPopupBody"><h2>{title}</h2>{children}</div>
    </section>
  </div>, document.body);
}

export function ManagedUpcomingEvents() {
  const data = useHomepage();
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const events = data.content.upcomingEvents.filter((event) => event.title?.trim());
  return <div className="container upcomingBlock">
    <div className="miniHeading"><b>UPCOMING EVENTS</b><a href="#tournaments">All events →</a></div>
    {statusMessage(data)}
    {events.length
      ? <div className="eventGrid">{events.map((event, index) => {
        return <article className={`eventCard ${event.tone} ${event.imageUrl ? "hasCardImage" : ""}`} key={`${event.title}-${index}`} role="button" tabIndex={0} aria-haspopup="dialog" onClick={() => setSelectedEvent(event)} onKeyDown={(keyEvent) => {
          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
            keyEvent.preventDefault();
            setSelectedEvent(event);
          }
        }}>
          <div className="eventTop">{event.imageUrl && <img className="cardCoverImage" src={event.imageUrl} alt="" />}<span>{event.badge}</span><strong>{event.date}</strong><span className={`eventRegistrationStatus ${event.registrationStatus}`}>{event.registrationStatus === "open" ? "OPEN FOR REGISTRATION" : "COMPLETED"}</span></div>
          <div className="eventBody"><h3>{event.title}</h3><p>{event.note}</p><span className="cardOpenHint">VIEW DETAILS ↗</span></div>
        </article>;
      })}</div>
      : <p className="managedStatus">No upcoming events have been published yet.</p>}
    {selectedEvent && <CardPopup title={selectedEvent.title} imageUrl={selectedEvent.imageUrl} onClose={() => setSelectedEvent(null)}>
      <p className="cardPopupMeta">{selectedEvent.badge} · {selectedEvent.date}</p>
      <p>{selectedEvent.note}</p>
      {selectedEvent.details && <p className="cardPopupDetails">{selectedEvent.details}</p>}
      {safeHref(selectedEvent.href || "") && <a className="button" href={safeHref(selectedEvent.href || "")} target={selectedEvent.href?.startsWith("http") ? "_blank" : undefined} rel={selectedEvent.href?.startsWith("http") ? "noreferrer" : undefined}>{selectedEvent.action || "LEARN MORE"}</a>}
    </CardPopup>}
  </div>;
}

export function ManagedLiveSection() {
  const data = useHomepage();
  const { live } = data.content;
  const tournament = data.tournaments.find((item) => item.id === live.tournamentId);
  const liveScores = tournament ? standingsFor(tournament, data).slice(0, 5) : [];
  const streamUrl = safeHref(live.streamUrl);
  const liveEmbed = streamUrl ? liveVideoEmbed(streamUrl) : null;
  const replayUrl = safeHref(live.replayUrl);
  const stateLabel = live.isOnAir ? "● ON AIR" : "○ OFF AIR";

  return <section className="section liveSection" id="live"><div className="container">
    <div className="sectionHeading"><h2>LIVE <span className={live.isOnAir ? "managedOnAir" : "managedOffAir"}>{stateLabel}</span></h2><small>{live.streamLabel}</small></div>
    {statusMessage(data)}
    <div className="liveGrid">
      <div><div className="videoCard"><div className={`videoStage ${liveEmbed ? "embeddedVideoStage" : ""}`}>
        {liveEmbed && <iframe className="liveVideoEmbed" src={liveEmbed.url} title={`${live.matchTitle || `${liveEmbed.provider} Live`} video player`} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen loading="lazy" />}
        <span>{live.isOnAir ? "LIVE" : "OFF AIR"}</span><b>{live.matchTitle}</b>
        {streamUrl && !liveEmbed && <a className="managedPlay" href={streamUrl} target="_blank" rel="noreferrer" aria-label="Open live stream">▶</a>}
      </div><div className="videoInfo"><h3>{live.matchTitle || "Tournament stream"}</h3><p>{live.description}</p></div></div>
        <div className="buttonRow">{streamUrl && <a className="button" href={streamUrl} target="_blank" rel="noreferrer">WATCH STREAM</a>}{replayUrl && <a className="button buttonDark" href={replayUrl} target="_blank" rel="noreferrer">REPLAY</a>}</div>
      </div>
      <div className="scoreBoard"><small>{tournament ? `${tournament.name} · LIVE SCORES` : "LIVE SCORES"}</small>
        {liveScores.length ? liveScores.map((team, index) => <div className="scoreRow" key={team.id}><b>{index + 1}</b><TeamLogo team={team} className="liveScoreLogo" /><strong>{team.name}</strong><span>—</span><em>{team.points}</em></div>) : <p className="managedStatus">{live.tournamentId ? "No scores recorded for this Tournament yet." : "Choose a live Tournament in Website Content to show its scores."}</p>}
      </div>
    </div>
  </div></section>;
}

export function ManagedPastTournaments() {
  const data = useHomepage();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const selected = data.content.pastTournamentIds
    .map((id) => data.tournaments.find((item) => item.id === id))
    .filter((tournament): tournament is Tournament => Boolean(tournament));

  return <section className="pastSection" id="tournaments"><div className="container">
    <div className="sectionHeading darkText"><h2>PAST TOURNAMENTS</h2><a href="#standings">View standings</a></div>
    {statusMessage(data)}
    {selected.length
      ? <div className="pastGrid">{selected.map((tournament, index) => {
        const results = standingsFor(tournament, data);
        const winner = results[0];
        const tone = ["paper", "purple", "blue"][index % 3];
        const date = tournament.created_at ? new Date(tournament.created_at).toLocaleDateString() : "";
        const media = data.content.pastTournamentMedia[tournament.id];
        return <article className={`pastCard ${tone} ${media?.imageUrl ? "hasCardImage" : ""}`} key={tournament.id} role="button" tabIndex={0} aria-haspopup="dialog" onClick={() => setSelectedTournament(tournament)} onKeyDown={(keyEvent) => {
          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
            keyEvent.preventDefault();
            setSelectedTournament(tournament);
          }
        }}>
          <div className="pastTop">{media?.imageUrl && <img className="cardCoverImage" src={media.imageUrl} alt="" />}<small>{tournament.status === "complete" ? "FINAL · COMPLETED" : tournament.status.toUpperCase()}</small><strong>{date}</strong><span>{tournament.category || "Tournament"} · {results.length} teams</span></div>
          <div className="pastBottom"><h3>{tournament.name}</h3><p>{winner ? <>Winner: <strong className="pastWinnerName">{winner.name}</strong> · <em className="pastWinnerPoints">{winner.points} PTS</em></> : "Final results are not available yet."}<br /><span className="cardOpenHint">VIEW DETAILS ↗</span></p></div>
        </article>;
      })}</div>
      : <p className="managedStatus">Select completed Tournaments in Website Content to publish past results.</p>}
    {selectedTournament && (() => {
      const results = standingsFor(selectedTournament, data);
      const media = data.content.pastTournamentMedia[selectedTournament.id];
      return <CardPopup title={selectedTournament.name} imageUrl={media?.imageUrl || ""} onClose={() => setSelectedTournament(null)}>
        <p className="cardPopupMeta">{selectedTournament.status === "complete" ? "FINAL · COMPLETED" : selectedTournament.status.toUpperCase()} · {selectedTournament.category || "Tournament"}</p>
        {media?.details && <p className="cardPopupDetails">{media.details}</p>}
        {results.length > 0 && <div className="popupStandings"><h3>FINAL STANDINGS</h3>{results.map((team, index) => <div className="popupStandingRow" key={team.id}><b>{index + 1}</b><TeamLogo team={team} className="popupTeamLogo" /><strong>{team.name}</strong><span>{team.kills} KILLS</span><em>{team.points} PTS</em></div>)}</div>}
      </CardPopup>;
    })()}
  </div></section>;
}

export function ManagedStandings() {
  const data = useHomepage();
  const tournament = data.tournaments.find((item) => item.id === data.content.featuredTournamentId);
  const rows = tournament ? standingsFor(tournament, data).slice(0, 3) : [];
  const tones = ["green", "purple", "blue"];

  return <section className="section standings" id="standings"><div className="container">
    <div className="sectionHeading"><div><small>FROM THE LATEST TOURNAMENT</small><h2>{tournament ? `${tournament.name} · FINAL STANDINGS` : "FINAL STANDINGS"}</h2></div>{tournament && <a href={`/detail?id=${encodeURIComponent(tournament.id)}`}>Full table</a>}</div>
    {statusMessage(data)}
    {rows.length
      ? <div className="podiumGrid">{rows.map((team, index) => <article className={`podiumCard ${tones[index]} rank${index + 1}`} key={team.id}>
        <div className="podiumTop"><strong>{index + 1}</strong><span className="teamBadge"><TeamLogo team={team} className="podiumLogo" /></span><b>{team.short_name || team.name.slice(0, 3).toUpperCase()}</b></div>
        <div className="podiumBottom"><div><small>{team.kills} KILL</small><small>{team.points - team.kills} PTS R</small></div><em>{team.points}<i>PTS</i></em><h3>{team.name}</h3></div>
      </article>)}</div>
      : <p className="managedStatus">{tournament ? "No team results are available for this Tournament yet." : "Choose a Tournament in Website Content to publish final standings."}</p>}
  </div></section>;
}

export function ManagedWorkUpdates() {
  const data = useHomepage();
  const [active, setActive] = useState<number | null>(0);
  return <div className="work" id="work">
    <div className="workTitle"><h2>{data.content.workTitle || "WORK & UPDATES"}</h2><span>Hover a row to see the latest.</span></div>
    {statusMessage(data)}
    {data.content.workUpdates.map((item, index) => {
      const isOpen = active === index;
      return <div className={`workItem ${isOpen ? "isOpen" : ""}`} key={`${item.title}-${index}`} onMouseEnter={() => setActive(index)}>
        <button className="workSummary" type="button" aria-expanded={isOpen} onClick={() => setActive(isOpen ? null : index)} onFocus={() => setActive(index)}>
          <small>{String(index + 1).padStart(2, "0")}</small><strong>{item.title}</strong><span>{item.summary}</span><b>{isOpen ? "×" : "+"}</b>
        </button>
        <div className="workReveal" aria-hidden={!isOpen}>
          <div className="workRevealContent">
            {item.imageUrl && <img className="workUpdateImage" src={item.imageUrl} alt={`${item.title} update`} />}
            {item.detail && <p>{item.detail}</p>}
          </div>
        </div>
      </div>;
    })}
  </div>;
}
