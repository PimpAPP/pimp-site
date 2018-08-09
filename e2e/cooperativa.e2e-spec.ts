import { Cooperativa } from './../src/app/models/cooperativa';
import { by, browser, element } from 'protractor';
import { CooperativaPage } from './pages/cooperativa.page';


describe('Cataki - New Coooperativa - Test Suite', () => {
    const page = new CooperativaPage();
    
	describe('this page should work fine', () => {

		beforeAll(() => {
			page.getPage();
		});
		
		it('Must allow fields to be filled in', () => {
			var cooperativa = page.fillCooperativaExample();
			page.fillPage(cooperativa);
		})

		it('Must save', () => {
			page.btnSaveClick('Cadastro realizado com sucesso!');
		})
		
	})
})

describe('Cataki - Edit Cooperativa - Test Suite', () => {
	const page = new CooperativaPage();

	var newCooperativa = new Cooperativa();
	newCooperativa.name = 'Cooperativa Teste - After update';
	newCooperativa.phones[0].phone = '(99) 99999-8833';
    
	describe('this page should work fine', () => {
		beforeAll(() => {
			page.getEditPage();
		});
		
		it('Must allow edit fields', () => {
			page.editCooperativa(newCooperativa);
		})

		it('Must save', () => {
			page.btnSaveClick('Alteração realizada com sucesso!');
		})
		
		it('Check data after update', () => {
			browser.refresh();
			page.getEditPage();
			page.checkCooperativaAfterUpdate(newCooperativa);
		})
	})
})
