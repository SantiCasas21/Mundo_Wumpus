import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameLogDto, LeaderboardEntryDto } from '../models/game-models';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly apiUrl = 'http://localhost:5000/api/logs';

  constructor(private http: HttpClient) {}

  saveGameLog(log: GameLogDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/games`, log);
  }

  getAllGames(): Observable<GameLogDto[]> {
    return this.http.get<GameLogDto[]>(`${this.apiUrl}/games`);
  }

  getGameLog(gameId: string): Observable<GameLogDto> {
    return this.http.get<GameLogDto>(`${this.apiUrl}/games/${gameId}`);
  }

  getLeaderboard(top: number = 10): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(`${this.apiUrl}/leaderboard?top=${top}`);
  }
}
