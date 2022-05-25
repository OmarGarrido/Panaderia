import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './Componentes/clientes/clientes.component';
import { CompraComponent } from './Componentes/compra/compra.component';
import { ProductoComponent } from './Componentes/producto/producto.component';
import { ProvedorComponent } from './Componentes/provedor/provedor.component';
import { VentaComponent } from './Componentes/venta/venta.component';
import { VentasTotalesComponent } from './Componentes/ventas-totales/ventas-totales.component';

const routes: Routes = [
  { path: 'Clientes', component: ClientesComponent },
  { path: 'Provedores', component: ProvedorComponent },
  { path: 'Productos', component: ProductoComponent },
  { path: 'Ventas/:id', component: VentaComponent },
  { path: 'VentasTotales', component: VentasTotalesComponent },
  { path: 'Compras', component: CompraComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'Clientes' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
