import { isPlatformBrowser } from '@angular/common';
import { Component, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';


interface SimulationResponse {
  baseAna: string[];
  baseBeto: string[];
  bitsAna: number[];
  bitsBeto: number[];
  claveCompartida: number[];
  porcentaje: number;
  baseEva: string[] | null;
  bitsBetoEva: number[] | null;
  claveConEva: number[] | null;
  porcentajeConEva: number | null;
}


@Component({
  selector: 'app-bb84-simulator',
  imports: [InputNumberModule, ButtonModule,TagModule, ChartModule, ToggleSwitchModule, TableModule, ToastModule, FormsModule],
  templateUrl: './bb84-simulator.html',
  styleUrl: './bb84-simulator.css',
  providers: [MessageService]
})

export class Bb84Simulator {
  platformId = inject(PLATFORM_ID);
  qubits: number = 16;
  withEva: boolean = false;
  loading: boolean = false;
  animationActive: boolean = false;
  simulationData: SimulationResponse | null = null;

  // Datos para gráficos
  chartData: any;
  chartOptions: any;

  constructor(
    private cd: ChangeDetectorRef,
    private http: HttpClient, 
    private messageService: MessageService) {
    this.initChart();
  }


//   initChart() {
//   if (isPlatformBrowser(this.platformId)) {
//     const documentStyle = getComputedStyle(document.documentElement);
//     const textColor = documentStyle.getPropertyValue('--p-text-color');
//     const textColorSecondary = documentStyle.getPropertyValue('--p-text-color-secondary');
//     const surfaceBorder = documentStyle.getPropertyValue('--p-surface-border');

//     this.chartOptions = {
//       responsive: true,
//       maintainAspectRatio: false,
//       layout: {
//         padding: {
//           top: 10,
//           bottom: 10,
//           left: 10,
//           right: 10
//         }
//       },
//       plugins: {
//         legend: {
//           position: 'top',
//           labels: {
//             color: textColor,
//             usePointStyle: true,
//             font: {
//               size: 11
//             }
//           }
//         }
//       },
//       scales: {
//         y: {
//           beginAtZero: true,
//           max: 100,
//           ticks: {
//             callback: function(value: any) {
//               return value + '%';
//             },
//           },
//           grid: {
//             color: surfaceBorder,
//             drawBorder: true
//           }
//         },
//         x: {
//           ticks: {
//             color: textColorSecondary,
//           },
//           grid: {
//             color: surfaceBorder,
//             drawBorder: false
//           }
//         }
//       }
//     };
    
//     this.cd.markForCheck();
//   }
// }

  getSeverity(base: string) {
    switch (base) {
      case "X":
        return 'info';
      case "Z":
          return 'warn';
      default:
        return 'danger';
    }
  }

  getSeverityDescrip(descript: string) {
    switch (descript) {
      case "Coincide":
      case "Conservado":
        return 'success';
      case "No Coincide":
      
      case "Descartado":
        return 'danger';
      case "Coincide (Eva interferió)":
      case "Coincide (Eva OK)":
        return 'warn';
      default:
        return 'danger'; // o 'warning' si prefieres otro valor por defecto
    }
  }

  initChart() {
  if (isPlatformBrowser(this.platformId)) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  this.chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                                        usePointStyle: true,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value: any) {
                            return value + '%';
                          },
                        },
                        grid: {
                            color: surfaceBorder,
                        },
                    },
                },
            };
            this.cd.markForCheck()
  }
}



  simulate() {
    if (this.qubits < 8 || this.qubits > 64) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El número de qubits debe estar entre 8 y 64'
      });
      return;
    }

    this.loading = true;
    this.animationActive = true;

    const requestBody = {
      largo: this.qubits,
      con_espia: this.withEva
    };

    this.http.post<SimulationResponse>('http://127.0.0.1:8000/bb84/simular', requestBody)
      .subscribe({
        next: (data) => {
          this.simulationData = data;
          this.updateChart();
          this.loading = false;
          
          // Detener animación después de 2 segundos
          setTimeout(() => {
            this.animationActive = false;
          }, 2000);
        },
        error: (error) => {
          console.error('Error en la simulación:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo completar la simulación'
          });
          this.loading = false;
          this.animationActive = false;
        }
      });
  }

  updateChart() {
    if (!this.simulationData) return;

    const labels = ['Sin Eva', 'Con Eva'];
    const values = [this.simulationData.porcentaje];
    
    if (this.simulationData.porcentajeConEva !== null) {
      values.push(this.simulationData.porcentajeConEva);
    } else {
      values.push(0);
    }

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Porcentaje de coincidencia',
          backgroundColor: ['#4a41f0', '#EC4899'],
          borderColor: ['#4F46E5', '#EC4899'],
          borderWidth: 1,
          data: values
        }
      ]
    };
  }

getStepDescription(step: number): { baseStatus: string, bitStatus: string } {
  if (!this.simulationData) return { baseStatus: '', bitStatus: '' };
  
  const basesMatch = this.simulationData.baseAna[step] === this.simulationData.baseBeto[step];
  const bitMatch = this.simulationData.bitsAna[step] === this.simulationData.bitsBeto[step];
  
  // Detectar intervención de Eva
  const hasEvaIntervention = this.withEva && 
                            this.simulationData.baseEva && 
                            this.simulationData.baseEva[step] !== undefined ;
  
  if (hasEvaIntervention) {
    const evaBase = this.simulationData.baseEva?.[step] ?? '';
    const evaBaseMatchAna = this.simulationData.baseAna[step] === evaBase;
    
    if (basesMatch && bitMatch) {
      return { 
        baseStatus: evaBaseMatchAna ? 'Coincide (Eva OK)' : 'Coincide (Eva interferió)',
        bitStatus: 'Conservado'
      };
    } else if (basesMatch && !bitMatch) {
      return { 
        baseStatus: 'Coincide',
        bitStatus: evaBaseMatchAna ? 'Descartado (Eva alteró)' : 'Descartado (diferente valor)'
      };
    }
  }
  
  // Lógica normal
  if (basesMatch && bitMatch) {
    return { 
      baseStatus: 'Coincide', 
      bitStatus: 'Conservado' 
    };
  } else if (basesMatch && !bitMatch) {
    return { 
      baseStatus: 'Coincide', 
      bitStatus: 'Descartado (diferente valor)' 
    };
  } else {
    return { 
      baseStatus: 'No Coincide', 
      bitStatus: 'Descartado' 
    };
  }
}

  getStepIndices(): number[] {
    if (!this.simulationData || !this.simulationData.baseAna) {
      return [];
    }
    return Array.from({ length: this.simulationData.baseAna.length }, (_, i) => i);
  }
}