import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { LogsService } from './logs.service';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts()],
  templateUrl: './dash-logs.component.html',
  styleUrls: ['./dash-logs.component.css']
})
export class DashLogsComponent implements OnInit {
  summary: any;
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  statusChartType: 'doughnut' = 'doughnut';

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.logsService.getLogsSummary().subscribe(data => {
      this.summary = data;
      this.statusChartData = {
        labels: Object.keys(data.status_counts),
        datasets: [{ data: Object.values(data.status_counts) }]
      };
    });
  }
}