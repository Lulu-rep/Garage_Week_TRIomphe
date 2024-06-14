import { Component, OnInit, importProvidersFrom } from '@angular/core';
import { DataService } from './service/data.service';
import { SensorData } from '../types';
import { CommonModule } from '@angular/common';
import { BoxComponent } from "./components/box/box.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [CommonModule, BoxComponent]
})
export class AppComponent implements OnInit {
  sensorDatas: SensorData[] = [];
  title = "MainTRInances"

  constructor(private dataService: DataService) {}

  fetchData(url: string) {
    this.dataService.getData(url)
      .subscribe({
        next: (data: SensorData[]) => { 
          console.log("Data :" + data[0].date);
          this.sensorDatas = data
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  ngOnInit() {
    this.fetchData('http://localhost:3000/get-data');
  }
}
