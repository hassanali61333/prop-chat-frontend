import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage, fileUrl } from '../services/api';
import { formatPrice } from '../utils/format';
import PropertyForm from '../components/PropertyForm';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/properties/mine');
      setProperties(data.properties);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load your listings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const backToList = () => {
    setMode('list');
    setEditing(null);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (mode === 'edit') {
        await api.put(`/properties/${editing._id}`, formData);
        toast.success('Listing updated');
      } else {
        await api.post('/properties', formData);
        toast.success('Listing published');
      }
      await load();
      backToList();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save listing'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? Its conversations will be removed too.`)) return;
    setDeletingId(p._id);
    try {
      await api.delete(`/properties/${p._id}`);
      setProperties((prev) => prev.filter((x) => x._id !== p._id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete listing'));
    } finally {
      setDeletingId(null);
    }
  };

  if (mode !== 'list') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <PropertyForm
          initial={mode === 'edit' ? editing : null}
          onSubmit={handleSubmit}
          onCancel={backToList}
          submitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">My listings</h1>
          <p className="mt-1 text-sm text-neutral-500">Create, edit and remove your properties.</p>
        </div>
        <button onClick={() => setMode('create')} className="btn-primary">
          + New listing
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-surface py-16 text-center">
            <p className="text-lg font-semibold text-ink">No listings yet</p>
            <p className="mt-1 text-sm text-neutral-500">Publish your first property to start receiving messages.</p>
            <button onClick={() => setMode('create')} className="btn-primary mt-5">
              Create listing
            </button>
          </div>
        ) : (
          properties.map((p) => (
            <div key={p._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Link to={`/properties/${p._id}`} className="block h-40 w-full shrink-0 overflow-hidden rounded-xl bg-surface sm:h-24 sm:w-36">
                {p.images?.[0] ? (
                  <img src={fileUrl(p.images[0])} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-neutral-400">No photo</span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link to={`/properties/${p._id}`} className="block truncate text-base font-semibold text-ink hover:underline">
                  {p.title}
                </Link>
                <p className="truncate text-sm text-neutral-500">{p.location}</p>
                <p className="mt-1 text-sm text-ink">
                  <strong>{formatPrice(p.price)}</strong> · {p.bedrooms} bd · {p.bathrooms} ba · {p.area.toLocaleString()} sqft
                </p>
              </div>

              <div className="flex gap-2 sm:flex-col md:flex-row">
                <button
                  onClick={() => {
                    setEditing(p);
                    setMode('edit');
                  }}
                  className="btn-secondary flex-1 !py-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p._id}
                  className="btn-secondary flex-1 !py-2"
                >
                  {deletingId === p._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
