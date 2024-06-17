import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorData } from '../../../types';
import { Subscription, interval, switchMap } from 'rxjs';
import { DataService } from '../../service/data.service';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

// Définition du composant MoreDetailsComponent
@Component({
  selector: 'app-more-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './more-details.component.html',
  styleUrl: './more-details.component.css',
})
export class MoreDetailsComponent {
  sensorDatas: SensorData[] = [];
  averageTemperature: number = 0;
  averageLight: number = 0;
  averageDust: number = 0;

  alertMessage: String = '';

  exceededData: SensorData[] = [];

  private pollingSubscription: Subscription | undefined;

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private router: Router
  ) {}
  // Méthode pour récupérer l'ensemble des données de l'API à partir de l'URL
  fetchData(url: string) {
    this.dataService.getData(url).subscribe({
      next: (data: SensorData[]) => {
        this.sensorDatas = data;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }
  // Méthode pour récupérer la dernière donnée d'un capteur
  getLastSensorData(data: SensorData[]): SensorData | undefined {
    return data.length > 0
      ? data.reduce((prev, current) =>
          new Date(prev.date) > new Date(current.date) ? prev : current
        )
      : undefined;
  }
  // Méthode pour calculer les moyennes des données des capteurs
  threshold(sensorData: SensorData): boolean {
    let isAbove = false;
    let message: String[] = [];
    if (sensorData.temperature > 30) {
      isAbove = true;
      message.push('Température');
    }

    if (sensorData.light < 25) {
      isAbove = true;
      message.push('Lumière');
    }

    if (sensorData.dust > 2000) {
      isAbove = true;
      message.push('Poussière');
    }

    const globalMessage = message.join(', ');
    this.alertMessage = globalMessage;
    return isAbove;
  }
  // Méthode pour calculer les moyennes des données des capteurs
  checkThresholds(data: SensorData[]) {
    this.exceededData = data.filter((sensor) => {
      return sensor.temperature > 30 || sensor.light < 25 || sensor.dust > 2000;
    });
  }
  // Méthode pour exporter les données en format CSV (Comma-Separated Values)
  exportToCSV() {
    const headers = ['Timestamp', 'Temperature', 'Light', 'Dust'];
    const rows = this.exceededData.map((sensor) => [
      sensor.date,
      sensor.temperature,
      sensor.light,
      sensor.dust,
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';

    rows.forEach((rowArray) => {
      const row = rowArray.join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'exceeded_data.csv');
    document.body.appendChild(link);

    link.click();
  }
  // Méthode pour démarrer le polling des données de l'API
  startPolling(url: string) {
    this.pollingSubscription = interval(2000)
      .pipe(switchMap(() => this.dataService.getData(url)))
      .subscribe({
        next: (data: SensorData[]) => {
          this.sensorDatas = data;
          this.checkThresholds(this.sensorDatas);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }
  // Méthode pour vérifier le statut de connexion de l'utilisateur et démarrer le polling des données de l'API si l'utilisateur est connecté
  ngOnInit(): void {
    this.userService.isConnected().subscribe((isConnected) => {
      if (!isConnected) {
        this.router.navigate(['']);
      } else {
        this.startPolling('http://localhost:3000/get-data');
      }
    });
  }
}
