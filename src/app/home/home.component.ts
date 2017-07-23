import { Component, OnInit } from '@angular/core';

import { CatadorComponent } from '../catador/catador.component';
import { Router } from '@angular/router';


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

}
