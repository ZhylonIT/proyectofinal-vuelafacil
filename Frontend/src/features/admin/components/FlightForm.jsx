import { useState } from 'react';
import '../../../styles/AdminPanel.css';

function FlightForm({ existingDestinations = [], flightToEdit = null, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: flightToEdit?.name || '',
    description: flightToEdit?.description || '',
    destination: flightToEdit?.destination || '',
    category: flightToEdit?.category || 'todos',
    price: flightToEdit?.price || '',
    currency: flightToEdit?.currency || 'USD'
  });

  const [images, setImages] = useState(flightToEdit?.images || ['']);
  const [errorBackend, setErrorBackend] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationSelect = (e) => {
    setFormData(prev => ({ ...prev, destination: e.target.value }));
  };

  const handleImageUrlChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index] = value;
    setImages(updatedImages);
  };

  const handleFileUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("El archivo es muy pesado. Por favor suba una imagen menor a 2MB.");
        event.target.value = ''; 
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageUrlChange(index, reader.result);
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index) => {
    if (images.length === 1) return;
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBackend(null);

    const filteredImages = images.filter(url => url.trim() !== '');
    if (filteredImages.length === 0) {
      setErrorBackend('Debe agregar al menos una imagen válida (URL o Archivo).');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      destination: formData.destination,
      category: formData.category,
      price: parseFloat(formData.price),
      currency: formData.currency,
      images: filteredImages
    };

    try {
      setIsSubmitting(true);
      
      if (flightToEdit) {
        if (String(flightToEdit.id).startsWith('mock-')) {
          onSuccess(payload, flightToEdit.id);
          return;
        }

        const response = await fetch(`/api/vuelos/${flightToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el vuelo en el servidor. Verifique los datos.');
        }
        
        onSuccess();
      } else {
        // Modo Alta / Creación
        const response = await fetch('/api/vuelos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 400 || response.status === 500) {
            throw new Error('El nombre de este vuelo ya existe, por favor elija otro o revise los datos.');
          }
          throw new Error('Error al crear el vuelo. Intente nuevamente.');
        }

        onSuccess();
      }
    } catch (error) {
      setErrorBackend(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-form-panel">
      <div className="form-header">
        <button
          type="button"
          className="btn-secondary btn-back"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              window.history.back();
            }
          }}
        >
          ← Volver
        </button>
      </div>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">Nombre del paquete turístico</label>
          <input
            type="text"
            name="name"
            className="form-input"
            required
            placeholder="Ej: Vuelo Promocional Bariloche Invierno Completo"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Seleccionar Destino Existente</label>
          <select
            className="form-select"
            onChange={handleDestinationSelect}
            value={existingDestinations.includes(formData.destination) ? formData.destination : ''}
          >
            <option value="">-- Seleccione un destino del catálogo --</option>
            {existingDestinations.map((dest, i) => (
              <option key={i} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">O Escribir Nuevo Destino</label>
          <input
            type="text"
            name="destination"
            className="form-input"
            required
            placeholder="Ej: Bariloche, Argentina"
            value={formData.destination}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="todos">Seleccionar Categoría...</option>
            <option value="playa">Playa</option>
            <option value="montaña">Montaña</option>
            <option value="ciudad">Ciudad</option>
            <option value="historico">Histórico</option>
            <option value="naturaleza">Naturaleza</option>
          </select>
        </div>

        <div className="form-grid" style={{ gridColumn: 'span 1', gap: '0.75rem', padding: 0 }}>
          <div className="form-group">
            <label className="form-label">Precio</label>
            <input
              type="number"
              name="price"
              className="form-input"
              required
              min="1"
              placeholder="450"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Divisa</label>
            <select
              name="currency"
              className="form-select"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Descripción Detallada e Info Adicional</label>
          <textarea
            name="description"
            className="form-textarea"
            rows="4"
            required
            placeholder="Escribe los detalles del paquete de viaje, escalas, hoteles..."
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">URLs o Archivos de Imágenes (La primera será la portada)</label>
          <div className="dynamic-images-container">
            {images.map((imgValue, index) => {
              const isBase64 = imgValue.startsWith('data:image');
              
              return (
                <div key={index} className="image-input-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {imgValue && (
                    <img 
                      src={imgValue} 
                      alt="Preview" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  )}
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, textOverflow: 'ellipsis' }}
                    placeholder="Pegue URL de la imagen o use el botón..."
                    required
                    value={isBase64 ? "Archivo local cargado correctamente (Base64)" : imgValue}
                    onChange={(e) => {
                      if(e.target.value !== "Archivo local cargado correctamente (Base64)") {
                        handleImageUrlChange(index, e.target.value);
                      }
                    }}
                    readOnly={isBase64}
                  />
                  <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.85rem', margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    📁 Subir
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleFileUpload(index, e)}
                    />
                  </label>
                  {images.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ padding: '0.85rem' }}
                      onClick={() => removeImageField(index)}
                    >
                      X
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="btn-add-image"
            style={{ marginTop: '0.5rem' }}
            onClick={addImageField}
          >
            + Añadir Otra Imagen de Galería
          </button>
        </div>

        {errorBackend && (
          <div className="error-glass-alert" style={{ marginTop: '1.5rem', marginBottom: '0' }}>
            ⚠️ {errorBackend}
          </div>
        )}

        <div className="form-group full-width form-actions-footer">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : flightToEdit ? 'Actualizar Vuelo' : 'Guardar Vuelo'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FlightForm;