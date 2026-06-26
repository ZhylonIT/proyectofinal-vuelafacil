import { useState } from 'react';
import '../../../styles/ShareModal.css';

const SOCIAL_NETWORKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
    getUrl: (url, msg) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(msg)}`,
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    color: '#000000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    getUrl: (url, msg) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.403a4.92 4.92 0 011.724 1.117 4.92 4.92 0 011.117 1.725c.164.46.347 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.403 2.43a4.92 4.92 0 01-1.117 1.724 4.92 4.92 0 01-1.724 1.117c-.46.164-1.26.347-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.403a4.902 4.902 0 01-1.724-1.117 4.902 4.902 0 01-1.117-1.724c-.164-.46-.347-1.26-.403-2.43C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.056-1.17.24-1.97.403-2.43a4.902 4.902 0 011.117-1.724 4.902 4.902 0 011.724-1.117c.46-.164 1.26-.347 2.43-.403C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.737 0 8.332.012 7.052.07 5.78.127 4.73.343 3.915.655 3.09.968 2.388 1.435 1.675 2.148.962 2.86.496 3.563.183 4.388c-.312.815-.528 1.865-.585 3.137C-.012 8.332 0 8.737 0 12s.012 3.668.07 4.948c.057 1.272.273 2.322.585 3.137.313.825.779 1.527 1.492 2.24.713.713 1.415 1.179 2.24 1.492.815.312 1.865.528 3.137.585 1.28.058 1.685.07 4.948.07s3.668-.012 4.948-.07c1.272-.057 2.322-.273 3.137-.585.825-.313 1.527-.779 2.24-1.492.713-.713 1.179-1.415 1.492-2.24.312-.815.528-1.865.585-3.137.058-1.28.07-1.685.07-4.948s-.012-3.668-.07-4.948c-.057-1.272-.273-2.322-.585-3.137-.313-.825-.779-1.527-1.492-2.24C20.322.496 19.62.03 18.805-.283 17.99-.596 16.94-.812 15.668-.87 14.388-.928 13.983-.94 10.72-.94 7.457-.94 7.052-.928 5.772-.87 4.5-.812 3.45-.596 2.635-.283 1.82.03 1.118.496.405 1.209-.308 1.922-.62 2.737c-.312.815-.528 1.865-.585 3.137C-.012 8.332 0 8.737 0 12c0 3.263.012 3.668.07 4.948.057 1.272.273 2.322.585 3.137.313.825.779 1.527 1.492 2.24.713.713 1.415 1.179 2.24 1.492.815.312 1.865.528 3.137.585C8.332 23.988 8.737 24 12 24s3.668-.012 4.948-.07c1.272-.057 2.322-.273 3.137-.585.825-.313 1.527-.779 2.24-1.492.713-.713 1.179-1.415 1.492-2.24.312-.815.528-1.865.585-3.137.058-1.28.07-1.685.07-4.948s-.012-3.668-.07-4.948c-.057-1.272-.273-2.322-.585-3.137-.313-.825-.779-1.527-1.492-2.24C20.322.496 19.62.03 18.805-.283 17.99-.596 16.94-.812 15.668-.87 14.388-.928 13.983-.94 10.72-.94c-3.263 0-3.668.012-4.948.07C4.5-.812 3.45-.596 2.635-.283.82.03 1.118.496 1.118.496z"/>
        <path d="M12 5.838A6.163 6.163 0 005.838 12 6.163 6.163 0 0012 18.162 6.163 6.163 0 0018.162 12 6.163 6.163 0 0012 5.838zm0 10.163A4 4 0 118 12a4 4 0 014 4zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
      </svg>
    ),
    getUrl: (url) => `https://www.instagram.com/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    getUrl: () => `https://web.whatsapp.com/`,
  },
];

function ShareModal({ flight, onClose }) {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [customMessage, setCustomMessage] = useState(
    `¡Mirá este destino increíble: ${flight?.destination}! 🌍✈️`
  );

  const productUrl = `${window.location.origin}/detail/${flight?.id}`;

  const handleShare = () => {
    if (!selectedNetwork) return;
    const network = SOCIAL_NETWORKS.find(n => n.id === selectedNetwork);
    if (!network) return;
    const shareUrl = network.getUrl(productUrl, customMessage);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const previewImage = flight?.images?.[0] || null;

  return (
    <div className="share-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Compartir producto">
      <div className="share-modal-content">

        <header className="share-modal-header">
          <h2 className="share-modal-title">Compartir Destino</h2>
          <button className="share-modal-close" onClick={onClose} aria-label="Cerrar modal">✕</button>
        </header>

        <div className="share-product-preview">
          {previewImage ? (
            <img
              src={previewImage}
              alt={flight?.destination}
              className="share-preview-image"
            />
          ) : (
            <div className="share-preview-image share-preview-placeholder">
              <span>✈️</span>
            </div>
          )}
          <div className="share-preview-info">
            <p className="share-preview-destination">{flight?.destination}</p>
            <p className="share-preview-description">
              {flight?.description?.length > 90
                ? flight.description.substring(0, 90) + '...'
                : flight?.description}
            </p>
            
            <a
              href={productUrl}
              className="share-preview-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {productUrl}
            </a>
          </div>
        </div>

        <div className="share-networks-section">
          <p className="share-section-label">Elegí una red social:</p>
          <div className="share-networks-grid">
            {SOCIAL_NETWORKS.map((network) => (
              <button
                key={network.id}
                className={`share-network-btn ${selectedNetwork === network.id ? 'share-network-btn--active' : ''}`}
                style={{ '--network-color': network.color }}
                onClick={() => setSelectedNetwork(network.id)}
                aria-pressed={selectedNetwork === network.id}
              >
                <span className="share-network-icon">{network.icon}</span>
                <span className="share-network-label">{network.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="share-message-section">
          <label htmlFor="share-custom-msg" className="share-section-label">
            Personalizá tu mensaje:
          </label>
          <textarea
            id="share-custom-msg"
            className="share-custom-textarea"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Escribí un mensaje para acompañar el contenido..."
          />
          <span className="share-char-counter">{customMessage.length}/280</span>
        </div>

        <footer className="share-modal-footer">
          <button className="share-cancel-btn" onClick={onClose}>Cancelar</button>
          <button
            className={`share-confirm-btn ${!selectedNetwork ? 'share-confirm-btn--disabled' : ''}`}
            onClick={handleShare}
            disabled={!selectedNetwork}
          >
            Compartir ahora ➔
          </button>
        </footer>

      </div>
    </div>
  );
}

export default ShareModal;