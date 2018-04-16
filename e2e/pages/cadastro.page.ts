import { element, browser, by, Key } from 'protractor';
import { Catador } from '../../src/app/models/catador';
var path = require('path');


export class CadastroPage {
    
    catador = new Catador();
    
	getPage() {
		return browser.get('/#/cadastro');
	}

	fillData() {
        this.fillCatadorExample();
        element(by.id('name')).sendKeys(this.catador.name);
        element(by.id('nickname')).sendKeys(this.catador.nickname);
        element(by.id('presentation_phrase')).sendKeys(this.catador.presentation_phrase);
        element(by.id('minibio')).sendKeys(this.catador.minibio);

        // Address
        element(by.id('country')).sendKeys(this.catador.country);

        element(by.id('state')).clear()
        element(by.id('state')).sendKeys(this.catador.state);

        element(by.id('city')).clear()
        element(by.id('city')).sendKeys(this.catador.city);

        element(by.id('address_region')).clear()
        element(by.id('address_region')).sendKeys(this.catador.address_region);

        element(by.id('address_base')).clear()
        element(by.id('address_base')).sendKeys(this.catador.address_base);

        element(by.id('number')).clear()
        element(by.id('number')).sendKeys(this.catador.number);

        // Phones
        element(by.id('phones0')).sendKeys(this.catador.phones[0].phone);
        
        // Image        
        var fileToUpload = '../test-image.png';
        var absolutePath = path.resolve(__dirname, fileToUpload);
        // element(by.id('img-file')).sendKeys(absolutePath);
        // Find the file input element
        var fileElem = element(by.id('img-file'));
        
        var remote = require('selenium-webdriver/remote');
        browser.setFileDetector(new remote.FileDetector());

        fileElem.sendKeys(absolutePath);

        // Click button
        element(by.id('btn-cadastrar')).click();

        browser.sleep(1000);
    }
    
    fillCatadorExample() {
        this.catador = new Catador();
        this.catador.name = 'Catador Teste - Protractor';
        this.catador.nickname = 'Protractor';
        // this.catador.email = 'catadorprotractor@gmail.com';
        this.catador.minibio = 'Teste - Protractor';        
        this.catador.presentation_phrase = 'Teste presentation_phrase';
        
        this.catador.address_base = 'Rua Elói Pereira';
        this.catador.number = '10';
        this.catador.address_region = 'Vila Guilhermina';
        this.catador.city = 'Montes Claros';
        this.catador.state = 'Minas Gerais';
        this.catador.country = 'Brasil';

        this.catador.phones[0].phone = '(99) 99999-9999';
        this.catador.phones[0].has_whatsapp = 1;

    }

}