"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [categoria, setCategoria] = useState('Todas');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [estaAbierto, setEstaAbierto] = useState(false);

  // Lógica para verificar el horario de Nicaragua (6pm - 11pm)
  useEffect(() => {
    const revisarHorario = () => {
      const ahora = new Date();
      // Ajustamos a la hora de Nicaragua (UTC-6)
      const opciones = { timeZone: 'America/Managua', hour: 'numeric', hour12: false };
      const horaNicaragua = parseInt(new Intl.DateTimeFormat('en-US', opciones).format(ahora));
      
      // Abierto de las 18:00 (6pm) a las 23:00 (11pm)
      setEstaAbierto(horaNicaragua >= 18 && horaNicaragua < 23);
    };

    revisarHorario();
    const intervalo = setInterval(revisarHorario, 60000); // Revisa cada minuto
    return () => clearInterval(intervalo);
  }, []);

  const categorias = ['Todas', 'Hamburguesas', 'Nachos', 'Salchipapas', 'Bebidas', 'Extras'];
  
  const productos = [
    { id: 1, nombre: "La Ultra Fifi", precio: 180, cat: "Hamburguesas", desc: "Carne premium, queso cheddar y nuestra salsa secreta.", agotado: false },
    { id: 2, nombre: "La Doble Fifi", precio: 250, cat: "Hamburguesas", desc: "Doble torta de carne, doble queso y mucho tocino crujiente.", agotado: false },
    { id: 3, nombre: "Nachos Supremos", precio: 150, cat: "Nachos", desc: "Capa doble de queso fundido, frijoles y pico de gallo fresco.", agotado: false },
    { id: 4, nombre: "Salchipapa Jumbo", precio: 120, cat: "Salchipapas", desc: "Papas crunch con salchicha parrillera y aderezos Fifi.", agotado: false },
    { id: 5, nombre: "Coca-Cola", precio: 60, cat: "Bebidas", desc: "Lata de 355ml bien helada.", agotado: false },
    { id: 6, nombre: "Té Frío", precio: 35, cat: "Bebidas", desc: "Vaso de 16oz con mucho hielo y limón.", agotado: false },
    { id: 7, nombre: "Papas Grandes", precio: 80, cat: "Extras", desc: "Porción grande de papas con nuestra sal de la casa.", agotado: false },
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

  const limpiarPedido = () => {
    if (confirm("¿Seguro que quieres borrar todo tu pedido?")) {
      setPedido({});
      setVerResumen(false);
    }
  };

  const totalItems = Object.values(pedido).reduce((acc, cant) => acc + cant, 0);
  const montoTotal = Object.entries(pedido).reduce((acc, [id, cant]) => {
    const prod = productos.find(p => p.id === parseInt(id));
    return acc + (prod ? prod.precio * cant : 0);
  }, 0);

  const filtrados = categoria === 'Todas' ? productos : productos.filter(p => p.cat === categoria);

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #222', position: 'sticky', top: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 50 }}>
        <h1 style={{ color: '#FF8C00', fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>Fifi's</h1>
        <p style={{ letterSpacing: '4px', fontSize: '12px', margin: 0 }}>FOOD</p>
      </header>

      {/* AVISO DE HORARIO (NUEVO) */}
      <div style={{ padding: '15px 20px 0 20px' }}>
        <div style={{
          padding: '12px',
          borderRadius: '15px',
          backgroundColor: estaAbierto ? 'rgba(21, 87, 36, 0.2)' : 'rgba(114, 28, 36, 0.2)',
          color: estaAbierto ? '#28a745' : '#ff4444',
          border: `1px solid ${estaAbierto ? '#28a745' : '#ff4444'}`,
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {estaAbierto ? '● ¡ESTAMOS ATENDIENDO! (6pm - 11pm)' : '○ CERRADO POR AHORA (Abrimos a las 6pm)'}
        </div>
      </div>

      {/* SELECTOR DE CATEGORÍAS */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px', scrollbarWidth: 'none' }}>
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }` }} />
        {categorias.map(cat => (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold', whiteSpace: 'nowrap' }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* LISTA DE PRODUCTOS */}
      <section style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filtrados.map(prod => (
            <div key={prod.id} style={{ 
              backgroundColor: '#111', 
              padding: '20px', 
              borderRadius: '25px', 
              border: '1px solid #222',
              opacity: prod.agotado ? 0.5 : 1 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{prod.nombre}</h3>
                  <p style={{ color: '#777', fontSize: '12px', margin: '4px 0 10px 0', lineHeight: '1.4' }}>{prod.desc}</p>
                  <span style={{ color: prod.agotado ? '#555' : '#FF8C00', fontWeight: '900', fontSize: '19px' }}>
                    {prod.agotado ? 'AGOTADO' : `C$ ${prod.precio}`}
                  </span>
                </div>
                {!prod.agotado && (
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '15px', padding: '5px' }}>
                    {pedido[prod.id] > 0 && (
                      <>
                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => restarProducto(prod.id)} style={{ backgroundColor: '#333', border: 'none', color: '#fff', width: '35px', height: '35px', borderRadius: '10px', fontSize: '20px' }}>-</motion.button>
                        <span style={{ margin: '0 15px', fontWeight: 'bold' }}>{pedido[prod.id]}</span>
                      </>
                    )}
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => sumarProducto(prod.id)} style={{ backgroundColor: '#FF8C00', border: 'none', width: '40px', height: '40px', borderRadius: '12px', fontWeight: 'bold', fontSize: '24px' }}>+</motion.button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTÓN FLOTANTE */}
      {totalItems > 0 && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', zIndex: 100 }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setVerResumen(true)} style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '16px', boxShadow: '0 10px 30px rgba(255,140,0,0.3)' }}>
            VER MI PEDIDO ({totalItems})
          </motion.button>
        </motion.div>
      )}

      {/* MODAL DEL RESUMEN */}
      <AnimatePresence>
        {verResumen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVerResumen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '30px', zIndex: 300, maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FF8C00', margin: 0 }}>Tu Pedido</h2>
                <button onClick={limpiarPedido} style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4444', fontWeight: 'bold', fontSize: '14px' }}>BORRAR TODO</button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#FF8C00' }}>C$ {montoTotal}</span>
              </div>
              <button onClick={() => setVerResumen(false)} style={{ width: '100%', backgroundColor: '#FF8C00', color: '#000', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '16px' }}>AGREGAR MÁS</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}