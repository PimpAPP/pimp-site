import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ApiProvider } from './../providers/ApiProvider';

import { User } from './user';
import { Catador } from './catador';


@Injectable()
export class CatadorDataService {

    public url: string;
    public urlUser: string;

    constructor(public http: Http, public apiProvider: ApiProvider) {
        this.url = this.apiProvider.url + 'api/catadores/';
        this.urlUser = this.apiProvider.url + 'api/users/';
    }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Content-Type', 'application/json');
    }

    saveUser(user: User) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.urlUser, user, {
            headers: headers
        });
    }

    saveCatador(catador: Catador) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.url, catador, {
            headers: headers
        });
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
