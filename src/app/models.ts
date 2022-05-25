export interface Cliente {
  id_cliente: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  telefono: number;
  direccion: string;
}

export interface Provedor {
  id_provedor: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  telefono: number;
}

export interface Producto {
  id_producto: string;
  nombre: string;
  tipo: string;
  precio: number;
  provedor:Provedor
}

export interface ProductoPedido {
  producto: Producto;
  cantidad: number;
  total: number;
}

export interface Venta {
  id_venta?: string;
  productos: ProductoPedido[];
  fecha: Date;
  totalNeto: number;
  cliente: Cliente;
  id_cliente?: string;
}

export interface Compra {
  id_compra: string;
  productos: Producto;
  cantidad: number;
  provedor: Provedor;
  Total: number;
}
