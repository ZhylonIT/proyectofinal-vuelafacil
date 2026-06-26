import { useState, useMemo, useCallback } from 'react';
import '../../../styles/ReviewSection.css'

function ReviewSection({ productId, destination }) {
  const [auth] = useState(() => ({
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    user: JSON.parse(localStorage.getItem('currentUser') || 'null')
  }));

  const [reviews, setReviews] = useState(() => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('vuelafacil_reviews') || '{}');
      return allReviews[productId] || [];
    } catch {
      return [];
    }
  });

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { average, total } = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (sum / reviews.length).toFixed(1),
      total: reviews.length
    };
  }, [reviews]);

  const persistReviews = useCallback((newReviews) => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('vuelafacil_reviews') || '{}');
      allReviews[productId] = newReviews;
      localStorage.setItem('vuelafacil_reviews', JSON.stringify(allReviews));
    } catch (e) {
      console.warn('Error al guardar reseñas en localStorage', e);
    }
  }, [productId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userRating === 0) {
      setSubmitError('Seleccioná una puntuación con estrellas.');
      return;
    }
    if (!auth.isLoggedIn || !auth.user) {
      setSubmitError('Debés iniciar sesión para dejar una valoración.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: auth.user.id,
      userName: `${auth.user.firstName} ${auth.user.lastName}`.trim(),
      rating: userRating,
      comment: userComment.trim(),
      date: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    persistReviews(updatedReviews);
    setUserRating(0);
    setUserComment('');
    setIsSubmitting(false);
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

      {/* Resumen de puntuación media */}
      <div className="review-summary">
        <div className="review-average">
          <span className="review-average-number">{average}</span>
          <div className="review-average-stars">{renderStars(Math.round(Number(average)))}</div>
          <span className="review-total">{total} valoraciones</span>
        </div>
      </div>

      {/* Formulario de puntuación */}
      {auth.isLoggedIn ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3 className="review-form-title">Dejá tu opinión</h3>
          <div className="review-form-stars">
            <span className="review-form-label">Tu puntuación:</span>
            <div className="star-selector">{renderStars(userRating, true)}</div>
          </div>
          <textarea
            className="review-comment-input"
            placeholder="Compartí tu experiencia (opcional)..."
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

      {/* Listado de reseñas */}
      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="review-empty">Este destino aún no tiene valoraciones. ¡Sé el primero en opinar!</p>
        ) : (
          reviews.map((rev) => (
            <article key={rev.id} className="review-card">
              <div className="review-card-header">
                <span className="review-user-name">{rev.userName}</span>
                <span className="review-date">{formatDate(rev.date)}</span>
              </div>
              <div className="review-card-stars">{renderStars(rev.rating)}</div>
              {rev.comment && <p className="review-card-comment">{rev.comment}</p>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;