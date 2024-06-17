import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

// Définition du composant HomeComponent
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  // Avant chaque test on configure le module de test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]
    })
    .compileComponents();
    // Création du composant
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  // Test de création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
