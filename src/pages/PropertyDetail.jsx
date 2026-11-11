import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import ImageGallery from '../components/ImageGallery';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { useSocket } from '../context/SocketContext';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isOnline } = useSocket();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        if (!cancelled) setProperty(data.property);
      } catch (err) {
        if (!cancelled) toast.error(errorMessage(err, 'Property not found'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const startChat = async () => {
    if (!isAuthenticated) {
      toast('Please log in to chat with the agent');
      return navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
    }
    setStarting(true);
    try {
      const { data } = await api.post('/chat/conversations', { propertyId: id });
      navigate(`/chat/${data.conversation._id}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not start chat'));
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!property) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Property not found</p>
        <Link to="/" className="btn-secondary mt-4">
          Back to browse
        </Link>
      </div>
    );
  }

  const isOwner = user && property.agent?._id === user._id;
  const stats = [
    { label: 'Bedrooms', value: property.bedrooms },
    { label: 'Bathrooms', value: property.bathrooms },
    { label: 'Area', value: `${property.area.toLocaleString()} sqft` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/" className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-ink">
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageGallery images={property.images} alt={property.title} />

          <div className="mt-8">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{property.title}</h1>
            <p className="mt-1 text-neutral-500">{property.location}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-surface p-4 text-center">
                  <p className="text-lg font-bold text-ink">{s.value}</p>
                  <p className="text-xs text-neutral-500">{s.label}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold text-ink">About this property</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-neutral-700">{property.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5 sm:p-6">
            <p className="text-3xl font-bold text-ink">{formatPrice(property.price)}</p>

            <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
              <Avatar name={property.agent?.name} online={isOnline(property.agent?._id)} showDot />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{property.agent?.name}</p>
                <p className="text-xs text-neutral-500">Listing agent</p>
              </div>
            </div>

            <div className="mt-5">
              {isOwner ? (
                <Link to="/dashboard" className="btn-secondary w-full">
                  Manage this listing
                </Link>
              ) : user?.role === 'agent' ? (
                <p className="rounded-xl bg-surface p-3 text-center text-sm text-neutral-500">
                  Only buyers can start a chat.
                </p>
              ) : (
                <button onClick={startChat} disabled={starting} className="btn-primary w-full">
                  {starting ? 'Opening chat…' : 'Chat with Agent'}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
