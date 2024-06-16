import { Component, OnInit } from '@angular/core';
import { SensorData } from '../../../types';
import { DataService } from '../../service/data.service';
import { BoxComponent } from '../box/box.component';
import { UserService } from '../../service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-details',
  standalone: true,
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  imports: [BoxComponent],
})
export class DetailsComponent implements OnInit {
  sensorDatas: SensorData[] = [];
  lastSensorData: SensorData | undefined;
  averageTemperature: number = 0;
  averageLight: number = 0;
  averageDust: number = 0;

  constructor(
    private dataService: DataService,
    private userService: UserService,
    private router: Router
  ) {}

  fetchData(url: string) {
    this.dataService.getData(url).subscribe({
      next: (data: SensorData[]) => {
        this.sensorDatas = data;
        this.lastSensorData = this.getLastSensorData(data);
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
      this.averageTemperature = totalTemperature / data.length;

      const totalLight = data.reduce((acc, sensor) => acc + sensor.light, 0);
      this.averageLight = totalLight / data.length;

      const totalDust = data.reduce((acc, sensor) => acc + sensor.dust, 0);
      this.averageDust = totalDust / data.length;
    }
  }

  ngOnInit(): void {
    this.userService.isConnected().subscribe((isConnected) => {
      if (!isConnected) {
        this.router.navigate(['']);
      } else this.fetchData('http://localhost:3000/get-data');
    });
  }
}
