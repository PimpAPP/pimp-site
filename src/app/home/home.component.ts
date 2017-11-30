import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CatadorComponent } from '../catador/catador.component';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
    }

    openCatadorPage() {
        this.router.navigateByUrl('/cadastro');
    }

    openCooperativaPage() {
        this.router.navigateByUrl('/cooperativa');
    }

}
