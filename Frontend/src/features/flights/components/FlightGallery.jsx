import { useState, useEffect, useCallback } from 'react';
import '../../../styles/FlightDetail.css';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=800&auto=format&fit=crop'
];

function FlightGallery({ images = [], destination }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null); 

  const verifiedImages = Array.from({ length: 5 }, (_, i) => {
    return images && images[i] ? images[i] : PLACEHOLDER_IMAGES[i];
  });

  const allImages = images && images.length > 0 ? images : verifiedImages;

  const handleNext = useCallback(() => {
    setFocusedIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrev = useCallback(() => {
    setFocusedIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (focusedIndex !== null) {
          setFocusedIndex(null);
        } 
        else if (isModalOpen) {
          setIsModalOpen(false);
        }
      } 
      else if (focusedIndex !== null) {
        if (event.key === 'ArrowRight') {
          handleNext();
        } else if (event.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedIndex, isModalOpen, handleNext, handlePrev]); 

  return (
    <div className="gallery-wrapper">
      <div className="gallery-block">
        
        <div 
          className="gallery-main-half" 
          onClick={() => setFocusedIndex(0)}
          style={{ cursor: 'pointer' }}
          title="Ver imagen completa"
        >
          <img 
            src={verifiedImages[0]} 
            alt={`${destination} - Principal`} 
            className="gallery-img-fluid main-img"
            loading="lazy"
          />
        </div>

        <div className="gallery-subgrid-half">
          {verifiedImages.slice(1, 5).map((imgUrl, index) => (
            <div 
              key={index} 
              className={`subgrid-item item-${index}`}
              onClick={() => setFocusedIndex(index + 1)}
              style={{ cursor: 'pointer' }}
              title="Ver imagen completa"
            >
              <img 
                src={imgUrl} 
                alt={`${destination} - Detalle ${index + 1}`} 
                className="gallery-img-fluid"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <button 
          className="gallery-view-more-trigger" 
          onClick={() => setIsModalOpen(true)}
        >
          <span>Ver más</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="gallery-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Catálogo Fotográfico Completo: {destination}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕ Close</button>
            </header>
            <div className="modal-grid-scroll">
              {allImages.map((imgUrl, index) => (
                <div 
                  key={index} 
                  className="modal-image-card" 
                  onClick={() => setFocusedIndex(index)} 
                  style={{ cursor: 'pointer' }}
                  title="Ampliar imagen"
                >
                  <img src={imgUrl} alt={`Exploración ${index + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {focusedIndex !== null && (
        <div 
          className="gallery-modal-overlay" 
          style={{ zIndex: 3000 }} 
          onClick={() => setFocusedIndex(null)}
        >
          <div 
            className="gallery-modal-content" 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'relative',
              width: '100%',
              height: '100%'
            }} 
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              className="modal-close-btn" 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.7)', padding: '0.6rem 1.2rem', borderRadius: '8px', zIndex: 3010 }} 
              onClick={() => setFocusedIndex(null)}
            >
              ✕ Cerrar
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              style={{ position: 'absolute', left: '20px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 3010, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              aria-label="Imagen anterior"
            >
              ❮
            </button>

            <img 
              src={allImages[focusedIndex]} 
              alt="Vista expandida" 
              style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', userSelect: 'none' }} 
            />

            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              style={{ position: 'absolute', right: '20px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 3010, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              aria-label="Imagen siguiente"
            >
              ❯
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightGallery;