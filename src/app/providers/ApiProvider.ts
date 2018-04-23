import { Injectable } from '@angular/core';


@Injectable()
export class ApiProvider {
    
    public url:string = 'http://192.168.0.100:8000/';    
    // public url:string = 'http://179.188.38.243/'; // Oficial server
    

    constructor() { 
        
    }
}
