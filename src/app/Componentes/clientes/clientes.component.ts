import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from 'src/app/Servicios/firebase.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
  collection = { data: [] };
  clientesForm: FormGroup;
  idFirebaseUpdate: string;
  path = 'Clientes';
  closeResult = '';
  config: any;
  updSave: boolean;

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
            id_cliente: e.payload.doc.id,
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
          this.clientesForm.reset();
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
    this.clientesForm.setValue({
      nombre: item.nombre,
      apellido_p: item.apellido_p,
      apellido_m: item.apellido_m,
      telefono: item.telefono,
      direccion: item.direccion,
      correo: item.correo,
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
