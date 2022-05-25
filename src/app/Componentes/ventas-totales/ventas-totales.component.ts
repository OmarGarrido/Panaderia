import {
  Component,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Producto, Venta } from 'src/app/models';
import { FirebaseService } from 'src/app/Servicios/firebase.service';
import * as Highcharts from 'highcharts';

// export interface ShowVentas{

// }

export type SortColumn = keyof Venta | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-ventas-totales',
  templateUrl: './ventas-totales.component.html',
  styleUrls: ['./ventas-totales.component.css'],
})
export class VentasTotalesComponent implements OnInit {
  collection = { data: [] };
  ventasCollection: Venta[];
  idFirebaseUpdate: string;
  path = 'Ventas';
  closeResult = '';
  config: any;
  updSave: boolean;
  maxPerPage: number;
  constVentas: any;

  Highcharts = Highcharts;
  chartOptions = {};
  listProducto = [];
  productos: any;

  constructor(private fibaseService: FirebaseService) {}
  ngOnInit(): void {
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.ventasCollection?.length,
    };
    console.log(this.ventasCollection?.length);

    this.fibaseService
      .getCollectionType<Producto>('Productos')
      .subscribe((res) => {
        this.productos = res;
        res.forEach((p) => {
          this.listProducto.push({ name: p.nombre, y: 0 });
        });
        // console.log(this.listProducto);
        // console.log(this.listProducto);
      });

    this.fibaseService.getCollectionType<Venta>(this.path).subscribe((res) => {
      this.ventasCollection = res;
      const v = res;
      this.constVentas = v;
      // console.log(this.constVentas);

      /****************************** */
      res.forEach((e) => {
        e.productos.forEach((p) => {
          this.listProducto.forEach((prod, i) => {
            if (p.producto.nombre == prod.name) {
              this.listProducto[i].y++;
              // console.log(this.listProducto[i]);

              // prod.ventas=prod.ventas++;
            }
          });
        });
      });
      console.log(this.listProducto);

      /****************************** */
    });

    /***************************** */
    this.chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      title: {
        text: 'Browser market shares in January, 2018',
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
      },
      accessibility: {
        point: {
          valueSuffix: '%',
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false,
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: 'Brands',
          colorByPoint: true,
          data: this.listProducto,
        },
      ],
    };
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);

    /***************************** */
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '' || column === '') {
      this.ventasCollection = this.constVentas;
    } else {
      this.ventasCollection = [...this.constVentas].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
}
