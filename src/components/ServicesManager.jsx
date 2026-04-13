import React, { useState, useEffect } from 'react';

const ServicesManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconUrl: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
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
    const url = editingId ? `${API_URL}/api/services/${editingId}` : `${API_URL}/api/services`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ title: '', description: '', iconUrl: '' });
        setEditingId(null);
        setIsFormVisible(false);
        fetchServices();
      } else {
        alert('Failed to save service');
      }
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      title: service.title || '',
      description: service.description || '',
      iconUrl: service.iconUrl || ''
    });
    setEditingId(service._id || service.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setServices(services.filter(s => (s._id || s.id) !== id));
      }
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  return (
    <div className="cms-manager">
      <div className="cms-header">
        <h3>Manage Services</h3>
        {!isFormVisible && (
          <button className="ad-btn primary" onClick={() => setIsFormVisible(true)}>
            + Add New Service
          </button>
        )}
      </div>

      {isFormVisible ? (
        <form className="cms-form" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Edit Service' : 'Add New Service'}</h4>
          
          <div className="cms-form-group">
            <label>Service Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>

          <div className="cms-form-group">
            <label>Icon URL / Image URL</label>
            <input type="url" name="iconUrl" value={formData.iconUrl} onChange={handleInputChange} placeholder="https://..." />
          </div>

          <div className="cms-form-group">
            <label>Service Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required />
          </div>

          <div className="cms-form-actions">
            <button type="submit" className="ad-btn primary">Save Service</button>
            <button type="button" className="ad-btn secondary" onClick={() => { setIsFormVisible(false); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="ad-table-wrapper">
          {loading ? (
            <div className="ad-loader">Loading services...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Service Title</th>
                  <th>Description Preview</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id || service.id}>
                    <td style={{ fontWeight: 600 }}>{service.title}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {service.description}
                    </td>
                    <td>
                      <div className="cms-action-btns">
                        <button onClick={() => handleEdit(service)} className="action-btn edit-btn">Edit</button>
                        <button onClick={() => handleDelete(service._id || service.id)} className="action-btn delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No services found.</td>
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

export default ServicesManager;
