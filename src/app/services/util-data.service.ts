import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class UtilDataService {
    
    public headers = new Headers();

    constructor(public http: Http) {
        this.headers.append('Content-Type', 'application/json');
    }

    getStateAndCityList() {
        return this.http.get('/assets/json/estados_cidades.json', {
            headers: this.headers
        });
    }

}
