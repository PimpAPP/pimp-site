import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Catador } from './catador';
import { User } from './user';
import { Phone } from './phone';
import { CatadorDataService } from './catador-data.service';
import { MaterialRecover } from './MaterialRecover';


@Component({
    selector: 'app-catador',
    templateUrl: './catador.component.html',
    styleUrls: ['./catador.component.css']
})
export class CatadorComponent implements OnInit {


    public catador: Catador;
    public user: User;
    public materialRecover: MaterialRecover = new MaterialRecover();
    public materialSelected = [];
    public phone1 = new Phone();
    public phone2 = new Phone();
    public masks: any;


    constructor(private router: Router,
        public catadorDataService: CatadorDataService) {
        this.catador = new Catador();
        this.user = new User();
        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        };
    }

    ngOnInit() {

    }

    goHome() {
        this.router.navigateByUrl('/');
    }

    save() {
        console.log(this.catador);

        if (!this.catador.valid()) {
            alert('Por favor preencha todos os campos obrigatórios.');
            return;
        }

        this.user.username = this.user.email;

        this.catador.phones = [];
        this.catador.phones.push(this.phone1);
        this.catador.phones.push(this.phone2);

        this.catadorDataService.saveUser(this.user).subscribe(res => {
            if (res.status == 201) {
                let data = res.json();
                this.catador.user = data.id;
                this.registerCatador();
            } else {
                console.log('Erro: ' + res);
            }
        });

    }

    registerCatador() {
        let new_material_list = [];
        this.catador.materials_collected.forEach(
            item => { new_material_list.push(item.id) });
        this.catador.materials_collected = new_material_list;

        this.catadorDataService.saveCatador(this.catador)
            .subscribe(res => {
                console.log(res);
                let data = res.json();                
                this.catador.id = data.id;
                this.cadastrarPhones(this.catador.phones);
            });
    }

    cadastrarPhones(phones) {
        return this.catadorDataService.registerPhones(phones, this.catador.id).subscribe(data => {
            this.router.navigateByUrl('/');
            alert('Catador cadastrado com sucesso!');
        }, err => {
            console.log(err);
        });;
    }

    selectMaterial(material) {
        let materialSelected = this.materialRecover.findMaterial(material);
        this.catador.addMaterialOrRemoveIfAlreadyIncluded(materialSelected);
        
        if (this.materialSelected.indexOf(material) > -1) {
            this.materialSelected.splice(this.materialSelected.indexOf(material), 1);
        } else {
            this.materialSelected.push(material);
        }    
    }




}
