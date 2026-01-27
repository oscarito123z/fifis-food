"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [categoria, setCategoria] = useState('Todas');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);

  useEffect(() => {
    const revisarHorario = () => {
      const ahora = new Date();
      const opciones = { timeZone: 'America/Managua', hour: 'numeric', hour12: false };
      const horaNicaragua = parseInt(new Intl.DateTimeFormat('en-US', opciones).format(ahora));
      setEstaAbierto(horaNicaragua >= 18 && horaNicaragua < 23);
    };
    revisarHorario();
    const intervalo = setInterval(revisarHorario, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const categorias = ['Todas', 'Hamburguesas', 'Nachos', 'Salchipapas', 'Bebidas', 'Extras'];
  
  const productos = [
    { id: 1, nombre: "La Ultra Fifi", precio: 180, cat: "Hamburguesas", desc: "Carne premium de 1/2 libra, doble queso cheddar fundido, cebolla caramelizada y nuestra famosa salsa secreta en pan artesanal de papa.", agotado: false },
    { id: 2, nombre: "La Doble Fifi", precio: 250, cat: "Hamburguesas", desc: "Para los verdaderos hambrientos: dos tortas de carne premium, doble porción de tocino ahumado, queso pepper jack y vegetales frescos.", agotado: false },
    { id: 3, nombre: "Nachos Supremos", precio: 150, cat: "Nachos", desc: "Crujientes tortillas de maíz cubiertas con una generosa capa de queso fundido, frijoles refritos, pico de gallo, jalapeños y crema agria.", agotado: false },
    { id: 4, nombre: "Salchipapa Jumbo", precio: 120, cat: "Salchipapas", desc: "Cama de papas fritas extra crujientes con salchicha parrillera troceada, bañadas en salsa rosada y queso rallado.", agotado: false },
    { id: 5, nombre: "Coca-Cola", precio: 60, cat: "Bebidas", desc: "Refrescante Coca-Cola original en lata de 355ml, servida al punto de nieve.", agotado: false },
    { id: 6, nombre: "Té Frío", precio: 35, cat: "Bebidas", desc: "Té negro con infusión de limón natural y azúcar de caña, servido con mucho hielo.", agotado: false },
    { id: 7, nombre: "Papas Grandes", precio: 80, cat: "Extras", desc: "Nuestras clásicas papas fritas con un toque de sal de mar y especias de la casa. ¡El acompañamiento perfecto!", agotado: false },
  ];

  const sumarProducto = (id) => {
    setPedido(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const restarProducto = (id) => {
    setPedido(prev => {
      const nuevo = { ...prev };
      if (nuevo[id] > 1) nuevo[id] -= 1;
      else delete nuevo[id];
      return nuevo;
    });
  };

  const totalItems = Object.values(pedido).reduce((acc, cant) => acc + cant, 0);
  const montoTotal = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const prod = productos.find(p => p.id === parseInt(id));
    return acc + (prod ? prod.precio * cant : 0);
  }, 0);

  const filtrados = categoria === 'Todas' ? productos : productos.filter(p => p.cat === categoria);

  // Cálculo del subtotal para el producto que se está viendo en detalle
  const cantidadEnDetalle = productoDetalle ? (pedido[productoDetalle.id] || 0) : 0;
  const subtotalDetalle = productoDetalle ? (productoDetalle.precio * cantidadEnDetalle) : 0;

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      
      <header style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #222', position: 'sticky', top: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <h1 style={{ color: '#FF8C00', fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>Fifi's</h1>
        <p style={{ letterSpacing: '4px', fontSize: '12px', margin: 0 }}>FOOD</p>
      </header>

      <div style={{ padding: '15px 20px 0 20px' }}>
        <div style={{
          padding: '12px', borderRadius: '15px', backgroundColor: estaAbierto ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 68, 68, 0.1)',
          color: estaAbierto ? '#28a745' : '#ff4444', border: `1px solid ${estaAbierto ? '#28a745' : '#ff4444'}`,
          textAlign: 'center', fontSize: '13px', fontWeight: 'bold'
        }}>
          {estaAbierto ? '● ABIERTO HASTA LAS 11PM' : '○ CERRADO (ABRIMOS A LAS 6PM)'}
        </div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px', scrollbarWidth: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }` }} />
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {cat}
          </button>
        ))}
      </div>

      <section style={{ padding: '0 20px 100px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filtrados.map(prod => (
            <div key={prod.id} onClick={() => !prod.agotado && setProductoDetalle(prod)} style={{ 
              backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', 
              opacity: prod.agotado ? 0.5 : 1, cursor: 'pointer' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{prod.nombre}</h3>
                  <p style={{ color: '#777', fontSize: '12px', margin: '4px 0 10px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prod.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#FF8C00', fontWeight: '900', fontSize: '18px' }}>C$ {prod.precio}</span>
                    {pedido[prod.id] > 0 && <span style={{ backgroundColor: '#FF8C00', color: '#000', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px' }}>{pedido[prod.id]} en carrito</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {productoDetalle && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductoDetalle(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '40px 30px', zIndex: 300, maxHeight: '90vh' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: '#333', borderRadius: '2px', margin: '-20px auto 25px auto' }} />
              
              <div style={{ width: '100%', height: '200px', backgroundColor: '#1a1a1a', borderRadius: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                <span style={{ fontSize: '12px' }}>IMAGEN DEL PRODUCTO</span>
              </div>

              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0' }}>{productoDetalle.nombre}</h2>
              <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>{productoDetalle.desc}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', color: '#FF8C00' }}>C$ {productoDetalle.precio}</span>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); restarProducto(productoDetalle.id); }} style={{ backgroundColor: '#333', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '15px', fontSize: '20px' }}>-</button>
                  <span style={{ margin: '0 20px', fontWeight: 'bold', fontSize: '20px' }}>{cantidadEnDetalle}</span>
                  <button onClick={(e) => { e.stopPropagation(); sumarProducto(productoDetalle.id); }} style={{ backgroundColor: '#FF8C00', border: 'none', width: '40px', height: '40px', borderRadius: '15px', fontWeight: 'bold', fontSize: '20px' }}>+</button>
                </div>
              </div>

              {/* BOTÓN DINÁMICO TIPO MCDONALDS */}
              <button onClick={() => setProductoDetalle(null)} style={{ 
                width: '100%', 
                backgroundColor: cantidadEnDetalle > 0 ? '#FF8C00' : '#333', 
                color: cantidadEnDetalle > 0 ? '#000' : '#fff', 
                padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>{cantidadEnDetalle > 0 ? 'AÑADIR AL CARRITO' : 'VOLVER AL MENÚ'}</span>
                {cantidadEnDetalle > 0 && <span>C$ {subtotalDetalle}</span>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {totalItems > 0 && !productoDetalle && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', zIndex: 100 }}>
          <button onClick={() => setVerResumen(true)} style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '16px', boxShadow: '0 10px 30px rgba(255,140,0,0.4)' }}>
            VER CARRITO ({totalItems}) - C$ {montoTotal}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {verResumen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVerResumen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 400 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', zIndex: 500, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FF8C00', margin: 0 }}>Tu Pedido</h2>
                <button onClick={() => { if(confirm("¿Borrar pedido?")) { setPedido({}); setVerResumen(false); } }} style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4444', fontWeight: 'bold' }}>BORRAR TODO</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {Object.entries(pedido).map(([id, cant]) => {
                  const item = productos.find(p => p.id === parseInt(id));
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                      <span><span style={{ color: '#FF8C00', fontWeight: 'bold' }}>{cant}x</span> {item?.nombre}</span>
                      <span style={{ fontWeight: 'bold' }}>C$ {item ? item.precio * cant : 0}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total a pagar:</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#FF8C00' }}>C$ {montoTotal}</span>
              </div>
              <button onClick={() => setVerResumen(false)} style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff', padding: '18px', borderRadius: '20px', border: '1px solid #333', fontWeight: '900', marginBottom: '10px' }}>AGREGAR MÁS</button>
              <button style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>CONFIRMAR PEDIDO</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}