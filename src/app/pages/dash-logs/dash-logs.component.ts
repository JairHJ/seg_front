
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { LogsService } from './logs.service';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './dash-logs.component.html',
  styleUrls: ['./dash-logs.component.css']
})
export class DashLogsComponent implements OnInit {
  // Filtros para la tabla de logs históricos
  filterApi: string = '';
  filterStatus: string = '';
  filterDescription: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';

  get apiOptions(): string[] {
    // APIs únicas presentes en los logs
    return Array.from(new Set(this.allLogs.map(log => log.api_name).filter(Boolean)));
  }
  get statusOptions(): string[] {
    // Status únicos presentes en los logs
    return Array.from(new Set(this.allLogs.map(log => String(log.status_code)).filter(Boolean)));
  }
  get filteredLogs(): any[] {
    return this.allLogs.filter(log => {
      const date = new Date(log.timestamp || log.date || log.time);
      const from = this.filterDateFrom ? new Date(this.filterDateFrom) : null;
      const to = this.filterDateTo ? new Date(this.filterDateTo) : null;
      return (
        (!this.filterApi || log.api_name === this.filterApi) &&
        (!this.filterStatus || String(log.status_code) === this.filterStatus) &&
        (!this.filterDescription || (log.description || '').toLowerCase().includes(this.filterDescription.toLowerCase())) &&
        (!from || date >= from) &&
        (!to || date <= to)
      );
    });
  }
  getStatusDescription(code: any): string {
    return this.statusDescriptions[String(code)] || 'Otro';
  }
  summary: any;
  statusChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Respuestas por Status' }] };
  statusChartType: 'bar' = 'bar';
  statusCodesToShow: string[] = ['200', '201', '401', '404'];
  apiTable: { api: string, count: number, avg: number }[] = [];
  apiBarChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Llamadas por API' }] };
  allLogs: any[] = [];
  statusDescriptions: { [code: string]: string } = {
    '200': 'Exitoso',
    '201': 'Creado',
    '204': 'Sin contenido',
    '400': 'Solicitud incorrecta',
    '401': 'No autorizado',
    '403': 'Prohibido',
    '404': 'No encontrado',
    '409': 'Conflicto',
    '422': 'Entidad no procesable',
    '500': 'Error interno',
    '502': 'Bad Gateway',
    '503': 'Servicio no disponible',
    '504': 'Timeout',
  };

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.logsService.getLogsSummary().subscribe(data => {
      this.summary = data;
      // Asegurar que los códigos 200, 201, 401, 404 siempre estén presentes
      const allCodes = Array.from(new Set([...this.statusCodesToShow, ...Object.keys(data.status_counts)]));
      const dataArr = allCodes.map(code => data.status_counts[code] || 0);
      this.statusChartData = {
        labels: allCodes,
        datasets: [{ data: dataArr, label: 'Respuestas por Status' }]
      };
    });
    // Obtener todos los logs históricos
    this.logsService.getAllLogs().subscribe(logs => {
      this.allLogs = logs;
    });
  }
}
