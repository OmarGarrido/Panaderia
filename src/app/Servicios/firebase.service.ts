import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Cliente } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  objecjSorce = new BehaviorSubject<{}>({});
  data: any = [];

  $getObjecjtSorce = this.objecjSorce.asObservable();

  constructor(private firestore: AngularFirestore) {}

  getClientes() {
    return this.firestore.collection('Clientes').snapshotChanges();
  }

  createCliente(user: any) {
    return this.firestore.collection('Clientes').add(user);
  }

  sendObjectSorce(data: any) {
    this.objecjSorce.next(data);
  }

  getSmartphone() {
    return this.firestore.collection('Smartphone2').snapshotChanges();
  }

  // metodo alterno para cargar coleciones generico
  getDoc<tipo>(path: string, id: string) {
    const collection = this.firestore.collection<tipo>(path);
    return collection.doc(id).valueChanges();
    // return this.firestore.collection(path).snapshotChanges();
  }

  getCollection(path: string) {
    return this.firestore.collection(path).snapshotChanges();
  }
  
  getCollectionType<tipo>(path: string) {
    return this.firestore.collection<tipo>(path).valueChanges();
  }

  getCollectionWhere<tipo>(path, param, buscar) {
    return this.firestore
      .collection<tipo>(path, (ref) => ref.where(param, '==', buscar))
      .valueChanges();
  }

  crearDoc(path: string, data: any, id: string) {
    const collection = this.firestore.collection(path);
    return collection.doc(id).set(data);
  }
  //metodos universales
  nuevoRegistro(path: string, item: any) {
    return this.firestore.collection(path).add(item);
  }

  actualizarRegistro(path: string, id: string, item: any) {
    return this.firestore.collection(path).doc(id).update(item);
  }

  //
  createSmartphone(Smartphone: any) {
    return this.firestore.collection('Smartphone2').add(Smartphone);
  }

  updateSmartphone(id: any, Smartphone: any) {
    return this.firestore.collection('Smartphone2').doc(id).update(Smartphone);
  }

  eliminarSmartphone(id: any) {
    return this.firestore.collection('Smartphone2').doc(id).delete();
  }

  agregarUrl(Smartphone: any) {
    return this.firestore
      .collection('Smartphone2')
      .doc(Smartphone.id)
      .update(Smartphone.url);
  }
}
