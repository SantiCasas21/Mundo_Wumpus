import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GameResponse } from '../models/game-models';

@Injectable({ providedIn: 'root' })
export class GameService {
  // En Docker, el API Gateway se expone en el puerto 5000 del host
  // Para desarrollo local, también usa localhost:5000
  private readonly apiUrl = 'http://localhost:5000/api/game';

  constructor(private http: HttpClient) {}

  /** Crea una nueva partida. */
  createNewGame(): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/new`, {});
  }

  /** Mueve el agente en la dirección indicada. */
  move(gameId: string, direction: string): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/${gameId}/move`, { direction });
  }

  /** Recoge el oro. */
  grabGold(gameId: string): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/${gameId}/grab`, {});
  }

  /** Se rinde. */
  surrender(gameId: string): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/${gameId}/surrender`, {});
  }

  /** Obtiene el estado actual de una partida. */
  getGameState(gameId: string): Observable<GameResponse> {
    return this.http.get<GameResponse>(`${this.apiUrl}/${gameId}`);
  }

  /** Obtiene la tabla de percepciones. */
  getPerceptions(gameId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${gameId}/perceptions`);
  }
}
