import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class UtilDataService {
    
    // public headers = new Headers();
    public headers = new HttpHeaders();
    public MAP_API_KEY = 'AIzaSyDS7AxBMmoeRanMxs4-VJJ87I9hMKp-d1E';

    constructor(public http: HttpClient) {
        this.headers.append('Content-Type', 'application/json');
    }

    getStateAndCityList() {
        return this.http.get('/assets/json/estados_cidades.json', {
            headers: this.headers
        });
    }

}
