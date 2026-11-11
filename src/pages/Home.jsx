import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../services/api';
import FilterBar from '../components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
const EMPTY_FILTERS = { location: '', minPrice: '', maxPrice: '', bedrooms: '' };

export default function Home() {
  
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Any filter change returns to page 1
  useEffect(() => setPage(1), [filters]);

  // Debounced fetch
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== '') params[k] = v;
        });
        const { data } = await api.get('/properties', { params });
        if (cancelled) return;
        setProperties(data.properties);
        setPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err, 'Could not load properties'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Find your next home.</h1>
        <p className="mt-3 text-base text-neutral-500">
          Browse listings and message the agent directly. No forms, no waiting.
        </p>
      </section>

      <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-surface py-20 text-center">
            <p className="text-lg font-semibold text-ink">No properties found</p>
            <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {total} {total === 1 ? 'property' : 'properties'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span className="text-sm text-neutral-500">
                  Page {page} of {pages}
                </span>
                <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
