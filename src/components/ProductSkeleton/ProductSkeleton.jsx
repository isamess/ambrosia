
import './ProductSkeleton.css';

const ProductSkeleton = () => {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
        <div className="skeleton-price"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;