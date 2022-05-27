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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Cliente, Venta } from 'src/app/models';
import { FirebaseService } from 'src/app/Servicios/firebase.service';
/************************************ */
export type SortColumn = keyof Cliente | '';
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

/************************************ */
@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
  /**************************************************** */
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
      this.collection.data = this.constCollection;
    } else {
      this.collection.data = [...this.constCollection].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
  /**************************************************** */

  collection = { data: [] };
  constCollection: any;
  clientesForm: FormGroup;
  idFirebaseUpdate: string;
  path = 'Clientes';
  closeResult = '';
  config: any;
  updSave: boolean;
  ventas: any;

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    private fibaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idFirebaseUpdate = '';

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.collection.data.length,
    };

    this.clientesForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido_p: ['', Validators.required],
      apellido_m: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
    });

    this.fibaseService.getCollection(this.path).subscribe(
      (resp) => {
        this.collection.data = resp.map((e: any) => {
          return {
            nombre: e.payload.doc.data().nombre,
            apellido_p: e.payload.doc.data().apellido_p,
            apellido_m: e.payload.doc.data().apellido_m,
            direccion: e.payload.doc.data().direccion,
            telefono: e.payload.doc.data().telefono,
            correo: e.payload.doc.data().correo,
            id_cliente: e.payload.doc.data().id_cliente,
          };
        });
        const v = this.collection.data;
        this.constCollection = v;
        // console.log(this.collection.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  verCliente(item: any) {
    this.fibaseService.sendObjectSorce(item);
    this.router.navigate(['Ventas', item.id_cliente]);
  }

  guardar() {
    this.fibaseService
      .nuevoRegistro(this.path, this.clientesForm.value)
      .then((resp) => {
        this.clientesForm.reset();
        this.modalService.dismissAll();
        this.fibaseService.actualizarRegistro(this.path, resp.id, {
          id_cliente: resp.id,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  actualizar() {
    //!isNullOrUndefined(this.idFirebaseUpdate)
    if (this.idFirebaseUpdate != null) {
      this.fibaseService
        .actualizarRegistro(
          this.path,
          this.idFirebaseUpdate,
          this.clientesForm.value
        )
        .then((resp) => {
          this.fibaseService
            .getCollectionWhere<Venta>(
              'Ventas',
              'id_cliente',
              this.idFirebaseUpdate
            )
            .subscribe((v) => {
              this.ventas = v;
              this.ventas.forEach((item) => {
                item.cliente = this.clientesForm.value;
                // console.log(item.id_cliente);

                if (this.clientesForm.value.nombre != null) {
                  this.fibaseService
                    .actualizarRegistro('Ventas', item.id_venta, item)
                    .then((res) => {
                      this.clientesForm.reset();
                      this.modalService.dismissAll();
                      console.log('Actualizado');
                      return;
                    })
                    .catch((e) => console.log('Error', e));
                }
              });

              // console.log('v->', v);
            });
          // console.log('Ventas->', this.ventas);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  //esto es codigo del modal
  editar(content, item: any) {
    this.updSave = true;
    //llenando formulario con los datos a editar
    this.clientesForm.setValue({
      nombre: item.nombre,
      apellido_p: item.apellido_p,
      apellido_m: item.apellido_m,
      telefono: item.telefono,
      direccion: item.direccion,
      correo: item.correo,
    });
    this.idFirebaseUpdate = item.id_cliente;
    // console.log(this.idFirebaseUpdate);
    //**//
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  nuevo(content) {
    this.updSave = false;
    this.clientesForm.reset();
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
