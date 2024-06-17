import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { SensorData } from '../../../types';
import { DataService } from '../../service/data.service';
import { BoxComponent } from '../box/box.component';
import { UserService } from '../../service/user.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  imports: [BoxComponent, AlertComponent, CommonModule],
})
export class DetailsComponent implements OnInit, OnDestroy {
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

  fetchData(url: string) {
    this.dataService.getData(url).subscribe({
      next: (data: SensorData[]) => {
        this.sensorDatas = data;
        this.calculateAverages(data);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  getLastSensorData(data: SensorData[]): SensorData | undefined {
    return data.length > 0
      ? data.reduce((prev, current) =>
          new Date(prev.date) > new Date(current.date) ? prev : current
        )
      : undefined;
  }

  calculateAverages(data: SensorData[]) {
    if (data.length > 0) {
      const totalTemperature = data.reduce(
        (acc, sensor) => acc + sensor.temperature,
        0
      );
      this.averageTemperature = parseFloat(
        (totalTemperature / data.length).toFixed(2)
      );

      const totalLight = data.reduce((acc, sensor) => acc + sensor.light, 0);
      this.averageLight = parseFloat((totalLight / data.length).toFixed(2));

      const totalDust = data.reduce((acc, sensor) => acc + sensor.dust, 0);
      this.averageDust = parseFloat((totalDust / data.length).toFixed(2));
    }
  }

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

  startPolling(url: string) {
    this.pollingSubscription = interval(2000)
      .pipe(switchMap(() => this.dataService.getData(url)))
      .subscribe({
        next: (data: SensorData[]) => {
          this.sensorDatas = data;
          this.checkThresholds(this.sensorDatas);
          this.calculateAverages(data);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }

  checkThresholds(data: SensorData[]) {
    this.exceededData = data.filter((sensor) => {
      return sensor.temperature > 30 || sensor.light < 25 || sensor.dust > 2000;
    });
  }

  ngOnInit(): void {
    this.userService.isConnected().subscribe((isConnected) => {
      if (!isConnected) {
        this.router.navigate(['']);
      } else {
        this.startPolling('http://localhost:3000/get-data');
      }
    });
  }
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
