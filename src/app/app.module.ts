import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { CatadorComponent } from './catador/catador.component';
import { HomeComponent } from './home/home.component';
import { CatadorDataService } from './services/catador-data.service';
import { CooperativaDataService } from './services/cooperativa-data.service';
import { ApiProvider } from './providers/ApiProvider';
import { TextMaskModule } from 'angular2-text-mask';
import { AgmCoreModule, MarkerManager, GoogleMapsAPIWrapper } from '@agm/core';
import { CooperativaComponent } from './cooperativa/cooperativa.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { UserDataService } from 'app/services/user-data.service';
import { UtilDataService } from 'app/services/util-data.service';


@NgModule({
    declarations: [
        AppComponent,
        CatadorComponent,
        HomeComponent,
        CooperativaComponent,
        CadastroComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        TextMaskModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDS7AxBMmoeRanMxs4-VJJ87I9hMKp-d1E',
            libraries: ["places"]
        })
    ],
    providers: [
        {provide: LocationStrategy, useClass: PathLocationStrategy},
        CatadorDataService,
        CooperativaDataService,
        UserDataService,
        UtilDataService,
        ApiProvider,
        MarkerManager,
        GoogleMapsAPIWrapper
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
