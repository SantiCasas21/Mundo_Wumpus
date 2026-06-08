import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService } from './services/game.service';
import { GameResponse, GameStatus } from './models/game-models';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { StatsPanelComponent } from './components/stats-panel/stats-panel.component';
import { PerceptionsTableComponent } from './components/perceptions-table/perceptions-table.component';
import { ActionsTableComponent } from './components/actions-table/actions-table.component';
import { GameOverModalComponent } from './components/game-over-modal/game-over-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    GameBoardComponent,
    ControlPanelComponent,
    StatsPanelComponent,
    PerceptionsTableComponent,
    ActionsTableComponent,
    GameOverModalComponent
  ],
  template: `
    <div class="app-container">
      <!-- Barra de navegación -->
      <nav class="navbar">
        <div class="nav-brand">
          <span class="logo">🏰</span>
          <h1>Mundo de Wumpus</h1>
        </div>
        <div class="nav-links">
          <button class="nav-btn" (click)="startNewGame()" [disabled]="loading">
            🎮 Nueva Partida
          </button>
          <a routerLink="/leaderboard" class="nav-link">🏆 Leaderboard</a>
          <a routerLink="/history" class="nav-link">📜 Historial</a>
        </div>
      </nav>

      <!-- Router Outlet para páginas secundarias -->
      <router-outlet></router-outlet>

      <!-- Vista principal del juego (solo en la ruta raíz) -->
      <div class="game-layout" *ngIf="showGame">
        <!-- Panel izquierdo: Tablero + Controles -->
        <div class="left-panel">
          <app-game-board
            [board]="gameState?.board ?? []"
            [agentRow]="gameState?.agent?.row"
            [agentCol]="gameState?.agent?.col"
            [visitedCells]="visitedCells"
          ></app-game-board>

          <app-control-panel
            [gameActive]="isGameActive()"
            [hasGold]="gameState?.agent?.hasGold ?? false"
            [gameId]="gameState?.gameId"
            (move)="onMove($event)"
            (grab)="onGrab()"
            (surrender)="onSurrender()"
          ></app-control-panel>
        </div>

        <!-- Panel derecho: Stats + Tablas -->
        <div class="right-panel">
          <app-stats-panel
            [visitedPercentage]="gameState?.visitedPercentage ?? 0"
            [dangerLevel]="gameState?.dangerLevel ?? 0"
            [totalTurns]="gameState?.totalTurns ?? 0"
            [totalActions]="gameState?.totalActions ?? 0"
            [agentHasGold]="gameState?.agent?.hasGold ?? false"
            [gameStatus]="gameState?.status ?? ''"
          ></app-stats-panel>

          <app-perceptions-table
            [perceptions]="gameState?.perceptions"
            [agentRow]="gameState?.agent?.row"
            [agentCol]="gameState?.agent?.col"
          ></app-perceptions-table>

          <app-actions-table
            [actions]="gameState?.actions ?? []"
          ></app-actions-table>
        </div>
      </div>

      <!-- Mensaje de carga / bienvenida -->
      <div class="welcome-screen" *ngIf="!showGame && !loading">
        <div class="welcome-card">
          <h2>🦇 Bienvenido al Mundo de Wumpus</h2>
          <p>
            El legendario juego de exploración y peligro. Encuentra el oro
            y regresa sano a la salida.
          </p>
          <button class="start-btn" (click)="startNewGame()">
            🎮 Comenzar Nueva Partida
          </button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Preparando el mundo...</p>
      </div>

      <!-- Banner de error -->
      <div class="error-banner" *ngIf="errorMessage" (click)="errorMessage = ''">
        ⚠️ {{ errorMessage }}
        <span class="error-close">✕</span>
      </div>
    </div>

    <!-- Modal de fin de juego -->
    <app-game-over-modal
      *ngIf="showGameOver"
      [status]="gameState?.status ?? ''"
      [totalTurns]="gameState?.totalTurns ?? 0"
      [totalActions]="gameState?.totalActions ?? 0"
      [hasGold]="gameState?.agent?.hasGold ?? false"
      (restart)="onRestart()"
      (close)="showGameOver = false"
    ></app-game-over-modal>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
      color: #e0e0e0;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 2rem;
      background: rgba(0, 0, 0, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-brand .logo { font-size: 1.8rem; }
    .nav-brand h1 {
      font-size: 1.3rem;
      background: linear-gradient(90deg, #f0c040, #ff6b35);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-btn {
      padding: 0.5rem 1.2rem;
      background: linear-gradient(135deg, #ff6b35, #f0c040);
      border: none;
      border-radius: 8px;
      color: #1a1a2e;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .nav-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(240, 192, 64, 0.4); }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .nav-link {
      color: #ccc;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.1); color: #f0c040; }

    .game-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 1.5rem;
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: calc(100vh - 90px);
      overflow-y: auto;
    }

    .welcome-screen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
    }

    .welcome-card {
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 500px;
    }

    .welcome-card h2 { font-size: 2rem; margin-bottom: 1rem; color: #f0c040; }
    .welcome-card p { color: #aaa; margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6; }

    .start-btn {
      padding: 1rem 2.5rem;
      background: linear-gradient(135deg, #ff6b35, #f0c040);
      border: none;
      border-radius: 12px;
      color: #1a1a2e;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    .start-btn:hover { transform: scale(1.05); box-shadow: 0 6px 25px rgba(240, 192, 64, 0.5); }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 80px);
      gap: 1rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #f0c040;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-banner {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 68, 68, 0.95);
      color: #fff;
      padding: 0.75rem 2rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      z-index: 2000;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255, 68, 68, 0.4);
      animation: slideUp 0.3s ease;
      max-width: 90vw;
    }

    .error-close {
      margin-left: 1rem;
      opacity: 0.7;
      font-weight: 400;
    }

    .error-banner:hover .error-close { opacity: 1; }

    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    @media (max-width: 900px) {
      .game-layout {
        grid-template-columns: 1fr;
      }
      .right-panel {
        max-height: none;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  gameState: GameResponse | null = null;
  showGame = false;
  loading = false;
  showGameOver = false;
  errorMessage = '';
  visitedCells: Set<string> = new Set();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Escuchar teclado globalmente
  }

  ngOnDestroy(): void {
    // Limpieza si es necesario
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isGameActive()) return;

    const key = event.key.toUpperCase();
    let direction: string | null = null;

    switch (key) {
      case 'W': direction = 'North'; break;
      case 'S': direction = 'South'; break;
      case 'A': direction = 'West'; break;
      case 'D': direction = 'East'; break;
      case 'T': this.onGrab(); return;
      default: return;
    }

    if (direction) {
      event.preventDefault();
      this.onMove(direction);
    }
  }

  startNewGame(): void {
    this.loading = true;
    this.showGame = false;
    this.showGameOver = false;
    this.gameState = null;

    this.gameService.createNewGame().subscribe({
      next: (response) => {
        this.gameState = response;
        this.buildVisitedSet();
        this.showGame = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creando partida:', err);
        this.errorMessage = 'No se pudo crear la partida. ¿Está corriendo el backend?';
        this.loading = false;
      }
    });
  }

  onMove(direction: string): void {
    if (!this.gameState?.gameId || !this.isGameActive()) return;

    this.gameService.move(this.gameState.gameId, direction).subscribe({
      next: (response) => {
        this.gameState = response;
        this.buildVisitedSet();

        if (response.status !== 'InProgress') {
          this.showGameOver = true;
        }
      },
      error: (err) => {
        console.error('Error en movimiento:', err);
        this.errorMessage = 'Error al mover el agente. Revisa la conexión con el servidor.';
      }
    });
  }

  onGrab(): void {
    if (!this.gameState?.gameId || !this.isGameActive()) return;

    this.gameService.grabGold(this.gameState.gameId).subscribe({
      next: (response) => {
        this.gameState = response;
        if (response.status !== 'InProgress') {
          this.showGameOver = true;
        }
      },
      error: (err) => {
        console.error('Error al recoger oro:', err);
        this.errorMessage = 'Error al recoger el oro.';
      }
    });
  }

  onSurrender(): void {
    if (!this.gameState?.gameId) return;

    this.gameService.surrender(this.gameState.gameId).subscribe({
      next: (response) => {
        this.gameState = response;
        this.showGameOver = true;
      },
      error: (err) => {
        console.error('Error al rendirse:', err);
        this.errorMessage = 'Error al procesar la rendición.';
      }
    });
  }

  onRestart(): void {
    this.showGameOver = false;
    this.startNewGame();
  }

  isGameActive(): boolean {
    return this.gameState?.status === 'InProgress';
  }

  private buildVisitedSet(): void {
    this.visitedCells.clear();
    if (this.gameState?.perceptions?.cells) {
      for (const cell of this.gameState.perceptions.cells) {
        if (cell.isVisited) {
          this.visitedCells.add(`${cell.row},${cell.col}`);
        }
      }
    }
  }
}
