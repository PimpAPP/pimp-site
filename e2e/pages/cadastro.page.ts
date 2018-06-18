import { protractor, element, browser, by, Key } from 'protractor';
import { Catador } from '../../src/app/models/catador';
var path = require('path');


export class CadastroPage {
        
	getPage() {
		return browser.get('/#/cadastro');
    }
    
    getEditPage() {
		return browser.get('/#/cadastro/1');
	}

	fillPage(catador) {
        this.fillCatadorExample();
        browser.waitForAngularEnabled(false);
        element(by.id('name')).sendKeys(catador.name);
        element(by.id('nickname')).sendKeys(catador.nickname);
        element(by.id('presentation_phrase')).sendKeys(catador.presentation_phrase);
        element(by.id('minibio')).sendKeys(catador.minibio);

        // Address
        element(by.id('country')).sendKeys(catador.country);

        element(by.id('state')).clear()
        element(by.id('state')).sendKeys(catador.state);

        element(by.id('city')).clear()
        element(by.id('city')).sendKeys(catador.city);

        element(by.id('address_region')).clear()
        element(by.id('address_region')).sendKeys(catador.address_region);

        element(by.id('address_base')).clear()
        element(by.id('address_base')).sendKeys(catador.address_base);

        element(by.id('number')).clear()
        element(by.id('number')).sendKeys(catador.number);

        // Phones
        element(by.id('phones0')).sendKeys(catador.phones[0].phone);

        // Materials
        element(by.id('selectMaterial-id')).click();
        
        // Image        
        var fileToUpload = '../test-image.png';
        var absolutePath = path.resolve(__dirname, fileToUpload);
        // element(by.id('img-file')).sendKeys(absolutePath);
        // Find the file input element
        var fileElem = element(by.id('img-file'));
        
        var remote = require('selenium-webdriver/remote');
        browser.setFileDetector(new remote.FileDetector());

        fileElem.sendKeys(absolutePath);
    }

    editCatador(catador) {
        element(by.id('name')).clear();
        element(by.id('name')).sendKeys(catador.name);
        element(by.id('phones0')).sendKeys(catador.phones[0].phone);
    }

    checkCatadorAfterUpdate(catador: Catador) {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(element(by.id('name')).getAttribute('value')).toEqual(catador.name);
        // expect(element(by.id('phones0'))).toEqual(catador.phones[0].phone);
    }

    btnSaveClick() {
        // Click button
        element(by.id('btn-cadastrar')).click();

        var EC = protractor.ExpectedConditions;
        browser.wait(EC.alertIsPresent(), 5000, "Cadastro realizado com sucesso!");
        browser.switchTo().alert().accept();
    }
    
    fillCatadorExample() {
        var catador = new Catador();
        catador.name = 'Catador - Protractor';
        catador.nickname = 'Protractor';
        // catador.email = 'catadorprotractor@gmail.com';
        catador.minibio = 'Teste - Protractor';        
        catador.presentation_phrase = 'Teste presentation_phrase';
        
        catador.address_base = 'Rua Elói Pereira';
        catador.number = '10';
        catador.address_region = 'Vila Guilhermina';
        catador.city = 'Montes Claros';
        catador.state = 'Minas Gerais';
        catador.country = 'Brasil';

        catador.phones[0].phone = '(99) 99999-9999';
        catador.phones[0].has_whatsapp = true;
        return catador;
    }

}