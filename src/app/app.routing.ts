import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CatadorComponent } from './catador/catador.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CooperativaComponent } from './cooperativa/cooperativa.component';


const APP_ROUTES: Routes = [
    { path: 'cadastro', component: CatadorComponent },
    { path: 'cooperativa', component: CooperativaComponent },
    { path: 'cadastro2', component: CadastroComponent },
    { path: '', component: HomeComponent },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(APP_ROUTES);
