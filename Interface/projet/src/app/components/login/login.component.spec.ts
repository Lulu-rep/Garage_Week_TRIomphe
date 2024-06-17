import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

// Définition du composant LoginComponent
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  // Avant chaque test on configure le module de test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    })
    .compileComponents();
    // Création du composant
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  // Test de création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
