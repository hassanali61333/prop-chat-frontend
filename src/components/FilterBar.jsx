/** Price / location / bedrooms filters. Fully controlled by the parent page. */
export default function FilterBar({ filters, onChange, onReset }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <div className="lg:col-span-2">
        <label className="label" htmlFor="f-location">
          Location
        </label>
        <input
          id="f-location"
          className="input"
          placeholder="City or neighbourhood"
          value={filters.location}
          onChange={set('location')}
        />
      </div>
      <div>
        <label className="label" htmlFor="f-min">
          Min price
        </label>
        <input
          id="f-min"
          type="number"
          min="0"
          className="input"
          placeholder="0"
          value={filters.minPrice}
          onChange={set('minPrice')}
        />
      </div>
      <div>
        <label className="label" htmlFor="f-max">
          Max price
        </label>
        <input
          id="f-max"
          type="number"
          min="0"
          className="input"
          placeholder="Any"
          value={filters.maxPrice}
          onChange={set('maxPrice')}
        />
      </div>
      <div>
        <label className="label" htmlFor="f-beds">
          Bedrooms
        </label>
        <select id="f-beds" className="input" value={filters.bedrooms} onChange={set('bedrooms')}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>
      <button type="button" onClick={onReset} className="btn-secondary">
        Reset
      </button>
    </div>
  );
}
