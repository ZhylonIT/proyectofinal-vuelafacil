import '../../../styles/FlightPolicies.css';

const POLICIES = [
  {
    id: 'policy-1',
    title: 'Cancelación',
    description:
      'Podés cancelar tu reserva sin cargo hasta 72 horas antes de la fecha de salida. Pasado ese plazo, se aplicará una penalidad del 20% sobre el valor total del paquete.',
  },
  {
    id: 'policy-2',
    title: 'Equipaje',
    description:
      'El paquete incluye una pieza de equipaje de bodega de hasta 23 kg y un artículo personal. El equipaje adicional tiene un costo extra según la aerolínea operadora.',
  },
  {
    id: 'policy-3',
    title: 'Modificaciones',
    description:
      'Los cambios de fecha o nombre de pasajero están permitidos hasta 48 horas antes del vuelo, sujetos a disponibilidad y a la tarifa de reprogramación vigente.',
  },
  {
    id: 'policy-4',
    title: 'Documentación',
    description:
      'Es responsabilidad del pasajero contar con DNI o pasaporte vigente. Para destinos internacionales verificá los requisitos de visa del país de destino antes de la compra.',
  },
  {
    id: 'policy-5',
    title: 'Seguro de Viaje',
    description:
      'Todos los paquetes incluyen cobertura básica de asistencia médica en viaje. Se recomienda contratar un seguro integral para mayor tranquilidad durante el recorrido.',
  },
  {
    id: 'policy-6',
    title: 'Menores de Edad',
    description:
      'Los menores que viajen sin ambos progenitores deberán presentar autorización notarial vigente. Consultá con nuestro equipo las regulaciones específicas del destino.',
  },
];

function FlightPolicies() {
  return (
    <section className="policies-section">
      <h2 className="policies-title">Políticas del Producto</h2>
      <div className="policies-grid">
        {POLICIES.map((policy) => (
          <article key={policy.id} className="policy-card">
            <h3 className="policy-card-title">{policy.title}</h3>
            <p className="policy-card-description">{policy.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FlightPolicies;