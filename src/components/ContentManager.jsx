import React, { useState, useEffect } from 'react';

const ContentManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutUsText: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Assume a generic /api/content endpoint or a single document returning global settings
      const res = await fetch(`${API_URL}/api/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Just grab the first settings doc if it returns an array
        const settings = Array.isArray(data) ? data[0] : data;
        if (settings) {
          setContent({ ...content, ...settings });
        }
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/content`, {
        method: 'POST', // or PUT depending on backend
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        alert('Website content successfully updated!');
      } else {
        alert('Failed to update content');
      }
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="ad-loader">Loading content settings...</div>;
  }

  return (
    <div className="cms-manager">
      <div className="cms-header">
        <h3>Website Content Configuration</h3>
        <p style={{ color: 'var(--grey)' }}>Update global text used across the main website</p>
      </div>

      <form className="cms-form" onSubmit={handleSave}>
        <h4>Homepage Settings</h4>
        
        <div className="cms-form-group">
          <label>Hero Title</label>
          <input type="text" name="heroTitle" value={content.heroTitle || ''} onChange={handleInputChange} placeholder="e.g. Find Your Dream Destination" />
        </div>

        <div className="cms-form-group">
          <label>Hero Subtitle</label>
          <input type="text" name="heroSubtitle" value={content.heroSubtitle || ''} onChange={handleInputChange} placeholder="e.g. We provide top-notch visa support..." />
        </div>

        <div className="cms-form-group">
          <label>About Us Section Text</label>
          <textarea name="aboutUsText" value={content.aboutUsText || ''} onChange={handleInputChange} rows="5" />
        </div>

        <hr style={{ margin: '30px 0', borderColor: '#e2e8f0' }} />
        <h4>Contact Information</h4>

        <div className="cms-form-group">
          <label>Public Contact Email</label>
          <input type="email" name="contactEmail" value={content.contactEmail || ''} onChange={handleInputChange} />
        </div>

        <div className="cms-form-group">
          <label>Public Contact Phone</label>
          <input type="text" name="contactPhone" value={content.contactPhone || ''} onChange={handleInputChange} />
        </div>

        <div className="cms-form-group">
          <label>Office Address</label>
          <input type="text" name="address" value={content.address || ''} onChange={handleInputChange} />
        </div>

        <div className="cms-form-actions">
          <button type="submit" className="ad-btn primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Global Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentManager;
