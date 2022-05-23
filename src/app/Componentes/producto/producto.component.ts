import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from 'src/app/Servicios/firebase.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
})
export class ProductoComponent implements OnInit {
  options = ['Perecedero', 'No perecedero', 'alimento', 'otro'];
  selected = 'nada';

  collection = { data: [] };
  productosForm: FormGroup;
  idFirebaseUpdate: string;
  path = 'Productos';
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

    this.productosForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      precio: ['', Validators.required],
    });

    this.fibaseService.getCollection(this.path).subscribe(
      (resp) => {
        this.collection.data = resp.map((e: any) => {
          return {
            nombre: e.payload.doc.data().nombre,
            tipo: e.payload.doc.data().tipo,
            precio: e.payload.doc.data().precio,
            id: e.payload.doc.id,
          };
        });
        console.log(this.collection.data);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
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
    });
    this.idFirebaseUpdate = item.id;
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
