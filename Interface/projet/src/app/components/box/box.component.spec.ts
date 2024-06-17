import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxComponent } from './box.component';

// Définition du composant BoxComponent
describe('BoxComponent', () => {
  let component: BoxComponent;
  let fixture: ComponentFixture<BoxComponent>;
  // Avant chaque test on configure le module de test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxComponent]
    })
    .compileComponents();
    // Création du composant
    fixture = TestBed.createComponent(BoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  // Test de création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
