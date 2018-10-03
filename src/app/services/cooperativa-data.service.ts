import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiProvider } from './../providers/ApiProvider';

import { User } from '../models/user';
import { Cooperativa } from '../models/cooperativa';
import { UserDataService } from '../services/user-data.service';

declare var $: any;
declare var jQuery: any;

@Injectable()
export class CooperativaDataService {

    public url: string;

    constructor(public http: HttpClient, public apiProvider: ApiProvider,
            public userDataService: UserDataService) {
        this.url = this.apiProvider.url + 'api/cooperatives/';
    }

    createAuthorizationHeader(headers: HttpHeaders) {
        headers.append('Content-Type', 'application/json');
        if (this.userDataService.userToken) {
            headers.append('Authorization', 'Token ' + this.userDataService.userToken);
            // headers.append('X-CSRFToken', this.getCookie('csrftoken'));
        }
    }

    save(cooperativa: any, user: any, avatar: any, phones: any, materials: any) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        var coop = Object.assign({}, cooperativa);
        delete coop.phones;
        delete coop.materials_collected

        var data = {
            cooperativa: coop,
            user: user,
            avatar: avatar,
            phones: phones,
            materials: materials
        }

        return this.http.post(this.apiProvider.url + 'api/cadastro_cooperativa/', data, {
            headers: headers
        });
    }

    get(id) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.get(this.url + id + '/', {
            headers: headers
        });
    }

    saveCooperativa(cooperativa: Cooperativa) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.url, cooperativa, {
            headers: headers
        });
    }

    registerPhones(phones, cooperativaId) {
        let url = this.url + cooperativaId + '/phones/';
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, phones, {
            headers: headers
        });
    }   

    edit(cooperativa: any, user: any, avatar: any, phones: any) {
        let headers = new HttpHeaders();
        this.createAuthorizationHeader(headers);

        var data = {
            cooperativa: cooperativa,
            user: user,
            avatar: avatar,
            phones: phones
        }

        return this.http.post(this.apiProvider.url + 'api/edit_cooperativa/', data, {
            headers: headers
        });
    }

    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

}
