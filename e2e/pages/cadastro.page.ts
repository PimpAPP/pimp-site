import { protractor, element, browser, by, Key } from 'protractor';
import { Catador } from '../../src/app/models/catador';
var path = require('path');
var base64Img = require('base64-img');


export class CadastroPage {
        
	getPage() {
		return browser.get('/cadastro');
    }
    
    getEditPage() {
		return browser.get('/cadastro/1');
	}

	fillPage(catador) {
        browser.waitForAngularEnabled(false);
        element(by.id('name')).sendKeys(catador.name);
        element(by.id('nickname')).sendKeys(catador.nickname);
        element(by.id('presentation_phrase')).sendKeys(catador.presentation_phrase);
        element(by.id('minibio')).sendKeys(catador.minibio);

        // Phones
        element(by.id('phones0')).sendKeys(catador.phones[0].phone);

        // Materials
        element(by.id('material-vidro-id')).click();
        
        // Image        
        var fileToUpload = '../test-image.png';
        var absolutePath = path.resolve(__dirname, fileToUpload);
        var data = base64Img.base64Sync(absolutePath);
        var previewElem = element(by.id('preview'));
        browser.executeScript("arguments[0].setAttribute('src', '" + data +"')", previewElem);

        this.btnNextClick();
		browser.sleep(500);

        // Address
        element(by.id('state')).sendKeys(catador.state);
        browser.sleep(1000);

        element(by.id('city')).sendKeys(catador.city);

        element(by.id('address_region')).clear()
        element(by.id('address_region')).sendKeys(catador.address_region);

        element(by.id('address_base')).clear()
        element(by.id('address_base')).sendKeys(catador.address_base);

        element(by.id('number')).clear()
        element(by.id('number')).sendKeys(catador.number);
    }

    editCatador(catador) {
        element(by.id('name')).clear();
        element(by.id('name')).sendKeys(catador.name);
        element(by.id('phones0')).sendKeys(catador.phones[0].phone);
        this.btnNextClick();
		browser.sleep(500);
    }

    checkCatadorAfterUpdate(catador: Catador) {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(element(by.id('name')).getAttribute('value')).toEqual(catador.name);
        // expect(element(by.id('phones0'))).toEqual(catador.phones[0].phone);
    }

    btnNextClick() {
        element(by.id('btn-avancar')).click();
    }

    btnSaveClick(msg) {
        browser.sleep(500);
        // Click button
        var saveBtn = element(by.id('btn-confirmar'));
        saveBtn.click();

        browser.sleep(5000);

        var alertDialog = browser.switchTo().alert();
        expect(alertDialog.getText()).toEqual(msg);
        alertDialog.accept();
        browser.sleep(500);
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

        catador.phones[0].phone = '(99) 99999-9999';
        catador.phones[0].has_whatsapp = true;
        return catador;
    }

}