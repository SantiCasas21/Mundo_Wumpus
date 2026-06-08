export interface GameResponse {
  gameId: string;
  status: string;
  agent: AgentDto;
  board: string[][];
  perceptions: PerceptionSnapshot;
  visitedPercentage: number;
  dangerLevel: number;
  totalTurns: number;
  totalActions: number;
  moveValid?: boolean;
  grabResult?: string;
  actions: ActionDto[];
}

export interface AgentDto {
  row: number;
  col: number;
  hasGold: boolean;
  turn: number;
}

export interface PerceptionSnapshot {
  cells: PerceptionCell[];
}

export interface PerceptionCell {
  row: number;
  col: number;
  hasBreeze: boolean;
  hasStench: boolean;
  hasGlitter: boolean;
  isVisited: boolean;
}

export interface ActionDto {
  turnNumber: number;
  action: string;
  description: string;
  timestamp: string;
}

export interface MoveRequest {
  direction: string;
}

export interface GameLogDto {
  gameId: string;
  status: string;
  totalTurns: number;
  totalActions: number;
  agentHasGold: boolean;
  agentFinalRow: number;
  agentFinalCol: number;
  startedAt: string;
  endedAt?: string;
  score: number;
  durationSeconds: number;
  actions: ActionDto[];
}

export interface LeaderboardEntryDto {
  gameId: string;
  score: number;
  totalTurns: number;
  durationSeconds: number;
  endedAt?: string;
}

/** Estados de juego conocidos */
export type GameStatus = 'InProgress' | 'Won' | 'DiedPit' | 'DiedWumpus' | 'Surrendered';
