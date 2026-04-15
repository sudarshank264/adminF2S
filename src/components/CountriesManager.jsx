import React, { useState, useEffect } from 'react';

const CountriesManager = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // State for form
  const [form, setForm] = useState({
    name: '',
    code: '',
    slug: '',
    title: '',
    shortPoints: [''],
    fullDescription: '',
    sections: [{ heading: '', content: '' }],
    displayOrder: 0,
    isActive: true
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/countries`);
      if (res.ok) {
        const data = await res.json();
        setCountries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for dynamic array fields
  const handleShortPointChange = (index, value) => {
    const newPoints = [...form.shortPoints];
    newPoints[index] = value;
    setForm({ ...form, shortPoints: newPoints });
  };

  const addShortPoint = () => setForm({ ...form, shortPoints: [...form.shortPoints, ''] });
  const removeShortPoint = (index) => setForm({ ...form, shortPoints: form.shortPoints.filter((_, i) => i !== index) });

  const handleSectionChange = (index, field, value) => {
    const newSections = [...form.sections];
    newSections[index][field] = value;
    setForm({ ...form, sections: newSections });
  };

  const addSection = () => setForm({ ...form, sections: [...form.sections, { heading: '', content: '' }] });
  const removeSection = (index) => setForm({ ...form, sections: form.sections.filter((_, i) => i !== index) });

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      slug: '',
      title: '',
      shortPoints: [''],
      fullDescription: '',
      sections: [{ heading: '', content: '' }],
      displayOrder: 0,
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (country) => {
    setForm({
      name: country.name,
      code: country.code,
      slug: country.slug,
      title: country.title,
      shortPoints: country.shortPoints.length > 0 ? country.shortPoints : [''],
      fullDescription: country.fullDescription || '',
      sections: country.sections.length > 0 ? country.sections : [{ heading: '', content: '' }],
      displayOrder: country.displayOrder,
      isActive: country.isActive
    });
    setEditingId(country._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this country?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/countries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCountries();
      } else {
        alert('Failed to delete country');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');

    // Clean arrays before submit
    const cleanPayload = {
      ...form,
      slug: form.slug.toLowerCase().replace(/[\s\W-]+/g, '-'),
      shortPoints: form.shortPoints.filter(p => p.trim() !== ''),
      sections: form.sections.filter(s => s.heading.trim() !== '' && s.content.trim() !== '')
    };

    try {
      const url = editingId
        ? `${API_URL}/api/countries/${editingId}`
        : `${API_URL}/api/countries`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanPayload)
      });

      if (res.ok) {
        resetForm();
        fetchCountries();
      } else {
        const errorData = await res.json();
        alert('Failed to save country: ' + (errorData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-cms-panel" style={{ color: 'var(--black)' }}>
      <style>{`
        .cms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .cms-form-card { background: var(--white); padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .cms-input { width: 100%; padding: 10px; margin-top: 6px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 4px; font-family: var(--ff-body); }
        .cms-btn { background: var(--red); color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; transition: 0.3s; }
        .cms-btn:hover { background: var(--red-dark); }
        .cms-btn-outline { background: transparent; color: var(--red); border: 1px solid var(--red); padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
        .cms-list { background: var(--white); padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .country-item { padding: 16px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
        .country-actions button { margin-left: 8px; cursor: pointer; border: none; background: #eee; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; }
        .country-actions button:hover { background: #ddd; }
        .country-actions .btn-danger { background: #ffebee; color: var(--red); }
        .country-actions .btn-danger:hover { background: #ffcdd2; }
        @media (max-width: 900px) {
          .cms-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cms-grid">
        <div className="cms-form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{editingId ? 'Edit Country Guide' : 'Add New Country Guide'}</h3>
            {editingId && <button className="cms-btn-outline" onClick={resetForm}>Cancel Edit</button>}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label><strong>Name *</strong></label>
                <input className="cms-input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sweden" required />
              </div>
              <div>
                <label><strong>Code/Flag *</strong></label>
                <input className="cms-input" type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. SE or 🇸🇪" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label><strong>Slug (URL) *</strong></label>
                <input className="cms-input" type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="sweden" required />
              </div>
              <div>
                <label><strong>Title *</strong></label>
                <input className="cms-input" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sweden Visa Guide" required />
              </div>
            </div>

            <label><strong>Full Description (DetailPage)</strong></label>
            <textarea className="cms-input" rows="3" value={form.fullDescription} onChange={e => setForm({ ...form, fullDescription: e.target.value })} placeholder="Detailed overview..." />

            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                <strong>Is Active (Show globally)</strong>
              </label>
            </div>

            {/* Short Points */}
            <div style={{ margin: '20px 0', borderTop: '2px dashed #eee', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4>Card Features (Short Points)</h4>
                <button type="button" className="cms-btn-outline" onClick={addShortPoint}>+ Add Point</button>
              </div>
              {form.shortPoints.map((pt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                  <input className="cms-input" type="text" value={pt} onChange={e => handleShortPointChange(idx, e.target.value)} placeholder="e.g. How to apply" />
                  {form.shortPoints.length > 1 && (
                    <button type="button" className="cms-btn-outline" style={{ marginTop: '6px', marginBottom: '12px', border: 'none', background: '#ffebee', padding: '0 12px' }} onClick={() => removeShortPoint(idx)}>X</button>
                  )}
                </div>
              ))}
            </div>

            {/* Sections */}
            <div style={{ margin: '20px 0', borderTop: '2px dashed #eee', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4>Detailed Sections</h4>
                <button type="button" className="cms-btn-outline" onClick={addSection}>+ Add Section</button>
              </div>
              {form.sections.map((sec, idx) => (
                <div key={idx} style={{ background: '#fafafa', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
                  {form.sections.length > 1 && (
                    <button type="button" onClick={() => removeSection(idx)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>Remove</button>
                  )}
                  <label><strong>Heading *</strong></label>
                  <input className="cms-input" type="text" value={sec.heading} onChange={e => handleSectionChange(idx, 'heading', e.target.value)} placeholder="e.g. Required Documents" required={idx === 0} />

                  <label><strong>Content *</strong></label>
                  <textarea className="cms-input" rows="4" value={sec.content} onChange={e => handleSectionChange(idx, 'content', e.target.value)} placeholder="Explain the section in detail..." required={idx === 0} />
                </div>
              ))}
            </div>

            <button type="submit" className="cms-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Country' : 'Save New Country')}
            </button>
          </form>
        </div>

        <div className="cms-list">
          <h3 style={{ marginBottom: '20px' }}>Managed Countries ({countries.length})</h3>
          {loading ? <p>Loading data...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {countries.map(country => (
                <div key={country._id} className="country-item">
                  <div>
                    <strong style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {country.code} {country.name}
                      {!country.isActive && <span style={{ fontSize: '0.6rem', background: '#ffebee', color: 'red', padding: '2px 6px', borderRadius: '4px' }}>Inactive</span>}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--grey)' }}>/{country.slug}</div>
                  </div>
                  <div className="country-actions">
                    <button onClick={() => handleEdit(country)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(country._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {countries.length === 0 && <p style={{ color: 'var(--grey)' }}>No country guides created yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountriesManager;
