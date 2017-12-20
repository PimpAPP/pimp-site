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
    public how_many_cooperators: Number;
    // public work_since: string = '';
    public history: string = '';
    public latitude: number;
    public longitude: number;    

    public user: string = '';
    public materials_collected: Array<any> = new Array<any>();
    public phones: Array<Phone> = new Array<Phone>();
    public founded_in: any;

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
