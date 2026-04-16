import React, { useState, useEffect } from 'react';

const ReviewsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    rating: 5,
    content: '',
    videoUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/api/reviews/${editingId}` : `${API_URL}/api/reviews`;

    const submitData = new FormData();
    submitData.append('clientName', formData.clientName);
    submitData.append('rating', formData.rating);
    submitData.append('content', formData.content);
    if (formData.videoUrl) submitData.append('videoUrl', formData.videoUrl);
    if (imageFile) submitData.append('image', imageFile);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });
      if (res.ok) {
        setFormData({ clientName: '', rating: 5, content: '', videoUrl: '' });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setIsFormVisible(false);
        fetchReviews();
      }
    } catch (err) {
      console.error('Error saving review:', err);
    }
  };

  const handleEdit = (review) => {
    setFormData({
      clientName: review.clientName || '',
      rating: review.rating || 5,
      content: review.content || '',
      videoUrl: review.videoUrl || ''
    });
    setEditingId(review._id || review.id);
    setImagePreview(review.image ? `${API_URL}${review.image}` : (review.img && review.img.startsWith('http') ? review.img : `${API_URL}${review.img}`));
    setImageFile(null);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(reviews.filter(r => (r._id || r.id) !== id));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  return (
    <div className="cms-manager">
      <div className="cms-header">
        <h3>Manage Client Reviews & Testimonials</h3>
        {!isFormVisible && (
          <button className="ad-btn primary" onClick={() => setIsFormVisible(true)}>
            + Add New Review
          </button>
        )}
      </div>

      {isFormVisible ? (
        <form className="cms-form" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Edit Review' : 'Add New Review'}</h4>
          
          <div className="cms-form-group">
            <label>Client Name</label>
            <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange} required />
          </div>

          <div className="cms-form-group">
            <label>Rating (1-5)</label>
            <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleInputChange} required />
          </div>

          <div className="cms-form-group">
            <label>Video URL (Optional)</label>
            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="e.g. YouTube link" />
          </div>

          <div className="cms-form-group">
            <label>Review Text</label>
            <textarea name="content" value={formData.content} onChange={handleInputChange} rows="4" required />
          </div>

          <div className="cms-form-group">
            <label>Upload Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} 
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ marginTop: '10px', maxHeight: '80px', borderRadius: '4px', objectFit: 'cover' }} />
            )}
          </div>

          <div className="cms-form-actions">
            <button type="submit" className="ad-btn primary">Save Review</button>
            <button type="button" className="ad-btn secondary" onClick={() => { setIsFormVisible(false); setEditingId(null); setImageFile(null); setImagePreview(null); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="ad-table-wrapper">
          {loading ? (
            <div className="ad-loader">Loading reviews...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Rating</th>
                  <th>Review Preview</th>
                  <th>Media</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review._id || review.id}>
                    <td style={{ fontWeight: 600 }}>{review.clientName}</td>
                    <td>{'⭐'.repeat(review.rating || 5)}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.content}
                    </td>
                    <td>
                      {review.image || review.img ? (
                        <img 
                          src={review.image && !review.image.startsWith('http') ? `${API_URL}${review.image}` : (review.img && !review.img.startsWith('http') ? `${API_URL}${review.img}` : (review.image || review.img))} 
                          alt="Review" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      ) : (
                         review.videoUrl ? '📹 Video' : '📝 Text'
                      )}
                    </td>
                    <td>
                      <div className="cms-action-btns">
                        <button onClick={() => handleEdit(review)} className="action-btn edit-btn">Edit</button>
                        <button onClick={() => handleDelete(review._id || review.id)} className="action-btn delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
