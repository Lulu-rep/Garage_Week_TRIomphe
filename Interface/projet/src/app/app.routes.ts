import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { DetailsComponent } from './components/details/details.component';

export const routes: Routes = [ 
    // Route pour la connexion de l'employé
    {
      path: '',
      component: LoginComponent,
    },
    // Page d'accueil avec la liste des machines actives
    {
      path: 'home',
      component: HomeComponent,
    },
    // Détails de la machine en fonction de son identifiant unique
    {
      path: 'machine-details/:id',
      component: DetailsComponent, 
    }
];
