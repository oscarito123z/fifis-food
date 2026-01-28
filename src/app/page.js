"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [categoria, setCategoria] = useState('Todas');
  const [pedido, setPedido] = useState({});
  const [verResumen, setVerResumen] = useState(false);
  const [estaAbierto, setEstaAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [cantidadTemporal, setCantidadTemporal] = useState(0);
  
  // Nuevo estado para el tamaño seleccionado (solo para papas)
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState('Regular');

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

  const productos = [
    { id: 1, nombre: "La Ultra Fifi", precio: 180, cat: "Hamburguesas", desc: "Carne premium de 1/2 libra, doble queso cheddar fundido, cebolla caramelizada y nuestra famosa salsa secreta.", agotado: false },
    { id: 2, nombre: "La Doble Fifi", precio: 250, cat: "Hamburguesas", desc: "Dos tortas de carne premium, doble porción de tocino ahumado, queso pepper jack y vegetales frescos.", agotado: false },
    { id: 3, nombre: "Fifi Wings (6 unidades)", precio: 190, cat: "Pollo", desc: "Alitas crujientes bañadas en tu salsa favorita: BBQ, Búfalo o Miel Mostaza.", agotado: false },
    { id: 4, nombre: "Chicken Tenders", precio: 165, cat: "Pollo", desc: "Tiras de pechuga de pollo empanizadas a mano, acompañadas de papas fritas y salsa ranch.", agotado: false },
    { id: 5, nombre: "Salchipapa Jumbo", precio: 120, cat: "Salchipapas", desc: "Cama de papas fritas extra crujientes con salchicha parrillera troceada y salsa rosada.", agotado: false },
    { id: 6, nombre: "Papas Clásicas", precio: 80, cat: "Antojos", desc: "Nuestras clásicas papas fritas con un toque de sal de mar y especias de la casa.", agotado: false, tieneTamanos: true },
    { id: 7, nombre: "Dados de Queso", precio: 110, cat: "Antojos", desc: "Cubos de queso empanizados y fritos, servidos con una deliciosa mermelada de tomate.", agotado: false },
    { id: 8, nombre: "Papas Waffle", precio: 95, cat: "Antojos", desc: "Papas en corte waffle, súper crujientes por fuera y suaves por dentro.", agotado: false },
    { id: 9, nombre: "Coca-Cola", precio: 60, cat: "Bebidas", desc: "Refrescante Coca-Cola original en lata de 355ml.", agotado: false },
    { id: 10, nombre: "Té Frío", precio: 35, cat: "Bebidas", desc: "Té negro con infusión de limón natural y azúcar de caña.", agotado: false },
  ];

  const abrirDetalle = (prod) => {
    setProductoDetalle(prod);
    setTamanoSeleccionado('Regular'); // Resetear a regular al abrir
    setCantidadTemporal(pedido[`${prod.id}-${tamanoSeleccionado}`] || 1); // Empezar con 1 por defecto
  };

  const obtenerPrecioActual = () => {
    if (!productoDetalle) return 0;
    if (productoDetalle.id === 6) { // Lógica para Papas Clásicas
      if (tamanoSeleccionado === 'Mediana') return 90;
      if (tamanoSeleccionado === 'Grande') return 100;
      return 80; // Regular
    }
    return productoDetalle.precio;
  };

  const confirmarAlCarrito = () => {
    const key = productoDetalle.tieneTamanos ? `${productoDetalle.id}-${tamanoSeleccionado}` : productoDetalle.id;
    setPedido(prev => {
      const nuevo = { ...prev };
      if (cantidadTemporal > 0) {
        nuevo[key] = { 
          id: productoDetalle.id, 
          cant: cantidadTemporal, 
          tamano: productoDetalle.tieneTamanos ? tamanoSeleccionado : null,
          precioUnitario: obtenerPrecioActual()
        };
      } else {
        delete nuevo[key];
      }
      return nuevo;
    });
    setProductoDetalle(null);
  };

  const modificarCantidadCarrito = (key, delta) => {
    setPedido(prev => {
      const nuevo = { ...prev };
      const nuevaCant = nuevo[key].cant + delta;
      if (nuevaCant > 0) nuevo[key].cant = nuevaCant;
      else delete nuevo[key];
      if (Object.keys(nuevo).length === 0) setVerResumen(false);
      return nuevo;
    });
  };

  const montoTotal = Object.values(pedido).reduce((acc, item) => acc + (item.precioUnitario * item.cant), 0);
  const totalItems = Object.values(pedido).reduce((acc, item) => acc + item.cant, 0);

  return (
    <main style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh' }}>
      <header style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Hola, bienvenido a</h1>
        <h2 style={{ color: '#FF8C00', fontSize: '38px', fontWeight: '900', fontStyle: 'italic', margin: '5px 0 0 0' }}>Fifi's Food</h2>
      </header>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '20px', gap: '10px' }}>
        {['Todas', 'Hamburguesas', 'Pollo', 'Salchipapas', 'Antojos', 'Bebidas'].map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '10px 25px', borderRadius: '50px', border: 'none', backgroundColor: categoria === cat ? '#FF8C00' : '#1a1a1a', color: categoria === cat ? '#000' : '#fff', fontWeight: 'bold' }}>
            {cat}
          </button>
        ))}
      </div>

      <section style={{ padding: '0 20px 120px 20px' }}>
        {productos.filter(p => categoria === 'Todas' || p.cat === categoria).map(prod => (
          <div key={prod.id} onClick={() => abrirDetalle(prod)} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '25px', border: '1px solid #222', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{prod.nombre}</h3>
            <p style={{ color: '#777', fontSize: '12px', margin: '5px 0' }}>{prod.desc}</p>
            <span style={{ color: '#FF8C00', fontWeight: '900' }}>C$ {prod.precio}{prod.tieneTamanos && '+'}</span>
          </div>
        ))}
      </section>

      <AnimatePresence>
        {productoDetalle && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductoDetalle(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 200 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#111', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', padding: '40px 30px', zIndex: 300 }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '10px' }}>{productoDetalle.nombre}</h2>
              
              {/* SELECTOR DE TAMAÑO TIPO MCDONALDS */}
              {productoDetalle.id === 6 && (
                <div style={{ marginBottom: '30px' }}>
                  <p style={{ fontSize: '14px', color: '#777', marginBottom: '15px' }}>Selecciona el tamaño:</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Regular', 'Mediana', 'Grande'].map(t => (
                      <button key={t} onClick={() => setTamanoSeleccionado(t)} style={{ flex: 1, padding: '12px', borderRadius: '15px', border: tamanoSeleccionado === t ? '2px solid #FF8C00' : '1px solid #333', backgroundColor: tamanoSeleccionado === t ? 'rgba(255,140,0,0.1)' : 'transparent', color: tamanoSeleccionado === t ? '#FF8C00' : '#fff', fontWeight: 'bold', fontSize: '12px' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <span style={{ fontSize: '26px', fontWeight: '900', color: '#FF8C00' }}>C$ {obtenerPrecioActual()}</span>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: '15px', padding: '5px' }}>
                  <button onClick={() => setCantidadTemporal(Math.max(1, cantidadTemporal - 1))} style={{ width: '35px', height: '35px', border: 'none', backgroundColor: '#333', color: '#fff', borderRadius: '10px' }}>-</button>
                  <span style={{ margin: '0 15px', fontWeight: 'bold' }}>{cantidadTemporal}</span>
                  <button onClick={() => setCantidadTemporal(cantidadTemporal + 1)} style={{ width: '35px', height: '35px', border: 'none', backgroundColor: '#FF8C00', borderRadius: '10px' }}>+</button>
                </div>
              </div>

              <button onClick={confirmarAlCarrito} style={{ width: '100%', backgroundColor: '#FF8C00', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', display: 'flex', justifyContent: 'space-between' }}>
                <span>AÑADIR AL CARRITO</span>
                <span>C$ {obtenerPrecioActual() * cantidadTemporal}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CARRITO */}
      <AnimatePresence>
        {verResumen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setVerResumen(false)} style={{ background: 'none', border: 'none', color: '#FF8C00', fontSize: '20px' }}>✕</button>
              <h2 style={{ marginLeft: '15px', fontSize: '18px' }}>Mi Pedido</h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {Object.entries(pedido).map(([key, item]) => {
                const prodOriginal = productos.find(p => p.id === item.id);
                return (
                  <div key={key} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px solid #111' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0 }}>{prodOriginal?.nombre} {item.tamano && `(${item.tamano})`}</h4>
                      <p style={{ color: '#777', fontSize: '11px', margin: '4px 0' }}>{prodOriginal?.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => modificarCantidadCarrito(key, -1)} style={{ width: '25px', height: '25px', borderRadius: '5px', border: '1px solid #333', background: 'none', color: '#fff' }}>-</button>
                        <span>{item.cant}</span>
                        <button onClick={() => modificarCantidadCarrito(key, 1)} style={{ width: '25px', height: '25px', borderRadius: '5px', border: '1px solid #333', background: 'none', color: '#fff' }}>+</button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>C$ {item.precioUnitario * item.cant}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '30px', backgroundColor: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>
                <span>Total</span>
                <span style={{ color: '#FF8C00' }}>C$ {montoTotal}</span>
              </div>
              <button style={{ width: '100%', backgroundColor: '#FF8C00', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900' }}>CONTINUAR</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {totalItems > 0 && !productoDetalle && !verResumen && (
        <button onClick={() => setVerResumen(true)} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', backgroundColor: '#FF8C00', padding: '18px', borderRadius: '20px', border: 'none', fontWeight: '900', zIndex: 100 }}>
          Ver mi Carrito (C$ {montoTotal})
        </button>
      )}
    </main>
  );
}