import { Phone } from './phone'
import { Material } from './material';


export class Catador {

    public id: number = 0;
    public name: string = '';
    public prefererUseName: boolean = true;
    public email: string = '';
    public password: string = '';
    public minibio: string = '';
    public nickname: string = '';
    public presentation_phrase: string = '';
    //public birthDay: Date = new Date();
    public phones: Array<Phone> = new Array<Phone>();
    public address_base: string = '';
    public number: string = '';
    public address_region: string = '';
    public region: string = '';
    public city: string = '';
    public state: string = '';
    public country: string = '';
    public kg_day: number;
    public how_many_days_work_week: number;
    public how_many_years_work: number;
    public belongsCooperative: boolean = false;
    public cooperative_name: string = '';
    public iron_work: string = '';
    public materials_collected: Array<any> = new Array<any>();
    public safety_kit: boolean = false;
    public has_motor_vehicle: boolean = false;
    public has_smartphone_with_internet: boolean = false;
    public safety_kit_boot: boolean = false;
    public safety_kit_gloves: boolean = false;
    public safety_kit_brakes: boolean = false;
    public safety_kit_reflective_tapes: boolean = false;
    public safety_kit_rearview: boolean = false;
    public carroca_pimpada: boolean = false;
    public registered_by_another_user: boolean = false;
    public another_user_name: string = '';
    public another_user_email: string = '';
    public another_user_whatsapp: string = '';
    public image: string = '';
    public year_of_birth: any;
    public user: string = '';

    constructor() {
        this.phones[0] = new Phone();
        this.phones[1] = new Phone();
    }

    /**
     * Return true if valid and the field name if invalid
     */
    valid(fields = []) {

        if (fields.length == 0) 
            fields = [
                'name',
                'nickname',
                'presentation_phrase',
                'minibio',
                'phones0',
                'address_base',
                'number',
                'address_region',
                'city',
                'state',
                'country',
                'cooperative_name',
                'kg_day',
                'how_many_days_work_week',
                'how_many_years_work',
                'region'
            ];

        var errors = [];
        for (var x=0; x<fields.length; x++) {
            var res = this.isFill(fields[x]);

            if (res == true) {
                continue;
            } else {
                errors.push(res);
                break;
            }
        }
        
        // Return one error by time.
        return (errors.length > 0) ? errors[0] : true;
    }

    isFill(field) {
        if (field == 'phones0')
            if (!this.phones[0].phone || this.phones[0].phone.length == 0)
                return field;

        else if (!this[field] || this[field].length == 0)
            return field;

        return true;
    }

    addMaterialOrRemoveIfAlreadyIncluded(material: Material){
        var found = false;

        for(let i=0; i<this.materials_collected.length; i++){
            if (material.id === this.materials_collected[i]){
                this.materials_collected.splice(i, 1);
                found = true;
                return 0;
            }
        }

        if (!found)
            this.materials_collected.push(material.id);
    }

}
