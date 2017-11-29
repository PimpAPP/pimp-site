import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Cooperativa } from '../models/cooperativa';
import { User } from '../models/user';
import { CooperativaDataService } from '../services/cooperativa-data.service';
import { UserDataService } from '../services/user-data.service';
import { MaterialRecover } from '../models/MaterialRecover';
import { MapsAPILoader } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import * as _ from 'underscore';
import { Observable } from "rxjs/Rx";

declare var jQuery: any;


@Component({
    selector: 'app-cooperativa',
    templateUrl: './cooperativa.component.html',
    styleUrls: ['./cooperativa.component.css']
})
export class CooperativaComponent implements OnInit {
        
    public loading: Boolean = false;

    public cooperativa: Cooperativa;
    public user: User;
    public avatar: String;
    public masks: any;
    public materialRecover: MaterialRecover = new MaterialRecover();
    public materialSelected = [];
    public loadingMessage: string = '';

    public mapLatitude: number = -10.314919285813161;
    public mapLongitude: number = -49.21875;
    public zoom: number = 4;
    public markLat: number;
    public markLng: number;

    constructor(public http: Http, 
            public gMaps: GoogleMapsAPIWrapper,
            private router: Router, 
            public cooperativaDataService: CooperativaDataService,
            public userDataService: UserDataService) {
        this.cooperativa = new Cooperativa();
        this.user = new User();
        this.cooperativa.materials_collected = [];
        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
        };
    }

    ngOnInit() {
        this.cooperativa = new Cooperativa();
        this.setCurrentPosition();        
        $(":file")['filestyle']({
            input: true,
            buttonText: 'Selecionar Imagem',
            //buttonName: 'btn btn-primary',
            icon: false
        });

        setTimeout(()=>{
            this.updateMap({lat: this.mapLatitude, lng: this.mapLongitude});
        }, 500);
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

    onClickMap(event: MouseEvent) {
        this.cleanCooperativeAddress();
        this.markLat = event['coords'].lat;
        this.markLng = event['coords'].lng;
        this.updateAddress();
    }

    onMoveMark(event: MouseEvent) {
        this.cleanCooperativeAddress();
        this.markLat = event['coords'].lat;
        this.markLng = event['coords'].lng;
        this.updateAddress();
    }

    save() {
        console.log(this.cooperativa);

        var valid: any = this.cooperativa.valid();
        if (valid !== true) {
            alert('Por favor preencha todos os campos obrigatórios.');
            document.getElementById(valid).focus();
            return;
        }

        if (!this.markLat || !this.markLng) {
            alert('Por favor preencha o endereço');
            return;
        }

        this.avatar = $('#preview').attr('src');
        if (!this.avatar) {
            alert('Por favor selecione uma foto');
            return;
        }

        this.loading = true;

        if (this.cooperativa.user) {
            this.registerCooperativa();
        } else {
            this.loadingMessage = 'Cadastrando o usuário...';
            this.user.username = this.cooperativa.email;
            this.user.password = 'pimp';
            this.user.email = this.cooperativa.email;
            this.user.first_name = '';
            this.user.last_name = '';

            var nameParts = this.cooperativa.name.split(' ');
            var hasLastName = false;
            for (var i=0; i<nameParts.length; i++) {
                if (!hasLastName && (this.user.first_name.length + nameParts[i].length + 1) <= 30) {
                    this.user.first_name += nameParts[i] + ' ';
                } else if ((this.user.last_name.length + nameParts[i].length + 1) <= 30) {
                    this.user.last_name += nameParts[i] + ' ';
                    hasLastName = true;
                }
            }
            
            this.userDataService.saveUser(this.user).subscribe(res => {
                if (res.status == 201) {
                    let data = res.json();
                    this.cooperativa.user = data.id;
                    this.userDataService.login(this.user.username, this.user.password)
                            .subscribe(res => {
                        var data = res.json();
                        this.userDataService.userToken = data.token;
                        this.registerCooperativa();
                    }, error => {
                        console.log(error);
                    });
                } else {
                    console.log('Erro: ' + res);
                    this.showError(res);
                    this.loading = false;
                    alert('Erro ao cadastrar. Por favor verifique os campos preenchidos e tente novamente.');
                }
            }, error => {
                this.showError(error);
            });
        }
    }
    
    registerCooperativa() {
        this.loadingMessage = 'Cadastrando o cooperativa...';
        let new_material_list = [];
        this.cooperativa.materials_collected.forEach(item => { 
            if (item && item.id) {
                new_material_list.push(item.id) 
            }     
            
        });
        this.cooperativa.materials_collected = new_material_list;
        this.cooperativa.latitude = this.markLat;
        this.cooperativa.longitude = this.markLng;

        var cooperativa = Object.assign({}, this.cooperativa);
        delete cooperativa['phones'];
        this.cooperativaDataService.saveCooperativa(cooperativa).subscribe(res => {
            console.log(res);
            let data = res.json();
            this.cooperativa.id = data.id;

            this.cadastrarPhones(this.cooperativa.phones).subscribe(t=> {
                this.loadingMessage = 'Enviando a imagem...';
                this.cadastrarAvatar(this.cooperativa.user).subscribe(result => {
                    this.loading = false;
                    alert('Cooperativa cadastrada com sucesso!');
                    this.cooperativa = new Cooperativa();
                    this.user = new User();
                    this.loadingMessage = '...';    
                    // location.href = "/";
                    this.router.navigateByUrl('/');
                }, error => {
                    this.showError(error);
                })
                
            },  error => {
                this.showError(error);
            });
                
        }, error => {
            console.log(error)
            this.showError(error);            
        });
    }

    showError(error) {
        this.loading = false;
        this.sendError(error);
        alert('Erro ao cadastrar. Por favor verifique os campos preenchidos e tente novamente.');

        try {
            var error = JSON.parse(error._body);
            console.log(error);    
            var msg = '';    
            _.each(error, function(value, key) {
                msg += ' - ' + value[0] + ' \n';
            })    
            alert(msg);
        } catch(err) {
            console.log(err);
        }
    }

    sendError(detail) {
        let obj = {
            user: this.user,
            cooperativa: this.cooperativa
        };
        this.userDataService.sendError(detail, obj).subscribe();
    }

    cadastrarPhones(phones) {
        return this.cooperativaDataService.registerPhones(phones, this.cooperativa.id);
    }

    cadastrarAvatar(userId) {
        this.avatar = $('#preview').attr('src');
        if (!this.avatar) return;
        return this.userDataService.addAvatar({ avatar: this.avatar }, userId);
    }

    selectMaterial(material) {
        let materialSelected = this.materialRecover.findMaterial(material);
        this.cooperativa.addMaterialOrRemoveIfAlreadyIncluded(materialSelected);

        if (this.materialSelected.indexOf(material) > -1) {
            this.materialSelected.splice(this.materialSelected.indexOf(material), 1);
        } else {
            this.materialSelected.push(material);
        }
    }

    private cleanCooperativeAddress() {
        this.cooperativa.address_base = '';
        this.cooperativa.address_region = '';
        this.cooperativa.city = '';
        this.cooperativa.state = '';
        this.cooperativa.country = '';
    }

    updateAddress() {
        let url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.markLat + ',' + this.markLng;

        this.http.get(url).subscribe(data => {
            var res = JSON.parse(data['_body']);
            var results = res.results;

            if (!results || !results[0])
                return;

            for (var x = 0; x < results[0].address_components.length; x++) {
                let item = results[0].address_components[x];

                if (item.types.indexOf('route') >= 0 || item.types.indexOf('street_address') >= 0) {
                    this.cooperativa.address_base = item.long_name;
                    //this.cooperativa.address_base = item.formatted_address;
                } else if (item.types.indexOf('sublocality') >= 0 || 
                        item.types.indexOf('sublocality_level_1') >= 0) {
                    this.cooperativa.address_region = item.long_name;
                } else if (item.types.indexOf('administrative_area_level_2') >= 0) {
                    this.cooperativa.city = item.long_name;
                    //this.cooperativa.city = item.formatted_address;
                } else if (item.types.indexOf('administrative_area_level_1') >= 0) {
                    this.cooperativa.state = item.long_name;
                    //this.cooperativa.state = item.formatted_address;
                } else if (item.types.indexOf('country') >= 0) {
                    this.cooperativa.country = item.long_name;
                }
            }

        }, err => {
            console.log(err);
        });
    }

    addressFocusOut() {
        let address = '';
        if (this.cooperativa.address_base) 
            address += this.cooperativa.address_base;

        if (this.cooperativa.city)
            address += (address) ? ', ' + this.cooperativa.city : this.cooperativa.city;

        if (this.cooperativa.state)
            address += (address) ? ', ' + this.cooperativa.state : this.cooperativa.state;

        if (this.cooperativa.country)
            address += (address) ? ', ' + this.cooperativa.country : this.cooperativa.country;
        
        if (!address) return;
        
        this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address).subscribe(data => {
            var res = JSON.parse(data['_body']);
            var results = res.results;
            if (!results) return;

            var location = results[0]['geometry']['location'];
            this.updateMap(location);
        });
    }

    updateMap(location: any) {
        this.markLat = location.lat;
        this.markLng = location.lng;
        this.mapLatitude = this.markLat;
        this.mapLongitude = this.markLng;
        this.zoom = 12;
        this.gMaps.setCenter({ lat: this.mapLatitude, lng: this.mapLongitude });
    }

    goHome() {
        this.router.navigateByUrl('/');
    }

    guid() {
        const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    } 

    readURL(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = this.updateAvatarPreview;
            reader.readAsDataURL(fileInput.target.files[0]);
            this.resizeImage(fileInput.target.files[0]);
        }
    }

    updateAvatarPreview(e: any) {
        $('#preview').attr('src', e.target.result);
    }

    resizeImage(file) {
        var img = document.createElement("img");
        var reader = new FileReader();  
        reader.onload = function(e) {
            img.src = e.target['result']          
            
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
    
            var MAX_WIDTH = 800;
            var MAX_HEIGHT = 600;
            var width = img.width;
            var height = img.height;
    
            if (width <= MAX_WIDTH && height <= MAX_HEIGHT)
                return;

            var ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);            
            width = width*ratio; 
            height = height*ratio;
            
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
    
            var dataurl = canvas.toDataURL("image/png");
            $('#preview').attr('src', dataurl);     
        }

        reader.readAsDataURL(file);
    }

}
