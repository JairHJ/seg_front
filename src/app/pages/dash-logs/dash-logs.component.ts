
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
  const filtered = this.allLogs.filter(log => {
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
  return this.sortLogs(filtered);
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
  sortField: string = 'timestamp';
  sortDir: 'asc' | 'desc' = 'desc';
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
  this.tryComputeFallbackMetrics();
    });
    // Obtener todos los logs históricos
    this.logsService.getAllLogs().subscribe(logs => {
      this.allLogs = logs;
  this.tryComputeFallbackMetrics();
    });
  }

  get avgResponseSeconds(): string {
    if (!this.summary || !this.summary.avg_duration_ms) return '-';
    return (this.summary.avg_duration_ms / 1000).toFixed(3);
  }

  get fastestApi(): string { return this.summary?.fastest_api || '-'; }
  get slowestApi(): string { return this.summary?.slowest_api || '-'; }
  get mostUsedApi(): string { return this.summary?.most_used_api || '-'; }
  get leastUsedApi(): string { return this.summary?.least_used_api || '-'; }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = field === 'timestamp' ? 'desc' : 'asc';
    }
  }

  sortIndicator(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  private sortLogs(data: any[]): any[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const va = this.getValueForSort(a, this.sortField);
      const vb = this.getValueForSort(b, this.sortField);
      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  private getValueForSort(row: any, field: string): any {
    if (field === 'timestamp') return new Date(row.timestamp).getTime();
    return row[field];
  }

  private tryComputeFallbackMetrics() {
    if (!this.summary || !this.allLogs.length) return;
    // Si el backend ya trae métricas nuevas, no recalculamos
    if (this.summary.fastest_api || this.summary.avg_duration_ms !== undefined) return;
    const perApi: Record<string, {count: number; totalMs: number}> = {};
    let totalDuration = 0;
    for (const log of this.allLogs) {
      const api = log.api_name || 'root';
      const ms = log.duration_ms ?? (log.duration ? log.duration * 1000 : 0);
      totalDuration += ms;
      perApi[api] = perApi[api] || {count: 0, totalMs: 0};
      perApi[api].count += 1; perApi[api].totalMs += ms;
    }
    const apiEntries = Object.entries(perApi).map(([k,v]) => ({api: k, count: v.count, avg: v.totalMs / v.count}));
    if (!apiEntries.length) return;
    apiEntries.sort((a,b)=>a.avg-b.avg);
    const fastest = apiEntries[0].api;
    const slowest = apiEntries[apiEntries.length-1].api;
    apiEntries.sort((a,b)=>b.count-a.count);
    const most = apiEntries[0].api;
    const least = apiEntries[apiEntries.length-1].api;
    const avgOverall = totalDuration / this.allLogs.length;
    this.summary.fastest_api = fastest;
    this.summary.slowest_api = slowest;
    this.summary.most_used_api = most;
    this.summary.least_used_api = least;
    this.summary.avg_duration_ms = Math.round(avgOverall * 100) / 100;
  }
}
