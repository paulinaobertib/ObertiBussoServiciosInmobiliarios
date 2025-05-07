import { useComparison } from '../context/comparisonContext'; 
import Navbar from '../components/navbar';


const Compare = () => {
  const { comparisonItems, clearComparison } = useComparison();

  if (comparisonItems.length === 0) {
    return (
      <>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <p>No hay propiedades para comparar.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: '1rem' }}>
        <h2>Comparar propiedades</h2>
        <button onClick={clearComparison} style={{ marginBottom: '1rem' }}>
          Limpiar comparación
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {comparisonItems.map((property) => (
            <div key={property.id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
              <img src={property.img} alt={property.title} style={{ width: '100px' }} />
              <h3>{property.title}</h3>
              <p>Precio: ${property.price}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Compare;
