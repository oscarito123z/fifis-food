"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase'; // Importamos la conexión

export default function Home() {
  const [productos, setProductos] = useState([]); // Ahora empieza vacío
  const [categoria, setCategoria] = useState('Todas');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [cantidadTemporal, setCantidadTemporal] = useState(0);

  // FUNCIÓN PARA CARGAR PRODUCTOS DESDE SUPABASE
  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) console.log('Error cargando:', error);
      else setProductos(data);
    };
    cargarProductos();
  }, []);

  const totalItems = Object.values(pedido).reduce((acc, cant) => acc + cant, 0);
  const montoTotal = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const prod = productos.find(p => p.id === parseInt(id));
    return acc + (prod ? prod.precio * cant : 0);
  }, 0);

  const filtrados = categoria === 'Todas' ? productos : productos.filter(p => p.categoria === categoria);

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', paddingBottom: '100px' }}>
      <header style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Hola, bienvenido a</h1>
        <h2 style={{ color: '#FF8C00', fontSize: '38px', fontWeight: '900', fontStyle: 'italic', margin: '5px 0 0 0' }}>Fifi's Food</h2>
      </header>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px' }}>
        {['Todas', 'Hamburguesas', 'Pollo', 'Salchipapas', 'Antojos', 'Bebidas'].map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold' }}>{cat}</button>
        ))}
      </div>

      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filtrados.map(prod => (
            <div key={prod.id} onClick={() => !prod.agotado && (setProductoDetalle(prod), setCantidadTemporal(pedido[prod.id] || 0))} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', opacity: prod.agotado ? 0.5 : 1 }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{prod.nombre}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ color: '#FF8C00', fontWeight: '900' }}>C$ {prod.precio}</span>
                {prod.agotado && <span style={{ color: '#ff4444', fontSize: '12px' }}>AGOTADO</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTÓN FLOTANTE */}
      {totalItems > 0 && (
        <button onClick={() => setVerResumen(true)} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', backgroundColor: '#FF8C00', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>
          Ver mi Carrito (C$ {montoTotal} por {totalItems} artículos)
        </button>
      )}

      {/* El resto de modales (Detalle y Carrito) irían aquí igual que antes... */}
    </main>
  );
}