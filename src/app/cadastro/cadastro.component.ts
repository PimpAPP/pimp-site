import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.component.html',
    styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {

    public type: string = 'catador';

    constructor() { }

    ngOnInit() {
    
    }

    onChangeType(e) {
        
    }

    next() {

    }

}
