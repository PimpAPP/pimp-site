import { element, browser, by, Key } from 'protractor';

export class HomePage {
    
	getPage() {
		return browser.get('/');
	}

	getPageTitle() {
		return browser.getTitle();
	}

}