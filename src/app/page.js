"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase'; 

export default function Home() {
  const [productos, setProductos] = useState([]); 
  const [categoria, setCategoria] = useState('Todas');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [cantidadTemporal, setCantidadTemporal] = useState(0);

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
    return acc + (prod ? prod.precio * parseInt(cant) : 0);
  }, 0);

  const confirmarAlCarrito = () => {
    setPedido(prev => {
      const nuevo = { ...prev };
      if (cantidadTemporal > 0) nuevo[productoDetalle.id] = cantidadTemporal;
      else delete nuevo[productoDetalle.id];
      return nuevo;
    });
    setProductoDetalle(null);
  };

  const modificarCantidadCarrito = (id, delta) => {
    setPedido(prev => {
      const nuevo = { ...prev };
      const nuevaCant = (nuevo[id] || 0) + delta;
      if (nuevaCant > 0) nuevo[id] = nuevaCant;
      else delete nuevo[id];
      if (Object.keys(nuevo).length === 0) setVerResumen(false);
      return nuevo;
    });
  };

  const filtrados = categoria === 'Todas' ? productos : productos.filter(p => p.categoria === categoria);

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', paddingBottom: '120px' }}>
      <header style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Hola, bienvenido a</h1>
        <h2 style={{ color: '#FF8C00', fontSize: '38px', fontWeight: '900', fontStyle: 'italic', margin: '5px 0 0 0' }}>Fifi's Food</h2>
      </header>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px' }}>
        {['Todas', 'Hamburguesas', 'Pollo', 'Salchipapas', 'Antojos', 'Bebidas'].map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filtrados.map(prod => (
            <div key={prod.id} onClick={() => !prod.agotado && (setProductoDetalle(prod), setCantidadTemporal(pedido[prod.id] || 1))} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', opacity: prod.agotado ? 0.5 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
              
              {/* INFO A LA IZQUIERDA */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{prod.nombre}</h3>
                <p style={{ color: '#777', fontSize: '12px', margin: '4px 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#FF8C00', fontWeight: '900', fontSize: '18px' }}>C$ {prod.precio}</span>
                  {pedido[prod.id] > 0 && <span style={{ backgroundColor: '#FF8C00', color: '#000', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>{pedido[prod.id]}</span>}
                </div>
              </div>

              {/* FOTO A LA DERECHA */}
              {prod.imagen && (
                <div style={{ width: '90px', height: '90px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={prod.imagen} alt={prod.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
            </div>
          ))}
        </div>
      </section>

      {/* CARRITO Y MODALES */}
      <AnimatePresence>
        {verResumen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setVerResumen(false)} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: '24px', marginRight: '15px' }}>✕</button>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Mi Pedido</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {Object.entries(pedido).map(([id, cant]) => {
                const item = productos.find(p => p.id === parseInt(id));
                return (
                  <div key={id} style={{ display: 'flex', gap: '15px', padding: '20px 0', borderBottom: '1px solid #111', alignItems: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111', flexShrink: 0 }}>
                      {item?.imagen ? <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#333' }}>Fifi's</div>}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{item?.nombre}</h4>
                      <p style={{ color: '#777', fontSize: '11px', margin: '2px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item?.desc}</p>
                      <p style={{ color: '#FF8C00', margin: '4px 0', fontWeight: 'bold' }}>C$ {item?.precio}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => modificarCantidadCarrito(id, -1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #333', background: 'none', color: '#fff' }}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{cant}</span>
                        <button onClick={() => modificarCantidadCarrito(id, 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #333', background: 'none', color: '#fff' }}>+</button>
                      </div>
                    </div>
                    
                    <div style={{ fontWeight: 'bold' }}>C$ {item ? item.precio * cant : 0}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '30px', backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', fontWeight: '900' }}>
                <span>Total</span>
                <span style={{ color: '#FF8C00' }}>C$ {montoTotal}</span>
              </div>
              <button style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>CONTINUAR</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {totalItems > 0 && !productoDetalle && !verResumen && (
        <button onClick={() => setVerResumen(true)} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', backgroundColor: '#FF8C00', color: '#000', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', zIndex: 100 }}>
          Ver mi Carrito (C$ {montoTotal})
        </button>
      )}

      <AnimatePresence>
        {productoDetalle && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductoDetalle(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '40px 30px', zIndex: 300 }}>
              {productoDetalle.imagen && (
                <div style={{ width: '100%', height: '200px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
                  <img src={productoDetalle.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0' }}>{productoDetalle.nombre}</h2>
              <p style={{ color: '#aaa', marginBottom: '30px' }}>{productoDetalle.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', color: '#FF8C00' }}>C$ {productoDetalle.precio}</span>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '8px' }}>
                  <button onClick={() => setCantidadTemporal(Math.max(0, cantidadTemporal - 1))} style={{ backgroundColor: '#333', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '15px' }}>-</button>
                  <span style={{ margin: '0 20px', fontWeight: 'bold', fontSize: '20px' }}>{cantidadTemporal}</span>
                  <button onClick={() => setCantidadTemporal(cantidadTemporal + 1)} style={{ backgroundColor: '#FF8C00', border: 'none', width: '40px', height: '40px', borderRadius: '15px' }}>+</button>
                </div>
              </div>
              <button onClick={confirmarAlCarrito} style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', display: 'flex', justifyContent: 'space-between' }}>
                <span>{cantidadTemporal > 0 ? 'AÑADIR AL CARRITO' : 'VOLVER AL MENÚ'}</span>
                {cantidadTemporal > 0 && <span>C$ {productoDetalle.precio * cantidadTemporal}</span>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}