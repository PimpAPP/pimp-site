import { User } from './user'
import { Phone } from './phone'
import { Material } from './material';


export class Cooperativa {

    public id: number = 0;
    public name: string = '';
    public email: string = '';    
    public phrase: string = '';
    public address_base: string = '';
    public number: string = '';
    public address_region: string = '';
    public region: string = '';
    public city: string = '';
    public state: string = '';
    public country: string = '';
    public region_where_operates: string = '';
    public how_many_cooperators: string = '';
    public image: string = '';
    public partners: string = '';
    public how_much_collect_day: string = '';
    public how_many_days_work_week: string = '';
    public work_since: string = '';
    public cifounded_inty: string = '';
    public latitude: number;
    public longitude: number;    

    public user: string = '';
    public materials_collected: Array<Material> = new Array<Material>();
    public phones: Array<Phone> = new Array<Phone>();

    constructor() {
        this.phones[0] = new Phone();
        this.phones[1] = new Phone();
    }

    /**
     * Return true if valid and the field name if invalid
     */
    valid() {
        if (!this.name || this.name.length == 0) {
            return 'name';
        }

        if (!this.email || this.email.length == 0) {
            return 'email';
        }
        
        return true;
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
