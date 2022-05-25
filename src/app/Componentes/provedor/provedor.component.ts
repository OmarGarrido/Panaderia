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
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Provedor } from 'src/app/models';
import { FirebaseService } from 'src/app/Servicios/firebase.service';
/************************************ */
export type SortColumn = keyof Provedor | '';
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
  selector: 'app-provedor',
  templateUrl: './provedor.component.html',
  styleUrls: ['./provedor.component.css'],
})
export class ProvedorComponent implements OnInit {
  collection = { data: [] };
  constCollection: any;
  provedoresForm: FormGroup;
  idFirebaseUpdate: string;
  path = 'Provedores';
  closeResult = '';
  config: any;
  updSave: boolean;

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

    this.provedoresForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido_p: ['', Validators.required],
      apellido_m: ['', Validators.required],
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
            telefono: e.payload.doc.data().telefono,
            correo: e.payload.doc.data().correo,
            id_provedor: e.payload.doc.data().id_provedor,
          };
        });
        const v = this.collection.data;
        this.constCollection = v;

        console.log(this.constCollection);
      },
      (error) => {
        console.log(error);
      }
    );
  }

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


  pageChanged(event) {
    this.config.currentPage = event;
  }

  guardar() {
    this.fibaseService
      .nuevoRegistro(this.path, this.provedoresForm.value)
      .then((resp) => {
        this.fibaseService.actualizarRegistro(this.path, resp.id, {
          id_provedor: resp.id,
        });
        this.provedoresForm.reset();
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
          this.provedoresForm.value
        )
        .then((resp) => {
          this.provedoresForm.reset();
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
    this.provedoresForm.setValue({
      nombre: item.nombre,
      apellido_p: item.apellido_p,
      apellido_m: item.apellido_m,
      telefono: item.telefono,
      correo: item.correo,
    });
    this.idFirebaseUpdate = item.id_provedor;
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
    this.updSave = false;
    this.provedoresForm.reset();
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
