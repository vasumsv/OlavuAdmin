import React, { useState, useEffect } from 'react';
import { Search, Star, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  review_title: string | null;
  status: string;
  verified_purchase: boolean;
  created_at: string;
  customer: { name: string } | null;
  book: { title_en: string } | null;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, review_text, review_title, status, verified_purchase, created_at, customer:customers(name), book:books(title_en)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as unknown as Review[]) || []);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(reviewId);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reviewId);

      if (error) throw error;
      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
      );
    } catch {
      // Error handled
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      (review.book?.title_en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.review_text || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || review.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-gray-600 mt-1">Approve or reject customer reviews before they appear publicly</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? status === 'pending'
                  ? 'bg-amber-500 text-white'
                  : status === 'approved'
                  ? 'bg-green-600 text-white'
                  : status === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white bg-opacity-20">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by book, customer, or review text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Book & Customer */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {review.book?.title_en || 'Unknown Book'}
                  </h3>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-600">
                    by <span className="font-medium">{review.customer?.name || 'Anonymous'}</span>
                  </span>
                  {review.verified_purchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Rating & Date */}
                <div className="flex items-center gap-3 mb-3">
                  {renderStars(review.rating)}
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Review text */}
                {review.review_title && (
                  <p className="text-sm font-medium text-gray-800 mb-1">{review.review_title}</p>
                )}
                {review.review_text ? (
                  <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No review text provided</p>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3">
                {getStatusBadge(review.status)}

                <div className="flex items-center gap-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateStatus(review.id, 'approved')}
                      disabled={updatingId === review.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                    >
                      {updatingId === review.id ? '...' : 'Approve'}
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateStatus(review.id, 'rejected')}
                      disabled={updatingId === review.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                    >
                      {updatingId === review.id ? '...' : 'Reject'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search' : filterStatus !== 'all' ? `No ${filterStatus} reviews yet` : 'Reviews will appear here when customers submit them'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
