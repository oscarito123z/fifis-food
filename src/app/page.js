"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase'; 

export default function Home() {
  const [productos, setProductos] = useState([]); 
  const [categoria, setCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [cantidadTemporal, setCantidadTemporal] = useState(0);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [pasoFinal, setPasoFinal] = useState(false);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const { data: prodData } = await supabase.from('productos').select('*');
      if (prodData) setProductos(prodData);

      const { data: ajustData } = await supabase.from('ajustes').select('abierto_manual').eq('id', 1).single();
      
      const ahora = new Date();
      const hora = ahora.getHours();
      const horarioCorrecto = (hora >= 17 && hora < 23);

      if (ajustData && ajustData.abierto_manual && horarioCorrecto) {
        setEstaAbierto(true);
      } else {
        setEstaAbierto(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  const montoTotal = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const prod = productos.find(p => p.id === parseInt(id));
    return acc + (prod ? prod.precio * parseInt(cant) : 0);
  }, 0);

  const modificarCantidadCarrito = (id, delta) => {
    setPedido(prev => {
      const nuevo = { ...prev };
      const nuevaCant = (nuevo[id] || 0) + delta;
      if (nuevaCant > 0) nuevo[id] = nuevaCant;
      else delete nuevo[id];
      if (Object.keys(nuevo).length === 0) {
        setVerResumen(false);
        setPasoFinal(false);
      }
      return nuevo;
    });
  };

  const filtrados = productos.filter(p => {
    const coincideCategoria = categoria === 'Todas' || p.categoria === categoria;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', paddingBottom: '120px' }}>
      <header style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Hola, bienvenido a</h1>
        <h2 style={{ color: '#FF8C00', fontSize: '38px', fontWeight: '900', fontStyle: 'italic', margin: '5px 0 0 0' }}>Fifi's Food</h2>
      </header>

      <div style={{ backgroundColor: estaAbierto ? '#00c853' : '#d50000', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {estaAbierto ? '● Abiertos ahora en Managua' : '○ Cerrado por ahora'}
      </div>

      <div style={{ padding: '20px 20px 0 20px' }}>
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="¿Qué se te antoja hoy?" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', padding: '15px 15px 15px 45px', color: '#fff', outline: 'none' }} />
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#555' }}>🔍</span>
        </div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px' }}>
        {['Todas', 'Hamburguesas', 'Pollo', 'Salchipapas', 'Antojos', 'Bebidas'].map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{cat}</button>
        ))}
      </div>

      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filtrados.map(prod => (
            <div key={prod.id} onClick={() => !prod.agotado && estaAbierto && (setProductoDetalle(prod), setCantidadTemporal(pedido[prod.id] || 1))} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', opacity: (prod.agotado || !estaAbierto) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
              {prod.imagen && (
                <div style={{ width: '90px', height: '90px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={prod.imagen} alt={prod.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{prod.nombre}</h3>
                <p style={{ color: '#777', fontSize: '12px', margin: '4px 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#FF8C00', fontWeight: '900', fontSize: '18px' }}>C$ {prod.precio}</span>
                  {pedido[prod.id] > 0 && <span style={{ backgroundColor: '#FF8C00', color: '#000', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>{pedido[prod.id]}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {verResumen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center' }}>
              <button onClick={() => { setVerResumen(false); setPasoFinal(false); }} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: '24px', marginRight: '15px' }}>✕</button>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{pasoFinal ? '¿Cómo lo recibís?' : 'Mi Pedido'}</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {!pasoFinal ? (
                Object.entries(pedido).map(([id, cant]) => {
                  const item = productos.find(p => p.id === parseInt(id));
                  return (
                    <div key={id} style={{ display: 'flex', gap: '15px', padding: '20px 0', borderBottom: '1px solid #111', alignItems: 'center' }}>
                      <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111', flexShrink: 0 }}>
                        {item?.imagen ? <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#333' }}>Fifi's</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '16px' }}>{item?.nombre}</h4>
                        {/* AQUÍ ESTÁ LA DESCRIPCIÓN DE NUEVO */}
                        <p style={{ color: '#777', fontSize: '11px', margin: '2px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item?.desc}
                        </p>
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
                })
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', height: '100%' }}>
                   <button style={{ width: '100%', backgroundColor: '#111', color: '#fff', padding: '30px', borderRadius: '25px', border: '2px solid #222', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>🥡 Retirar en local</button>
                   <button style={{ width: '100%', backgroundColor: '#111', color: '#fff', padding: '30px', borderRadius: '25px', border: '2px solid #222', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>🛵 Pedir Delivery</button>
                   <button onClick={() => setPasoFinal(false)} style={{ width: '100%', backgroundColor: '#050505', color: '#777', padding: '25px', borderRadius: '25px', border: '1px dashed #333', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>↩️ Volver al carrito</button>
                </div>
              )}
            </div>

            <div style={{ padding: '30px', backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '20px', fontWeight: '900' }}>
                <span>Total</span>
                <span style={{ color: '#FF8C00' }}>C$ {montoTotal}</span>
              </div>
              {!pasoFinal && (
                <button 
                  onClick={() => estaAbierto ? setPasoFinal(true) : null} 
                  style={{ width: '100%', backgroundColor: estaAbierto ? '#FF8C00' : '#333', color: estaAbierto ? '#000' : '#777', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900' }}
                >
                  {estaAbierto ? 'CONTINUAR' : 'LOCAL CERRADO POR AHORA'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {Object.values(pedido).length > 0 && !productoDetalle && !verResumen && (
        <button 
          onClick={() => setVerResumen(true)} 
          style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', backgroundColor: estaAbierto ? '#FF8C00' : '#d50000', color: estaAbierto ? '#000' : '#fff', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', zIndex: 100 }}
        >
          {estaAbierto ? `Ver Carrito (C$ ${montoTotal})` : 'CERRADO POR EL MOMENTO'}
        </button>
      )}

      <AnimatePresence>
        {productoDetalle && estaAbierto && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductoDetalle(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '40px 30px', zIndex: 300 }}>
              {productoDetalle.imagen && <img src={productoDetalle.imagen} style={{ width: '100%', height: '200px', borderRadius: '20px', objectFit: 'cover', marginBottom: '20px' }} />}
              <h2 style={{ fontSize: '28px', fontWeight: '900' }}>{productoDetalle.nombre}</h2>
              <p style={{ color: '#aaa', margin: '10px 0 30px 0' }}>{productoDetalle.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', color: '#FF8C00' }}>C$ {productoDetalle.precio}</span>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '8px' }}>
                  <button onClick={() => setCantidadTemporal(Math.max(0, cantidadTemporal - 1))} style={{ backgroundColor: '#333', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '15px' }}>-</button>
                  <span style={{ margin: '0 20px', fontWeight: 'bold', fontSize: '20px' }}>{cantidadTemporal}</span>
                  <button onClick={() => setCantidadTemporal(cantidadTemporal + 1)} style={{ backgroundColor: '#FF8C00', border: 'none', width: '40px', height: '40px', borderRadius: '15px' }}>+</button>
                </div>
              </div>
              <button onClick={() => { setPedido({...pedido, [productoDetalle.id]: cantidadTemporal}); setProductoDetalle(null); }} style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>AGREGAR (C$ {productoDetalle.precio * cantidadTemporal})</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}