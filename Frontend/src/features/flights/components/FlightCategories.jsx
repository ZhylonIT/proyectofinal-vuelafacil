import { useState, useEffect } from 'react';
import { categoriaService } from '../../../services/categoriaService';
import '../../../styles/FlightCategories.css';

const ALL_CATEGORY = {
  id: 'todos',
  name: 'Todos',
  image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=500&q=80'
};

function FlightCategories({ activeCategory, onCategoryChange }) {
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [localActiveCategory, setLocalActiveCategory] = useState('todos');
  const currentActive = activeCategory !== undefined ? activeCategory : localActiveCategory;

  useEffect(() => {
    categoriaService.listar()
      .then(data => {
        const fromApi = (Array.isArray(data) ? data : []).map(cat => ({
          id: cat.nombre.toLowerCase(),
          name: cat.nombre,
          image: cat.imagen
        }));
        setCategories([ALL_CATEGORY, ...fromApi]);
      })
      .catch(error => {
        console.error('Error cargando las categorías desde la API:', error);
      });
  }, []);

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    } else {
      setLocalActiveCategory(categoryId);
    }
  };

  return (
    <section className="categories-section">
      <h2 className="categories-title">Explora tu proximo destino</h2>
      <div className="categories-grid">
        {categories.map((category) => {
          const isActive = currentActive === category.id;
          return (
            <button
              key={category.id}
              className={`category-card ${isActive ? 'category-card--active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              aria-pressed={isActive}
              type="button"
            >
              <img
                src={category.image}
                alt={`Categoría ${category.name}`}
                className="category-image"
              />
              <div className="category-overlay"></div>
              <span className="category-name">{category.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FlightCategories;
