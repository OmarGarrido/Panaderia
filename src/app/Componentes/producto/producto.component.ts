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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto, Provedor } from 'src/app/models';
import { FirebaseService } from 'src/app/Servicios/firebase.service';

/******************************** */
export type SortColumn = keyof Producto | '';
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
/******************************** */

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
})
export class ProductoComponent implements OnInit {
  options = ['Perecedero', 'No perecedero', 'alimento', 'otro'];
  // selected = 'nada';
  provedorSelected: Provedor;
  provedores: Provedor[];

  collection = { data: [] };
  productosForm: FormGroup;
  idFirebaseUpdate: string;
  path = 'Productos';
  closeResult = '';
  config: any;
  updSave: boolean;
  listData: any;

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    private fibaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    this.idFirebaseUpdate = '';

    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: this.collection.data.length,
    };

    this.productosForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      precio: ['', Validators.required],
      id_provedor: ['', Validators.required],
    });

    this.fibaseService
      .getCollectionType<Provedor>('Provedores')
      .subscribe((res) => {
        this.provedores = res;
        console.log(this.provedores);
      });

    this.fibaseService.getCollection(this.path).subscribe(
      (resp) => {
        this.collection.data = resp.map((e: any) => {
          return {
            provedor: e.payload.doc.data().provedor,
            nombre: e.payload.doc.data().nombre,
            tipo: e.payload.doc.data().tipo,
            precio: e.payload.doc.data().precio,
            id_provedor: e.payload.doc.data().id_provedor,
            idFirebaseUpdate: e.payload.doc.id,
          };
        });
        const v = this.collection.data;
        this.listData = v;
        console.log('Data-> ',this.listData);
      },
      (error) => {
        console.log(error);
      }
    );
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
      this.collection.data = this.listData;
    } else {
      this.collection.data = [...this.listData].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  // onChange(event){
  //   console.log('event->',event);

  // }

  setProvedor(item: Provedor) {
    this.provedorSelected = item;
    console.log('provedor->', this.provedorSelected);
  }

  guardar() {
    this.fibaseService
      .nuevoRegistro(this.path, this.productosForm.value)
      .then((resp) => {
        this.productosForm.reset();
        this.modalService.dismissAll();
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
          this.productosForm.value
        )
        .then((resp) => {
          this.productosForm.reset();
          this.modalService.dismissAll();
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
    this.productosForm.setValue({
      nombre: item.nombre,
      tipo: item.tipo,
      precio: item.precio,
      id_provedor: item.id_provedor,
    });
    this.idFirebaseUpdate = item.idFirebaseUpdate;
    console.log(this.idFirebaseUpdate);
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
    this.productosForm.reset();
    this.updSave = false;
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
