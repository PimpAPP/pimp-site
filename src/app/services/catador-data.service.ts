import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ApiProvider } from './../providers/ApiProvider';
import 'rxjs/add/operator/timeout';

import { User } from '../models/user';
import { Catador } from '../models/catador';


@Injectable()
export class CatadorDataService {

    public url: string;

    constructor(public http: Http, public apiProvider: ApiProvider) {
        this.url = this.apiProvider.url + 'api/catadores/';
    }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Content-Type', 'application/json');
    }

    save(catador: any, user: any, avatar: any, location: any, phones: any) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        var data = {
            catador: catador,
            user: user,
            avatar: avatar,
            location: location,
            phones: phones
        }

        return this.http.post(this.apiProvider.url + 'api/cadastro_catador/', data, {
            headers: headers
        }).timeout(360000);
    }

    edit(catador: any, user: any, avatar: any, location: any, phones: any) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        var data = {
            catador: catador,
            user: user,
            avatar: avatar,
            location: location,
            phones: phones
        }

        return this.http.post(this.apiProvider.url + 'api/edit_catador/', data, {
            headers: headers
        }).timeout(360000);
    }

    saveCatador(catador: Catador) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.url, catador, {
            headers: headers
        }).timeout(30000);
    }

    getCatador(id) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.get(this.url + id + '/', {
            headers: headers
        }).timeout(30000);
    }

    registerPhones(phones, catadorId) {
        let url = this.url + catadorId + '/phones/';
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, phones, {
            headers: headers
        });
    }

    updateLocation(location, catadorId) {
        let url = this.url + catadorId + '/georef/';
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, location, {
            headers: headers
        });
    }

}
