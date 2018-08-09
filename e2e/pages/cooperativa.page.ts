import { Cooperativa } from './../../src/app/models/cooperativa';
import { protractor, element, browser, by, Key } from 'protractor';
var path = require('path');
var base64Img = require('base64-img');


export class CooperativaPage {
        
	getPage() {
		return browser.get('/cooperativa');
    }
    
    getEditPage() {
		return browser.get('/cooperativa/6');
	}

	fillPage(cooperativa) {
        browser.waitForAngularEnabled(false);
        element(by.id('name')).sendKeys(cooperativa.name);
        element(by.id('email')).sendKeys(cooperativa.email);
        element(by.id('phrase')).sendKeys(cooperativa.phrase);
        element(by.id('how_many_cooperators')).sendKeys(cooperativa.how_many_cooperators);
        element(by.id('datepicker')).sendKeys(cooperativa.founded_in);
        element(by.id('history')).sendKeys(cooperativa.history);

        // Phones
        element(by.id('phones0')).sendKeys(cooperativa.phones[0].phone);

        // Materials
        element(by.id('material-vidro-id')).click();
        
        // Image        
        var fileToUpload = '../test-image.png';
        var absolutePath = path.resolve(__dirname, fileToUpload);
        var data = base64Img.base64Sync(absolutePath);
        var previewElem = element(by.id('preview'));
        browser.executeScript("arguments[0].setAttribute('src', '" + data +"')", previewElem);
		browser.sleep(500);

        // Address
        element(by.id('state')).sendKeys(cooperativa.state);
        browser.sleep(1000);

        element(by.id('city')).sendKeys(cooperativa.city);

        element(by.id('address_region')).clear()
        element(by.id('address_region')).sendKeys(cooperativa.address_region);

        element(by.id('address_base')).clear()
        element(by.id('address_base')).sendKeys(cooperativa.address_base);

        element(by.id('number')).clear()
        element(by.id('number')).sendKeys(cooperativa.number);
    }

    editCooperativa(cooperativa) {
        element(by.id('name')).clear();
        element(by.id('name')).sendKeys(cooperativa.name);
        element(by.id('phones0')).sendKeys(cooperativa.phones[0].phone);
		browser.sleep(500);
    }

    checkCooperativaAfterUpdate(cooperativa: Cooperativa) {
        browser.waitForAngularEnabled(false);
        browser.sleep(1000);
        expect(element(by.id('name')).getAttribute('value')).toEqual(cooperativa.name);
    }

    btnSaveClick(msg) {
        browser.sleep(500);
        // Click button
        var saveBtn = element(by.id('btn-cadastrar'));
        saveBtn.click();

        browser.sleep(5000);

        var alertDialog = browser.switchTo().alert();
        expect(alertDialog.getText()).toEqual(msg);
        alertDialog.accept();
        browser.sleep(500);
    }
    
    fillCooperativaExample() {
        var cooperativa = new Cooperativa();
        cooperativa.name = 'cooperativa - Protractor';
        
        // Para não duplicar usuário da cooperativa
        cooperativa.email = 'cooperativaprotractor' + this.getRandomNumber(100) + '@gmail.com';

        cooperativa.phrase = 'Frase teste 2018';
        cooperativa.how_many_cooperators = 10;
        cooperativa.founded_in = '2018-08-09';
        cooperativa.history = 'teste';

        cooperativa.address_base = 'Rua Elói Pereira';
        cooperativa.number = '10';
        cooperativa.address_region = 'Vila Guilhermina';
        cooperativa.city = 'Montes Claros';
        cooperativa.state = 'Minas Gerais';

        cooperativa.phones[0].phone = 
                '(99) 99999-' + 
                this.getRandomNumber(9) +
                this.getRandomNumber(9) +
                this.getRandomNumber(9) +
                this.getRandomNumber(9);
        cooperativa.phones[0].has_whatsapp = true;
        return cooperativa;
    }

    getRandomNumber(max) {
        Math.floor((Math.random() * max) + 1)
    }

}