import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
import { Response } from '@angular/http/src/static_response';
import { Phone } from '../models/phone';

declare var jQuery: any;


@Component({
    selector: 'app-cooperativa',
    templateUrl: './cooperativa.component.html',
    styleUrls: ['./cooperativa.component.css']
})
export class CooperativaComponent implements OnInit {
        
    public loading: Boolean = false;
    public isEditing: boolean = false;

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
            public userDataService: UserDataService,
            private route: ActivatedRoute) {
                
        this.cooperativa = new Cooperativa();
        this.user = new User();
        this.cooperativa.materials_collected = [];
        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            date: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
        };

        var cooperativeId = route.snapshot.params['id'];
        if (cooperativeId)
            this.fillData(cooperativeId);
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

        (<any>$("#datepicker")).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd/mm/yy'
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

    /**
     * Called when edit catadores     
     */
    fillData(catadorId) {
        this.loading = true;
        this.isEditing = true;
        this.cooperativaDataService.get(catadorId).subscribe((res: Response) => {
            var data = res.json();
            this.cooperativa = Object.assign(new Cooperativa, data);

            this.cooperativa.phones.forEach((phone) => {
                if (phone['has_whatsapp']) {
                    phone['whatsapp'] = 1;
                } else {
                    phone['whatsapp'] = 0;
                }
            })

            console.log(this.cooperativa);

            if (!this.cooperativa.phones || this.cooperativa.phones.length == 0) {
                this.cooperativa.phones = [];
                this.cooperativa.phones.push(new Phone());
                this.cooperativa.phones.push(new Phone());
            }  else {
                if (!this.cooperativa.phones[0]) {
                    this.cooperativa.phones[0] = new Phone();
                } 
                if (!this.cooperativa.phones[1]) {
                    this.cooperativa.phones[1] = new Phone();
                }
            }    

            this.cooperativa.materials_collected.forEach(id => {
                var material = this.materialRecover.findMaterialId(id);
                this.materialSelected.push(material.name.toLowerCase());
            });

            var url = this.cooperativaDataService.apiProvider.url.substring(
                0, this.cooperativaDataService.apiProvider.url.length -1);
            var previewEl = $('#preview');
            previewEl.attr('src', url + this.cooperativa['profile_photo']);
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

        this.loadingMessage = 'Cadastrando a cooperativa...';
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

        this.cooperativa.latitude = this.markLat;
        this.cooperativa.longitude = this.markLng;
        this.avatar = $('#preview').attr('src');
        this.cooperativa.founded_in = this.getFormatDate((<any>$("#datepicker")).datepicker( "getDate" ));
        
        if (!this.isEditing) {
            this.cooperativaDataService.save(this.cooperativa, 
                    this.user, 
                    this.avatar, 
                    this.cooperativa.phones, 
                    this.cooperativa.materials_collected).subscribe(res => {
                this.loading = false;
                alert('Cadastro realizado com sucesso!');
                location.href = "/";
            }, error => {
                this.showError(error);
                this.loading = false;
            });

        } else {
            this.user['id'] = parseInt(this.cooperativa['user']);
            this.cooperativaDataService.edit(this.cooperativa, this.user, this.avatar, this.cooperativa.phones).subscribe(res => {
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

            if (error['cooperativa'] || error['user']) {
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
            // location.href = "/";
        }
    }

    sendError(detail) {
        let obj = {
            user: this.user,
            cooperativa: this.cooperativa
        };
        this.userDataService.sendError(detail, obj).subscribe();
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
