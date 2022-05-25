import {
  Component,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  PipeTransform,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Producto, ProductoPedido, Venta } from 'src/app/models';
import { FirebaseService } from 'src/app/Servicios/firebase.service';

interface showVenta {
  // fecha: Date;
  nombre: string;
  tipo: string;
  precio: string;
  // total: number;
  // totalNeto: number;
}

export type SortColumn = keyof showVenta | '';
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
/**************** */
@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export class VentaComponent implements OnInit {
  cliente: any = {};
  ventas: Venta;
  collection = { data: [] };
  ventasCliente: Venta[];
  dataaa;

  path = 'Productos';
  config: any;
  totalNeto = 0;
  opt = 2;

  constructor(private fibaseService: FirebaseService) {}
  ngOnInit(): void {
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: this.collection.data.length,
    };

    this.fibaseService.$getObjecjtSorce
      .subscribe((data) => (this.cliente = data))
      .unsubscribe();
    // console.log('Clientye-> ', this.cliente);

    this.ventas = {
      productos: [],
      fecha: new Date(),
      totalNeto: this.totalNeto,
      cliente: this.cliente,
    };
    //Productos para vender
    this.fibaseService.getCollection(this.path).subscribe(
      (resp) => {
        this.collection.data = resp.map((e: any) => {
          return {
            nombre: e.payload.doc.data().nombre,
            tipo: e.payload.doc.data().tipo,
            precio: e.payload.doc.data().precio,
            id_producto: e.payload.doc.id,
          };
        });
        // this.dataaa = this.collection.data;
        // console.log('Productos ->', this.collection.data);
      },
      (error) => {
        console.log(error);
      }
    );

    //Ventas del cliiente
    this.fibaseService
      .getCollectionWhere<Venta>(
        'Ventas',
        'id_cliente',
        this.cliente.id_cliente
      )
      .subscribe(
        (resp) => {
          this.ventasCliente = resp;
          this.dataaa = resp;
          // console.log(resp);
          // console.log('Productos ->', this.ventasCliente);
        },
        (error) => {
          console.log(error);
        }
      );
  }
  /**************************** */

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
      this.ventasCliente = this.dataaa;
    } else {
      this.ventasCliente = [...this.dataaa].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
  /**************************** */
  key = '';
  reverse = false;
  ordenar(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  opcion(opt: number) {
    this.opt = opt;
  }

  guardar() {
    this.ventas = {
      productos: this.ventas.productos,
      fecha: new Date(),
      totalNeto: this.totalNeto,
      cliente: this.cliente,
      id_cliente: this.cliente.id_cliente,
    };

    this.fibaseService
      .nuevoRegistro('Ventas', this.ventas)
      .then((docRef) => {
        this.fibaseService.actualizarRegistro('Ventas', docRef.id, {
          id_venta: docRef.id,
        });
        this.ventas.productos = [];
        this.total(this.ventas);
        this.opt = 2;
        // console.log(docRef.id);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  Agregar(prod: Producto) {
    // console.log(prod);
    const item = this.ventas.productos.find((productosPedido) => {
      return productosPedido.producto.id_producto === prod.id_producto;
    });

    if (item) {
      // this.total(item);
      // console.log(item);
      item.cantidad++;
      item.total = prod.precio * item.cantidad;
    } else {
      const pedido: ProductoPedido = {
        producto: prod,
        cantidad: 1,
        total: prod.precio,
      };
      this.ventas.productos.push(pedido);
    }
    // console.log(this.ventas);
    this.total(this.ventas);
  }

  Eliminar(producto: Producto) {
    let posicion = 0;
    const item = this.ventas.productos.find((productosPedido, index) => {
      posicion = index;
      return productosPedido.producto.id_producto === producto.id_producto;
    });

    if (item) {
      item.cantidad--;
      if (item.cantidad == 0) {
        this.ventas.productos.splice(posicion, 1);
      }
    }
    // const path = 'Usuarios/' + this.uid + '/' + this.path;
    // this.fireBase.crearDoc(path, this.pedido, this.uid).then(() => {
    //   console.log('eliminado con exito');
    // });
  }

  total(item: Venta) {
    this.totalNeto = 0;
    item.productos.forEach((e) => (this.totalNeto = this.totalNeto + e.total));
  }
}
