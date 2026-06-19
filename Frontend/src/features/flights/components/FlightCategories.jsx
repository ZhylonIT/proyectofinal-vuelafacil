import { useState } from 'react';
import '../../../styles/FlightCategories.css';

const STATIC_CATEGORIES = [
  { 
    id: 'todos', 
    name: 'Todos', 
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'playa', 
    name: 'Playa', 
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'montaña', 
    name: 'Montaña', 
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'ciudad', 
    name: 'Ciudad', 
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=500&q=80' 
  },
  { 
    id: 'historico', 
    name: 'Histórico', 
    image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=500&q=80' 
  }
];

function FlightCategories({ activeCategory, onCategoryChange }) {  
  const [localActiveCategory, setLocalActiveCategory] = useState('todos');  
  const currentActive = activeCategory !== undefined ? activeCategory : localActiveCategory;

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
        {STATIC_CATEGORIES.map((category) => {
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