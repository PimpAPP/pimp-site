import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { CatadorComponent } from './catador/catador.component';
import { HomeComponent } from './home/home.component';
import { CatadorDataService } from './catador/catador-data.service';
import { ApiProvider } from './providers/ApiProvider';
import { TextMaskModule } from 'angular2-text-mask';
import { AgmCoreModule, MarkerManager, GoogleMapsAPIWrapper } from '@agm/core';


@NgModule({
    declarations: [
        AppComponent,
        CatadorComponent,
        HomeComponent
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
        CatadorDataService,
        ApiProvider,
        MarkerManager,
        GoogleMapsAPIWrapper
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
