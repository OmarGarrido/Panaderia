import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProvedorComponent } from './Componentes/provedor/provedor.component';
import { ProductoComponent } from './Componentes/producto/producto.component';
import {
  NgbdSortableHeader,
  VentaComponent,
} from './Componentes/venta/venta.component';
import { ClientesComponent } from './Componentes/clientes/clientes.component';
import { CompraComponent } from './Componentes/compra/compra.component';
import { NavbarComponent } from './Componentes/navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';

import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortDirective } from './Directives/sort.directive';
import { VentasTotalesComponent } from './Componentes/ventas-totales/ventas-totales.component';

@NgModule({
  declarations: [
    AppComponent,
    ProvedorComponent,
    ProductoComponent,
    VentaComponent,
    ClientesComponent,
    CompraComponent,
    NavbarComponent,
    SortDirective,
    NgbdSortableHeader,
    VentasTotalesComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
