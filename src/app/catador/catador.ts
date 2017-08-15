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
    public materials_collected: Array<Material> = new Array<Material>();
    public safety_kit: boolean = false;
    public has_motor_vehicle: boolean = false;
    public has_smartphone_with_internet: boolean = false;
    public safety_kit_boot: boolean = false;
    public safety_kit_gloves: boolean = false;
    public safety_kit_brakes: boolean = false;
    public safety_kit_reflective_tapes: boolean = false;
    public safety_kit_rearview: boolean = false;
    public registered_by_another_user: boolean = false;
    public another_user_name: string = '';
    public another_user_email: string = '';
    public another_user_whatsapp: string = '';
    public image: string = '';
    public user: string = '';

    constructor() {
        this.phones[0] = new Phone();
        this.phones[1] = new Phone();
    }

    valid() {
        return (
            (this.name.length > 0) &&
            (this.minibio.length > 0) &&
            (this.nickname.length > 0) &&
            (this.presentation_phrase.length > 0) &&
            (this.phones.length > 0) &&
            (this.address_base.length > 0) &&
            (this.region.length > 0) &&
            (this.kg_day > 0) &&
            (this.how_many_days_work_week > 0) &&
            (this.how_many_years_work > 0)
        );
    }

    addMaterialOrRemoveIfAlreadyIncluded(material: Material){
        for(let i=0; i<this.materials_collected.length; i++){
            if (material.id === this.materials_collected[i].id){
                this.materials_collected.splice(i, 1);
                return 0;
            }
        }
        this.materials_collected.push(material);
    }

}
