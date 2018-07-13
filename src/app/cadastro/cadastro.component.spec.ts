import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CadastroComponent } from './cadastro.component';

describe('CadastroComponent', () => {
    let component: CadastroComponent;
    let fixture: ComponentFixture<CadastroComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CadastroComponent],
            imports: [FormsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CadastroComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
