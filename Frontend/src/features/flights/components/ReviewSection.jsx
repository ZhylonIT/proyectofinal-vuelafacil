import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { resenaService } from '../../../services/resenaService';
import '../../../styles/ReviewSection.css'

function ReviewSection({ productId, destination }) {
  const { isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const cargarResenas = useCallback(() => {
    setLoading(true);
    resenaService.listarPorVuelo(productId)
      .then(data => {
        setReviews(data.resenas || []);
        setAverage((data.promedio || 0).toFixed(1));
        setTotal(data.cantidad || 0);
      })
      .catch(() => {
        setReviews([]);
        setAverage(0);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    // cargarResenas es async y solo actualiza estado luego del await; se reutiliza también al publicar una reseña.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarResenas();
  }, [cargarResenas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      setSubmitError('Seleccioná una puntuación con estrellas.');
      return;
    }
    if (!userComment.trim()) {
      setSubmitError('Escribí un comentario para publicar tu valoración.');
      return;
    }
    if (!isAuthenticated) {
      setSubmitError('Debés iniciar sesión para dejar una valoración.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await resenaService.crear(productId, { rating: userRating, comentario: userComment.trim() });
      setUserRating(0);
      setUserComment('');
      cargarResenas();
    } catch (error) {
      setSubmitError(error.message || 'No pudimos publicar tu valoración. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const filled = starValue <= rating;
      return (
        <span
          key={i}
          className={`review-star ${filled ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
          onClick={interactive ? () => setUserRating(starValue) : undefined}
          role={interactive ? 'button' : 'img'}
          aria-label={interactive ? `${starValue} estrella(s)` : undefined}
          title={interactive ? `${starValue} estrella(s)` : undefined}
        >
          ★
        </span>
      );
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section className="review-section" aria-labelledby="review-heading">
      <h2 id="review-heading" className="review-section-title">Valoraciones de {destination}</h2>

      <div className="review-summary">
        <div className="review-average">
          <span className="review-average-number">{average}</span>
          <div className="review-average-stars">{renderStars(Math.round(Number(average)))}</div>
          <span className="review-total">{total} valoraciones</span>
        </div>
      </div>

      {isAuthenticated ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3 className="review-form-title">Dejá tu opinión</h3>
          <div className="review-form-stars">
            <span className="review-form-label">Tu puntuación:</span>
            <div className="star-selector">{renderStars(userRating, true)}</div>
          </div>
          <textarea
            className="review-comment-input"
            placeholder="Compartí tu experiencia..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          {submitError && <p className="review-error-msg" role="alert">{submitError}</p>}
          <button type="submit" className="review-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar valoración'}
          </button>
        </form>
      ) : (
        <p className="review-login-prompt">
          <a href="/login" className="review-login-link">Iniciá sesión</a> para dejar tu valoración.
        </p>
      )}

      <div className="review-list">
        {loading ? (
          <p className="review-empty">Cargando valoraciones...</p>
        ) : reviews.length === 0 ? (
          <p className="review-empty">Este destino aún no tiene valoraciones. ¡Sé el primero en opinar!</p>
        ) : (
          reviews.map((rev) => (
            <article key={rev.id} className="review-card">
              <div className="review-card-header">
                <span className="review-user-name">{rev.nombreUsuario}</span>
                <span className="review-date">{formatDate(rev.fecha)}</span>
              </div>
              <div className="review-card-stars">{renderStars(rev.rating)}</div>
              {rev.comentario && <p className="review-card-comment">{rev.comentario}</p>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
