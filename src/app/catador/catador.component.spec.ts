import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatadorComponent } from './catador.component';

describe('CatadorComponent', () => {
  let component: CatadorComponent;
  let fixture: ComponentFixture<CatadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
