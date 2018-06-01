import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

import { Catador } from '../models/catador';
import { User } from '../models/user';
import { Phone } from '../models/phone';
import { CatadorDataService } from '../services/catador-data.service';
import { UserDataService } from '../services/user-data.service';
import { MaterialRecover } from '../models/MaterialRecover';
import { MapsAPILoader } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import * as _ from 'underscore';
import { Observable } from "rxjs/Rx";
import { Response } from '@angular/http/src/static_response';
import { setTimeout } from 'timers';

// declare var $: any;
// declare var window: any;
declare var document: any;

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.component.html',
    styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit {

    public loading: boolean = false;
    public isEditing: boolean = false;
    public showMap: boolean = false;

    public catador: Catador = new Catador();
    public user: User;
    public materialRecover: MaterialRecover = new MaterialRecover();
    public materialSelected = [];
    public masks: any;

    public mapLatitude: number = -10.314919285813161;
    public mapLongitude: number = -49.21875;
    public zoom: number = 4;

    public markLat: number;
    public markLng: number;
    public avatar: String;
    public loadingMessage: string = '';

    public checkboxValue;

    //private geocoder: google.maps.Geocoder;


    constructor(private router: Router,
        public catadorDataService: CatadorDataService,
        public userDataService: UserDataService,
        public http: Http, public gMaps: GoogleMapsAPIWrapper,
        private route: ActivatedRoute) {

        this.catador = new Catador();
        this.catador.materials_collected = [];
        this.user = new User();
        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            date: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
        };

        var catadorId = route.snapshot.params['catadorId'];
        if (catadorId)
            this.fillData(catadorId);

        //this.geocoder = new google.maps.Geocoder();
    }

    ngOnInit() {
        this.catador = new Catador();
        this.user = new User();        
        this.setCurrentPosition();        
        /*$(":file")['filestyle']({
            input: true,
            buttonText: '',
            //buttonName: 'btn btn-primary',
            icon: true,
            iconName: "glyphicon glyphicon-camera",
            buttonBefore: true,
            placeholder: "Selecionar imagem"
        }); */

        (<any>$("#datepicker")).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd/mm/yy'
        });

        // TODO: call jquery custom input
        

        // document.getElementById('fake-file-button-browse').addEventListener('click', function () {
        //     document.getElementById('img-file').click();
        // });

        // document.getElementById('files-input-upload').addEventListener('change', function () {
        //     document.getElementById('fake-file-input-name').value = this.value;

        //     document.getElementById('fake-file-button-upload').removeAttribute('disabled');
        // });
    }

    /**
     * Called when edit catadores     
     */
    fillData(catadorId) {
        this.loading = true;
        this.isEditing = true;
        this.catadorDataService.getCatador(catadorId).subscribe((res: Response) => {
            var data = res.json();
            this.catador = Object.assign(new Catador, data);
            // this.catador = <Catador>res.json();

            this.catador.phones.forEach((phone) => {
                if (phone['has_whatsapp']) {
                    phone['whatsapp'] = 1;
                } else {
                    phone['whatsapp'] = 0;
                }
            })

            console.log(this.catador);

            if (!this.catador.phones) {
                this.catador.phones = [];
                this.catador.phones.push(new Phone());
                this.catador.phones.push(new Phone());
            } else if (!this.catador.phones[0]) {
                this.catador.phones[0] = new Phone();
            } else if (!this.catador.phones[1]) {
                this.catador.phones[1] = new Phone();
            }

            this.catador.materials_collected.forEach(id => {
                var material = this.materialRecover.findMaterialId(id);
                this.materialSelected.push(material.name.toLowerCase());
            });

            var url = this.catadorDataService.apiProvider.url.substring(0, this.catadorDataService.apiProvider.url.length -1);
            var previewEl = $('#preview');
            previewEl.attr('src', url + this.catador['profile_photo']);
            previewEl.css('margin-bottom', '10px');
            previewEl.css('display', 'unset');

            // if (this.catador.year_of_birth) {
            //     var a = this.catador.year_of_birth.split('-');
            //     var date = a[2] + '/' + a[1] + '/' + a[0];

            //     setTimeout(function() {
            //         (<any>$("#datepicker")).datepicker("setDate", date);
            //     }, 500);
            // }
            
            this.loading = false;
        }, (error) => {
            console.log(error);
            this.loading = false;
            this.router.navigateByUrl('/');
        });
    }

    goHome() {
        this.router.navigateByUrl('/');
    }
    
    nextStep() { 
        this.showMap = true;
    }

    save() { 
        var valid: any = this.catador.valid();
        if (valid !== true) {
            alert('Por favor preencha todos os campos obrigatórios.');
            document.getElementById(valid).focus();
            return;
        }

        if (!this.markLat || !this.markLng) {
            alert('Por favor selecione no mapa a sua localização.');
            return;
        }

        this.avatar = $('#preview').attr('src');
        if (!this.avatar) {
            alert('Por favor selecione uma foto');
            return;
        }

        this.loading = true;

        this.loadingMessage = 'Cadastrando o usuário...';
        this.user.username = this.guid();
        this.user.password = 'pimp';
        this.user.email = '';
        this.user.first_name = '';
        this.user.last_name = '';

        var nameParts = this.catador.name.split(' ');
        var hasLastName = false;
        for (var i=0; i<nameParts.length; i++) {
            if (!hasLastName && (this.user.first_name.length + nameParts[i].length + 1) <= 30) {
                this.user.first_name += nameParts[i] + ' ';
            } else if ((this.user.last_name.length + nameParts[i].length + 1) <= 30) {
                this.user.last_name += nameParts[i] + ' ';
                hasLastName = true;
            }
        }

        this.avatar = $('#preview').attr('src');
        // this.catador.year_of_birth = this.getFormatDate((<any>$("#datepicker")).datepicker( "getDate" ));

        var position = {
            latitude: this.markLat,
            longitude: this.markLng
        }

        if (!this.isEditing) {
            this.catadorDataService.save(this.catador, this.user, this.avatar, position, this.catador.phones).subscribe(res => {
                this.loading = false;
                alert('Cadastro realizado com sucesso!');
                location.href = "/";
            }, error => {
                this.showError(error);
                this.loading = false;
            });
        } else {
            this.user['id'] = parseInt(this.catador['user']);
            this.catadorDataService.edit(this.catador, this.user, this.avatar, position, this.catador.phones).subscribe(res => {
                this.loading = false;
                alert('Alteração realizada com sucesso!');
                location.href = "/";
            }, error => {
                this.showError(error);
                this.loading = false;
            });
        }    
    }

    showError(error) {
        this.loading = false;
        this.sendError(error);

        try {            
            var error = error.json();
            alert('Erro ao cadastrar. Por favor verifique os campos preenchidos e tente novamente.');

            if (error['catador'] || error['user']) {
                var msg = '';
                _.each(error, function(value, key) {
                    if (value instanceof Object) {
                        // _.each(value, function(value2, key2) {
                        for (var i in Object.keys(value)) {
                            var value2 = value[i];
                            if (value2 instanceof Array) {
                                msg += i + ' - ' + value2[0] + ' \n';
                            } else {
                                msg += i + ' - ' + value2 + ' \n';
                            }
                        }
                    } else {
                        msg += key + ' - ' + value + ' \n';
                    }
                    
                })    
                alert(msg);
            } else {
                if (Object.keys(error).length > 0) {
                    alert(error);
                    location.href = "/";
                } else {
                    alert('Erro ao cadastrar. Por favor tente novamente mais tarde.');
                    location.href = "/";
                }    
            }
            
        } catch(err) {
            alert('Erro ao cadastrar. Por favor tente novamente mais tarde.');
            location.href = "/";
        }
    }

    sendError(detail) {
        let obj = {
            user: this.user,
            catador: this.catador
        };
        this.userDataService.sendError(detail, obj).subscribe();
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
        this.cleanCatadorAddress();
        this.markLat = event['coords'].lat;
        this.markLng = event['coords'].lng;
        this.updateAddress();
    }

    private cleanCatadorAddress() {
        this.catador.address_base = '';
        this.catador.address_region = '';
        this.catador.city = '';
        this.catador.state = '';
        this.catador.country = '';
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
                    this.catador.address_base = item.long_name;
                    //this.catador.address_base = item.formatted_address;
                } else if (item.types.indexOf('sublocality') >= 0 || 
                        item.types.indexOf('sublocality_level_1') >= 0) {
                    this.catador.address_region = item.long_name;
                } else if (item.types.indexOf('administrative_area_level_2') >= 0) {
                    this.catador.city = item.long_name;
                    //this.catador.city = item.formatted_address;
                } else if (item.types.indexOf('administrative_area_level_1') >= 0) {
                    this.catador.state = item.long_name;
                    //this.catador.state = item.formatted_address;
                } else if (item.types.indexOf('country') >= 0) {
                    this.catador.country = item.long_name;
                }
            }

        }, err => {
            console.log(err);
        });
    }

    addressFocusOut() {
        let address = '';
        if (this.catador.address_base) 
            address += this.catador.address_base;

        if (this.catador.city)
            address += (address) ? ', ' + this.catador.city : this.catador.city;

        if (this.catador.state)
            address += (address) ? ', ' + this.catador.state : this.catador.state;

        if (this.catador.country)
            address += (address) ? ', ' + this.catador.country : this.catador.country;
        
        this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address).subscribe(data => {
            var res = JSON.parse(data['_body']);
            var results = res.results;
            if (!results) return;

            if (results[0] && results[0]['geometry'] && results[0]['geometry']['location']) {
                var location = results[0]['geometry']['location'];
                this.updateMap(location);
            } else {
                // alert('Endereço não encontrado. Por favor verifique se os dados foram preenchidos corretamente ou selecione no mapa o seu endereço.')
            }
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

    onMoveMark(event: MouseEvent) {
        this.cleanCatadorAddress();
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
        var previewEl = $('#preview');
        previewEl.css('margin-bottom', '10px');
        previewEl.css('display', 'unset');
        previewEl.attr('src', e.target.result);
    }

    readURL(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = this.updateAvatarPreview;
            reader.readAsDataURL(fileInput.target.files[0]);
            this.resizeImage(fileInput.target.files[0]);
        }
    }

    guid() {
        const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
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

    calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {        
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);    
        return { width: srcWidth*ratio, height: srcHeight*ratio };
    }

    getFormatDate(date: any) {
        var m = (date.getMonth() + 1) + '';
        if (m.length == 1)
            m = '0' + m;

        var d = date.getDate() + '';
        if (d.length == 1)
            d = '0' + d;

        return date.getFullYear() + '-' + m + '-' + d;
    }
}
