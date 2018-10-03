import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiProvider } from './../providers/ApiProvider';
import { User } from '../models/user';


@Injectable()
export class UserDataService {

    public url = this.apiProvider.url + 'api/users/';
    public urlLogin = this.apiProvider.url + 'api/api-token-auth/';
    public headers = new HttpHeaders();
    public isLogged: boolean = false;
    public userToken: string = '';

    constructor(public http: HttpClient, public apiProvider: ApiProvider) {
        this.headers.append('Content-Type', 'application/json');
    }

    saveUser(user: User) {
        return this.http.post(this.url, user, {
            headers: this.headers
        });
    }    

    addAvatar(data, userId) {        
        let url = this.url + userId + '/photos/';
        return this.http.post(url, data, {headers: this.headers});
    }

    login(email, password) {
        return this.http.post(this.urlLogin, { username: email, password: password }, {
            headers: this.headers
        });
    }

    logout() {
        this.userToken = '';
        this.isLogged = false;
    }

    sendError(error, obj) {
        let url = this.url + 1 + '/add_error/';
        return this.http.post(url, {detail: error, object: obj}, {
            headers: this.headers
        });
    }

}
