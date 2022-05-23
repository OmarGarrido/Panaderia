import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Producto, Provedor } from '../models';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class CarritoService {
  path = 'carrito/';
  uid = '';

  constructor(public fireBase: FirebaseService, public router: Router) {}

  loadCarrito() {
    // const path = 'Usuarios/' + this.uid + '/' + this.path;
    // this.fireBase.getDoc<PedidoCarrito>(path, this.uid).subscribe((res) => {
    //   // console.log(res);
    //   if (res) {
    //     this.pedido = res;
    //     console.log('hay Productos en Carrito-> ');
    //   } else {
    //     console.log('no hay nada en carrito');
    //     this.initCarrito();
    //   }
    // });
  }

  initCarrito() {
    // this.pedido = {
    //   id: this.uid,
    //   usuario: this.usuario,
    //   producto: [],
    //   precioTotal: null,
    //   estado: 'Enviado',
    // };
  }

  // loadCliente() {
  //   const path = 'Usuarios';
  //   // this.fireBase.getDoc<Usuario>(path, this.uid).subscribe((res) => {
  //   //   this.usuario = res;
  //   //   // console.log('Usuario-> ', this.usuario);

  //   //   this.loadCarrito();
  //   // });
  // }

  // addProducto(producto: Producto) {
  //   // console.log('info recibida ',producto);

  //   if (this.uid.length) {
  //     const item = this.pedido.producto.find((productosPedido) => {
  //       return productosPedido.producto.idFirebase === producto.idFirebase;
  //     });

  //     if (item) {
  //       item.cantidad++;
  //     } else {
  //       const pedido: ProductoPedido = {
  //         cantidad: 1,
  //         producto,
  //         // ó
  //         //producto:producto
  //       };
  //       this.pedido.producto.push(pedido);
  //     }
  //   } else {
  //     this.router.navigate(['register']);
  //   }
  //   // console.log('en add pedido-> ', this.pedido);
  //   const path = 'Usuarios/' + this.uid + '/' + this.path;
  //   this.fireBase.crearDoc(path, this.pedido, this.uid).then(() => {
  //     console.log('añadido con exito a la base de datos');
  //   });
  // }

  // getCarrito() {
  //   return this.pedido;
  // }

  // removeProducto(producto: Producto) {
  //   if (this.uid.length) {
  //     let posicion = 0;
  //     const item = this.pedido.producto.find((productosPedido, index) => {
  //       posicion = index;
  //       return productosPedido.producto.idFirebase === producto.idFirebase;
  //     });

  //     if (item) {
  //       item.cantidad--;
  //       if (item.cantidad == 0) {
  //         this.pedido.producto.splice(posicion, 1);
  //       }
  //     }
  //     const path = 'Usuarios/' + this.uid + '/' + this.path;
  //     this.fireBase.crearDoc(path, this.pedido, this.uid).then(() => {
  //       console.log('eliminado con exito');
  //     });
  //   }
  // }

  // realizarPedido() {}

  // clearCarrito() {}
}
