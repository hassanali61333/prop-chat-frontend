import { Link } from 'react-router-dom';
import { fileUrl } from '../services/api';
import { formatPrice } from '../utils/format';

export default function PropertyCard({ property }) {
  const cover = property.images?.[0];

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {cover ? (
          <img
            src={fileUrl(cover)}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            No photo
          </div>
        )}
        {property.images?.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-medium text-white">
            {property.images.length} photos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xl font-bold text-ink">{formatPrice(property.price)}</p>
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-ink">{property.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{property.location}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-sm text-ink">
          <span>
            <strong>{property.bedrooms}</strong> bd
          </span>
          <span>
            <strong>{property.bathrooms}</strong> ba
          </span>
          <span>
            <strong>{property.area.toLocaleString()}</strong> sqft
          </span>
        </div>
      </div>
    </Link>
  );
}
