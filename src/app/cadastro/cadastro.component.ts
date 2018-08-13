import { Catador } from './../models/catador';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

import { User } from '../models/user';
import { Phone } from '../models/phone';
import { CatadorDataService } from '../services/catador-data.service';
import { UtilDataService } from '../services/util-data.service';
import { UserDataService } from '../services/user-data.service';
import { MaterialRecover } from '../models/MaterialRecover';
import { MapsAPILoader } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import * as _ from 'underscore';
import { Observable } from "rxjs/Rx";
import { Response } from '@angular/http/src/static_response';
import { setTimeout } from 'timers';
import { LocalStorage } from '@ngx-pwa/local-storage';

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
    public stateCityList: any;

    constructor(private router: Router,
        public catadorDataService: CatadorDataService,
        public userDataService: UserDataService,
        public utilDataService: UtilDataService,
        public http: Http, public gMaps: GoogleMapsAPIWrapper,
        private route: ActivatedRoute, 
        protected localStorage: LocalStorage) {

        this.masks = {
            number: ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
            date: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
        };

        this.user = new User();
        var catadorId = route.snapshot.params['catadorId'];

        // If is Editing
        if (catadorId) {
            this.fillData(catadorId);
        } else {
            this.localStorage.getItem<Catador>('cataki-catador').subscribe((catador) => {
                if (catador != null) {
                    this.catador = Object.assign(this.catador, catador);
                } else {
                    this.catador = new Catador();
                    this.catador.materials_collected = [];
                }
            })
        }
    }

    ngOnInit() {
        this.scrollToTop();
        // this.catador = new Catador();
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

        this.getStateCityList();
    
        // TODO: call jquery custom input
        

        // document.getElementById('fake-file-button-browse').addEventListener('click', function () {
        //     document.getElementById('img-file').click();
        // });
    }

    scrollToTop() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
    
    getStateCityList() {
        this.utilDataService.getStateAndCityList().subscribe((res) => {
            this.stateCityList = res.json();
        })
    }

    startCityAndStateSelect() {
        var data = this.stateCityList;
        var options = '<option value="">Escolha um estado</option>';
        
        $.each(data, function (key, val) {
            options += '<option value="' + val.nome + '">' + val.nome + '</option>';
        });		

        $("#state").html(options);				
        $("#state").change(function () {				
            var options_cidades = '';
            var str = "";					
            
            $("#state option:selected").each(function () {
                str += $(this).text();
            });
            
            $.each(data, function (key, val) {
                if(val.nome == str) {							
                    $.each(val.cidades, function (key_city, val_city) {
                        options_cidades += '<option value="' + val_city + '">' + val_city + '</option>';
                    });							
                }
            });

            $("#city").html(options_cidades);
            
        }).change();

        this.forceUpdateStateCitySelect(this.catador.state, this.catador.city);
    }

    forceUpdateStateCitySelect(state, city) {
        if (state && city) {
            setTimeout(() => {
                $('#state').val(state);
                $('#state').change();
                $('#city').val(city);
            }, 500);
        }
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

            // console.log(this.catador);

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

            this.forceUpdateStateCitySelect(this.catador.state, this.catador.city);
            
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
    
    toggleMap() { 
        var valid: any = this.catador.valid([
            'name',
            'nickname',
            'presentation_phrase',
            'minibio',
            'phones0'
        ]);
        
        if (valid !== true) {
            alert('Por favor preencha todos os campos obrigatórios. ');
            document.getElementById(valid).focus();
            return;
        }
        
        this.showMap = !this.showMap;
        
        if (this.showMap) {
            setTimeout(() => {
                this.startCityAndStateSelect();
            }, 500);
        }
    }  

    save() { 
        var valid: any = this.catador.valid();
        
        if (valid !== true) {
            alert('Por favor preencha todos os campos obrigatórios. ');
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
                this.localStorage.removeItem('cataki-catador').subscribe(() => {});
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
                this.localStorage.removeItem('cataki-catador').subscribe(() => {});
                alert('Alteração realizada com sucesso!');
                location.href = "/";
            }, error => {
                this.showError(error);
                this.loading = false;
            });
        }    
    }

    cancel() {
        this.localStorage.removeItem('cataki-catador').subscribe(() => {});
        location.href = "/";
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
                }
            }

            this.forceUpdateStateCitySelect(this.catador.state, this.catador.city);

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

        if (!address) return;
        
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
        } else {
            console.log("Geolocation is not supported by this browser.");
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

    onFocusOut() {
        this.localStorage.setItem('cataki-catador', this.catador).subscribe(() => {});
    }

}
