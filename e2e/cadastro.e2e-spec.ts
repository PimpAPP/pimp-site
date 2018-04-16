import { by, browser, element } from 'protractor';
import { CadastroPage } from './pages/cadastro.page';


describe('Cataki - New Catador - Test Suite', () => {
    const page = new CadastroPage();
    
	describe('this page should work fine', () => {
		beforeAll(() => {
			page.getPage();
		});
		
		it('Must allow fields to be filled in', () => {
			page.fillData();
		})
		
	})
})