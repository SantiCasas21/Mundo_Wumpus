import { Routes } from '@angular/router';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';

// La pantalla principal se renderiza directamente en AppComponent
// Estas son rutas secundarias para navegación
export const routes: Routes = [
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'history', component: GameHistoryComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
