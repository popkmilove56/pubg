export type TournamentStatus = "active" | "complete" | "archived";

export interface Tournament {
  id: string;
  name: string;
  category: string;
  status: TournamentStatus;
  current_map: number;
  total_maps: number;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo: string | null;
  team_color: string | null;
}
