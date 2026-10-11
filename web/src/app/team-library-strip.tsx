"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { Team } from "../types/tournament";

function TeamLogoRail({ teams, duplicate = false }: { teams: Team[]; duplicate?: boolean }) {
  return <div className="teamTickerGroup" aria-hidden={duplicate || undefined}>{teams.map((team) => {
    const color = team.team_color && /^[\da-f]{6}(?:[\da-f]{2})?$/i.test(team.team_color)
      ? `#${team.team_color.slice(0, 6)}`
      : "#f3f3ef";
    const shortName = team.short_name?.trim() || team.name.slice(0, 3).toUpperCase();

    return <div className="teamItem" key={`${duplicate ? "copy-" : ""}${team.id}`}>
      {team.logo
        ? <img className="teamLogo teamLogoImage" src={team.logo} alt="" />
        : <span className="teamLogo" style={{ "--team-color": color } as React.CSSProperties}>{shortName}</span>}
      <strong>{team.name}</strong>
    </div>;
  })}</div>;
}

export function TeamLibraryStrip() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTeams() {
      const { data, error: queryError } = await supabase
        .from("teams")
        .select("id, name, short_name, logo, team_color")
        .eq("active", true)
        .order("name", { ascending: true });

      if (!mounted) return;
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setTeams(data ?? []);
      setError(null);
      setLoading(false);
    }

    void loadTeams();
    return () => {
      mounted = false;
    };
  }, []);

  return <section className="teamsStrip" id="teams">
    <div className="container">
      <div className="teamsStripHeading">
        <div>
          <h2>TEAMS IN THE LIBRARY</h2>
          <p><strong>{loading ? "…" : teams.length}</strong><span>{loading ? "loading teams" : `active ${teams.length === 1 ? "team" : "teams"} from the admin library`}</span></p>
        </div>
        <small>GBG TEAM LIBRARY</small>
      </div>
    </div>
    <div className="teamTicker" aria-busy={loading}>
      {error
        ? <p className="teamLibraryError" role="alert">Unable to load teams: {error}</p>
        : loading
          ? <p className="teamLibraryStatus" role="status">Loading teams…</p>
          : teams.length === 0
            ? <p className="teamLibraryStatus">No active teams in the library yet.</p>
            : <div className="teamTickerTrack"><TeamLogoRail teams={teams} /><TeamLogoRail teams={teams} duplicate /></div>}
    </div>
    <div className="container"><small className="teamLogoNote">Team names and logos are synced from the team admin library</small></div>
  </section>;
}
