import { useEffect, useMemo, useState } from 'react';
import { fileUrl } from '../services/api';

const EMPTY = {
  title: '',
  price: '',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  description: '',
};

const MAX_IMAGES = 8;

/**
 * Create / edit listing form.
 * onSubmit receives a FormData (multipart) ready to POST/PUT.
 */
export default function PropertyForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [existing, setExisting] = useState([]); // already-uploaded paths to keep
  const [files, setFiles] = useState([]); // new File objects
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        price: initial.price,
        location: initial.location,
        bedrooms: initial.bedrooms,
        bathrooms: initial.bathrooms,
        area: initial.area,
        description: initial.description,
      });
      setExisting(initial.images || []);
    } else {
      setForm(EMPTY);
      setExisting([]);
    }
    setFiles([]);
    setError('');
  }, [initial]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const room = MAX_IMAGES - existing.length - files.length;
    if (picked.length > room) setError(`You can upload up to ${MAX_IMAGES} photos in total`);
    else setError('');
    setFiles((prev) => [...prev, ...picked.slice(0, Math.max(room, 0))]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key of Object.keys(EMPTY)) {
      if (String(form[key]).trim() === '') return setError('Please fill in every field');
    }
    if (Number(form.price) < 0 || Number(form.area) < 0) return setError('Numbers cannot be negative');
    if (!existing.length && !files.length) return setError('Add at least one photo');

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('existingImages', JSON.stringify(existing));
    files.forEach((f) => data.append('images', f));
    setError('');
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-7">
      <h2 className="text-xl font-bold text-ink">{initial ? 'Edit listing' : 'Create a new listing'}</h2>

      <div>
        <label className="label" htmlFor="p-title">
          Title
        </label>
        <input id="p-title" className="input" maxLength={120} value={form.title} onChange={set('title')} placeholder="Sunny 3-bed family home" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="p-price">
            Price (USD)
          </label>
          <input id="p-price" type="number" min="0" className="input" value={form.price} onChange={set('price')} />
        </div>
        <div>
          <label className="label" htmlFor="p-location">
            Location
          </label>
          <input id="p-location" className="input" value={form.location} onChange={set('location')} placeholder="City, neighbourhood" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="p-beds">
            Bedrooms
          </label>
          <input id="p-beds" type="number" min="0" className="input" value={form.bedrooms} onChange={set('bedrooms')} />
        </div>
        <div>
          <label className="label" htmlFor="p-baths">
            Bathrooms
          </label>
          <input id="p-baths" type="number" min="0" className="input" value={form.bathrooms} onChange={set('bathrooms')} />
        </div>
        <div>
          <label className="label" htmlFor="p-area">
            Area (sqft)
          </label>
          <input id="p-area" type="number" min="0" className="input" value={form.area} onChange={set('area')} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="p-desc">
          Description
        </label>
        <textarea id="p-desc" rows={5} maxLength={4000} className="input resize-y" value={form.description} onChange={set('description')} />
      </div>

      <div>
        <span className="label">Photos (up to {MAX_IMAGES}, 5MB each)</span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {existing.map((img) => (
            <Thumb key={img} src={fileUrl(img)} onRemove={() => setExisting((e) => e.filter((x) => x !== img))} />
          ))}
          {previews.map((src, i) => (
            <Thumb key={src} src={src} onRemove={() => setFiles((f) => f.filter((_, idx) => idx !== i))} />
          ))}
          {existing.length + files.length < MAX_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line text-xs font-medium text-neutral-500 transition hover:border-brand hover:text-brand">
              <span className="text-2xl leading-none">+</span>
              Add photos
              <input type="file" accept="image/*" multiple className="hidden" onChange={addFiles} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-ink">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Publish listing'}
        </button>
      </div>
    </form>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-line">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-sm text-white hover:bg-ink"
      >
        ×
      </button>
    </div>
  );
}
