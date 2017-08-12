import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import { Catador } from './catador';
import { User } from './user';
import { Phone } from './phone';
import { CatadorDataService } from './catador-data.service';
import { MaterialRecover } from './MaterialRecover';
import { MapsAPILoader } from '@agm/core';



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

    public mapLatitude: number = -10.314919285813161;
    public mapLongitude: number = -49.21875;
    public zoom: number = 4;

    public markLat: number;
    public markLng: number;

    public avatar: String;


    constructor(private router: Router,
        public catadorDataService: CatadorDataService,
        public http: Http) {

        this.catador = new Catador();
        this.user = new User();
        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        };
    }

    ngOnInit() {
        this.setCurrentPosition();
        $(":file")['filestyle']({
            input: false, 
            buttonText: 'Selecionar Imagem', 
            buttonName: 'col-md-12 btn btn-primary'
        });
    }

    goHome() {
        this.router.navigateByUrl('/');
    }

    save() {
        if (!this.catador.valid()) {
            alert('Por favor preencha todos os campos obrigatórios.');
            return;
        }

        if (!this.markLat || !this.markLng) {
            alert('Por favor preencha o endereço');
            return;
        }

        let username = (this.catador.name) ?
            this.catador.name.replace(/[^A-Z0-9]/ig, "_") :
            this.catador.nickname.replace(/[^A-Z0-9]/ig, "_");

        this.user.username = username;
        this.user.password = 'pimp';
        this.user.email = '';

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
                var promises = [];
                promises.push(this.cadastrarPhones(this.catador.phones));
                promises.push(this.cadastrarLocation(this.catador.id));
                promises.push(this.cadastrarAvatar(this.catador.user));
                Promise.all(promises).then(function success(res){
                    //this.router.navigateByUrl('/');
                    location.href = "/";
                    alert('Catador cadastrado com sucesso!');
                }, function error(res){
                    alert('Algum erro ocorreu ao cadastrar o catador, por favor tente novamente mais tarde.');
                })
            });
    }

    cadastrarPhones(phones) {
        return this.catadorDataService.registerPhones(phones, this.catador.id).subscribe(data => {
            console.log(data);
        }, err => {
            console.log(err);
        });;
    }

    cadastrarLocation(catadorId) {
        var location = {
            latitude: this.markLat,
            longitude: this.markLng
        }

        return this.catadorDataService.updateLocation(location, catadorId)
            .subscribe(res => {
                console.log(res);
            });
    }

    cadastrarAvatar(userId) {
        this.avatar = $('#preview').attr('src');        
        if (!this.avatar) return;

        return this.catadorDataService.addAvatar({ avatar: this.avatar }, userId).subscribe(res => {
            console.log(res);
        }, err => {
            console.log(err);
        });
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

    onClickMap(event: MouseEvent) {
        this.markLat = event['coords'].lat;
        this.markLng = event['coords'].lng;
        this.updateAddress();
    }

    updateAddress() {
        let url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.markLat + ',' + this.markLng;

        this.http.get(url).subscribe(data => {
            var res = JSON.parse(data['_body']);
            var results = res.results;

            for (var x = 0; x < results.length; x++) {
                let item = results[x];

                if (item.types.indexOf('route') >= 0 || item.types.indexOf('street_address') >= 0) {
                    this.catador.address_base = item.formatted_address;
                } else if (item.types.indexOf('administrative_area_level_2') >= 0) {
                    this.catador.city = item.formatted_address;
                } else if (item.types.indexOf('administrative_area_level_1') >= 0) {
                    this.catador.state = item.formatted_address;
                } else if (item.types.indexOf('country') >= 0) {
                    this.catador.country = item.formatted_address;
                }
            }

        }, err => {
            console.log(err);
        });;
    }

    onMoveMark(event: MouseEvent) {
        this.markLat = event['coords'].lat;
        this.markLng = event['coords'].lng;
        this.updateAddress();
    }

    private setCurrentPosition() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.mapLatitude = position.coords.latitude;
                this.mapLongitude = position.coords.longitude;
                this.zoom = 12;

                this.markLat = this.mapLatitude;
                this.markLng = this.mapLongitude;

                this.updateAddress();
            });
        }
    }

    updateAvatarPreview(e: any) {
        $('#preview').attr('src', e.target.result);
    }

    readURL(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = this.updateAvatarPreview;
            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }

   

}