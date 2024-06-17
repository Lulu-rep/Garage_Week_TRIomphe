import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsComponent } from './details.component';
// Définition du composant DetailsComponent
describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;
  // Avant chaque test on configure le module de test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsComponent]
    })
    .compileComponents();
    // Création du composant
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  // Test de création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
