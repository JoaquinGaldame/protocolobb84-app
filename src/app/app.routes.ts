import { Routes } from '@angular/router';

export const routes: Routes = [
//   { 
//     path: '', 
//     loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES) 
//   },
  { 
    path: 'bb84-simulator', 
    loadChildren: () => import('./core/components/bb84-simulator.routes').then(m => m.BB84_ROUTES) 
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
