import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreDetailsComponent } from './more-details.component';

// Définition du composant MoreDetailsComponent
describe('MoreDetailsComponent', () => {
  let component: MoreDetailsComponent;
  let fixture: ComponentFixture<MoreDetailsComponent>;

  // Avant chaque test on configure le module de test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreDetailsComponent]
    })
    .compileComponents();
    
    // Création du composant
    fixture = TestBed.createComponent(MoreDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test de création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
