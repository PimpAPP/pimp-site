import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CatadorComponent } from './catador/catador.component';


const APP_ROUTES: Routes = [
    { path: 'cadastro', component: CatadorComponent },
    { path: '', component: HomeComponent },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(APP_ROUTES);
