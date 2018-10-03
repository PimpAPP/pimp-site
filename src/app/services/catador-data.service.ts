import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiProvider } from './../providers/ApiProvider';


import { User } from '../models/user';
import { Catador } from '../models/catador';


@Injectable()
export class CatadorDataService {

    public url: string;

    constructor(public http: HttpClient, public apiProvider: ApiProvider) {
        this.url = this.apiProvider.url + 'api/catadores/';
    }

    createAuthorizationHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
    }

    save(catador: any, user: any, avatar: any, location: any, phones: any) {
        let headers = new HttpHeaders();
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
        });
    }

    edit(catador: any, user: any, avatar: any, location: any, phones: any) {
        let headers = new HttpHeaders();
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
        });
    }

    saveCatador(catador: Catador) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.url, catador, {
            headers: headers
        });
    }

    getCatador(id) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.get(this.url + id + '/', {
            headers: headers
        });
    }

    registerPhones(phones, catadorId) {
        let url = this.url + catadorId + '/phones/';
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, phones, {
            headers: headers
        });
    }

    updateLocation(location, catadorId) {
        let url = this.url + catadorId + '/georef/';
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, location, {
            headers: headers
        });
    }

}
