import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./core/components/Home/home.routes').then(m => m.HOME_ROUTES) 
  },
  { 
    path: 'bb84-simulator', 
    loadChildren: () => import('./core/components/bb84-simulator/bb84-simulator.routes').then(m => m.BB84_ROUTES) 
  },
    { 
    path: 'code-view', 
    loadChildren: () => import('./core/components/code-view/code-view.routes').then(m => m.CODEVIEW_ROUTES) 
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
