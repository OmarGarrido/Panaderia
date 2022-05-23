import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirebaseService } from 'src/app/Servicios/firebase.service';

@Component({
  selector: 'app-provedor',
  templateUrl: './provedor.component.html',
  styleUrls: ['./provedor.component.css']
})
export class ProvedorComponent implements OnInit {

  collection = { data: [] };
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
  ) { }

  ngOnInit(): void {this.idFirebaseUpdate = '';

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
    .nuevoRegistro(this.path, this.provedoresForm.value)
    .then((resp) => {
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
