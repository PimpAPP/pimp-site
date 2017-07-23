import { Component, OnInit } from '@angular/core';
import { Catador } from './catador';

@Component({
    selector: 'app-catador',
    templateUrl: './catador.component.html',
    styleUrls: ['./catador.component.css']
})
export class CatadorComponent implements OnInit {


    public catador: Catador;

    constructor() {
        this.catador = new Catador();
    }

    ngOnInit() {
    }



}
