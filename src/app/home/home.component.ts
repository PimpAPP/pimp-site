import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
        $("body").removeClass("modal-open");
    }

    openCatadorPage() {
        this.router.navigateByUrl('/cadastro');
    }

    openCooperativaPage() {
        this.router.navigateByUrl('/cooperativa');
    }

}
