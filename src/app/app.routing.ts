import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { CooperativaComponent } from './cooperativa/cooperativa.component';
import { CadastroCooperativaComponent } from './cadastro-cooperativa/cadastro-cooperativa.component';


const APP_ROUTES: Routes = [
    // { path: 'cadastro', component: CatadorComponent },
    // { path: 'cadastro/:catadorId', component: CatadorComponent },
    { path: 'cadastro', component: CadastroComponent },
    { path: 'cadastro/:catadorId', component: CadastroComponent },
    { path: 'cooperativa', component: CadastroCooperativaComponent },
    { path: 'cooperativa/:id', component: CadastroCooperativaComponent },
    { path: '', component: HomeComponent },
];

export const routing: ModuleWithProviders = RouterModule.forRoot(APP_ROUTES);
