import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CooperativaDataService } from '../services/cooperativa-data.service';
import { UserDataService } from '../services/user-data.service';
import { User } from '../models/user';
import { Cooperativa } from '../models/cooperativa';
import { MaterialRecover } from '../models/MaterialRecover';
import { Phone } from '../models/phone';
import { UtilDataService } from '../services/util-data.service';
import * as _ from 'underscore';

declare var $: any;
declare var document: any;

@Component({
    selector: 'app-cadastro-cooperativa',
    templateUrl: './cadastro-cooperativa.component.html',
    styleUrls: ['./cadastro-cooperativa.component.css']
})
export class CadastroCooperativaComponent implements OnInit {
        
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
    public partnerLoading: Boolean = false;
    public parceiro = {
        name: '',
        image: ''
    }
   
    public stateCityList: any;

    constructor(public http: HttpClient, 
            public gMaps: GoogleMapsAPIWrapper,
            private router: Router, 
            public cooperativaDataService: CooperativaDataService,
            public userDataService: UserDataService,
            private route: ActivatedRoute,
            public utilDataService: UtilDataService) {
                
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

        (<any>$("#datepicker")).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd/mm/yy'
        });

        setTimeout(()=>{
            this.getStateCityList();
            this.updateMap({lat: this.mapLatitude, lng: this.mapLongitude});
        }, 500);
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

    getStateCityList() {
        this.utilDataService.getStateAndCityList().subscribe((res) => {
            this.stateCityList = res;
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
    
            this.forceUpdateStateCitySelect(this.cooperativa.state, this.cooperativa.city);
        })
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

    private cleanCooperativeAddress() {
        this.cooperativa.address_base = '';
        this.cooperativa.address_region = '';
        this.cooperativa.city = '';
        this.cooperativa.state = '';
        this.cooperativa.country = '';
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

    updateMap(location: any) {
        this.markLat = location.lat;
        this.markLng = location.lng;
        this.mapLatitude = this.markLat;
        this.mapLongitude = this.markLng;
        this.zoom = 12;
        this.gMaps.setCenter({ lat: this.mapLatitude, lng: this.mapLongitude });
    }

    updateAddress() {
        let url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + 
                this.markLat + ',' + this.markLng +
                '&key=' + this.utilDataService.MAP_API_KEY;

        this.http.get(url).subscribe(data => {
            var res = data;
            var results = res['results'];

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
        
        var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + this.utilDataService.MAP_API_KEY;
        this.http.get(url).subscribe(data => {
            var res = data;
            var results = res['results'];
            if (!results) return;

            if (results[0] && results[0]['geometry'] && results[0]['geometry']['location']) {
                var location = results[0]['geometry']['location'];
                this.updateMap(location);
            }
        });
    }

    /**
     * Called when edit cooperativas     
     */
    fillData(catadorId) {
        this.loading = true;
        this.isEditing = true;
        this.cooperativaDataService.get(catadorId).subscribe( res => {
            var data = res;
            this.cooperativa = Object.assign(new Cooperativa, data);

            console.log(this.cooperativa);
            this.cooperativa.phones.forEach((phone) => {
                if (phone['has_whatsapp']) {
                    phone['whatsapp'] = 1;
                } else {
                    phone['whatsapp'] = 0;
                }
            })

            if (this.cooperativa.founded_in && this.cooperativa.founded_in.indexOf('-') >= 0) {
                var parts = this.cooperativa.founded_in.split('-');
                this.cooperativa.founded_in = parts[2] + '/' + parts[1] + '/' + parts[0];
            }

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

    selectMaterial(material) {
        let materialSelected = this.materialRecover.findMaterial(material);
        this.cooperativa.addMaterialOrRemoveIfAlreadyIncluded(materialSelected);

        if (this.materialSelected.indexOf(material) > -1) {
            this.materialSelected.splice(this.materialSelected.indexOf(material), 1);
        } else {
            this.materialSelected.push(material);
        }
    }

    readURL(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = this.updateAvatarPreview;
            reader.readAsDataURL(fileInput.target.files[0]);
            this.resizeImage(fileInput.target.files[0]);
        }
    }

    readLogoURL(fileInput) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            var reader = new FileReader();
            reader.onload = this.updateAvatarPreview;

            var reader = new FileReader();  
            reader.onload = (e: any) => {
                var dataUrl = this.resizeImage(e.target.result);
                $('#preview').attr('src', dataUrl);
            }
    
            reader.readAsDataURL(fileInput.target.files[0]);
        }
    }

    updateAvatarPreview(e: any) {
        var previewEl = $('#preview');
        previewEl.css('margin-bottom', '10px');
        previewEl.css('display', 'unset');
        previewEl.attr('src', e.target.result);
    }

    guid() {
        const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
    }    

    resizeLogoImage(file) {
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

    resizeImage(file) {
        var img = document.createElement("img");
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var MAX_WIDTH = 800;
        var MAX_HEIGHT = 600;
        var width = img.width;
        var height = img.height;

        if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
            return file;
        }

        var ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);            
        width = width*ratio; 
        height = height*ratio;
        
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        var dataurl = canvas.toDataURL("image/png");
        return dataurl;
    }

    readGalleryURL(event) {
        // this.cooperativa.photos = [];
        if(event.target.files && event.target.files.length > 0) {
            let files = event.target.files;
            for (var x=0; x<files.length; x++) {
                var reader = new FileReader();
                reader.onload = (e: any) => {
                    var dataUrl = this.resizeImage(e.target.result);
                    this.addImageOnGallery(dataUrl);
                };

                reader.readAsDataURL(files[x]);
            }
        }
    }

    addImageOnGallery(url) {
        this.cooperativa.photos.push(url);
    }

    removeImageOnGallery(photo) {
        if (typeof photo == 'string') {
            for (var x=0; x<this.cooperativa.photos.length; x++) {
                if (typeof this.cooperativa.photos[x] == 'string') {
                    if (this.cooperativa.photos[x] == photo) {
                        this.cooperativa.photos.splice(x, 1);
                    }
                }
            }
        } else {
            photo.delete = true;
        }
    }

    getGallerySrc(photo) {
        if (typeof photo == 'string') {
            return photo;
        } else {
            var apiUrl = this.userDataService.apiProvider.url;
            return apiUrl.substring(0, apiUrl.length - 1) + photo['full_photo'];
        }
    }

    readPartnerURL(event) {
        this.partnerLoading = true;
        if(event.target.files && event.target.files.length > 0) {
            let file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = (e: any) => {
                var dataUrl = this.resizeImage(e.target.result);
                this.addImageOnPartner(dataUrl)
            };

            reader.readAsDataURL(file);
        }
    }

    addImageOnPartner(src){
        this.parceiro.image = src;
        this.partnerLoading = false;
    }

    addPartner(partner) {
        if (partner.name && partner.image) {
            this.cooperativa.partners.push(partner);
            this.cleanPartner();
        } else {
            alert('Por favor preencha o nome e selecione uma nova imagem para o parceiro.');
        }
    }

    removePartner(partner) {
        partner.delete = true;
    }

    cleanPartner() {
        this.parceiro = {
            name: '',
            image: ''
        }

        var file = document.getElementById('parceiro-image-input');
        file['value'] = '';
    }

    getPartnerSrc(partner) {
        if (partner.image.startsWith('/media/')) {
            var apiUrl = this.userDataService.apiProvider.url;
            return apiUrl.substring(0, apiUrl.length - 1) + partner.image;
        } else {
            return partner.image;
        }
    }

    goHome() {
        this.router.navigateByUrl('/');
    }

    getFormatDate(date: any) {
        if (!date)
            return '';

        var m = (date.getMonth() + 1) + '';
        if (m.length == 1)
            m = '0' + m;

        var d = date.getDate() + '';
        if (d.length == 1)
            d = '0' + d;

        return date.getFullYear() + '-' + m + '-' + d;
    }

    showError(error) {
        this.loading = false;
        this.sendError(error);
        console.log(this.cooperativa);

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
                    // location.href = "/";
                } else {
                    alert('Erro ao cadastrar. Por favor tente novamente mais tarde.');
                    // location.href = "/";
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

}
