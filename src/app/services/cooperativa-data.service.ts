import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ApiProvider } from './../providers/ApiProvider';

import { User } from '../models/user';
import { Cooperativa } from '../models/cooperativa';
import { UserDataService } from '../services/user-data.service';


@Injectable()
export class CooperativaDataService {

    public url: string;

    constructor(public http: Http, public apiProvider: ApiProvider,
            public userDataService: UserDataService) {
        this.url = this.apiProvider.url + 'api/cooperative/';
    }

    createAuthorizationHeader(headers: Headers) {
        headers.append('Content-Type', 'application/json');
        if (this.userDataService.userToken) {
            headers.append('Authorization', 'Token ' + this.userDataService.userToken);
            headers.append('X-CSRFToken', this.getCookie('csrftoken'));
        }
    }

    saveCooperativa(cooperativa: Cooperativa) {
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(this.url, cooperativa, {
            headers: headers
        }).timeout(30000);
    }

    registerPhones(phones, cooperativaId) {
        let url = this.url + cooperativaId + '/phones/';
        let headers = new Headers();
        this.createAuthorizationHeader(headers);

        return this.http.post(url, phones, {
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
