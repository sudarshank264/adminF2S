import React, { useState, useEffect } from 'react';

const BlogsManager = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
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
    const url = editingId ? `${API_URL}/api/blogs/${editingId}` : `${API_URL}/api/blogs`;

    // Map formData to Backend Schema
    const payload = {
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000),
      tag: formData.category,
      excerpt: formData.summary,
      bannerImg: formData.imageUrl,
      thumb: formData.imageUrl || '📰',
      content: [{ type: 'p', text: formData.content }]
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData({ title: '', category: '', summary: '', content: '', imageUrl: '' });
        setEditingId(null);
        setIsFormVisible(false);
        fetchBlogs(); // Refresh list
      } else {
        alert('Failed to save blog');
      }
    } catch (err) {
      console.error('Error saving blog:', err);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title || '',
      category: blog.tag || '',
      summary: blog.excerpt || '',
      content: Array.isArray(blog.content) && blog.content.length > 0 ? blog.content[0].text : '',
      imageUrl: blog.bannerImg || (blog.thumb !== '📰' ? blog.thumb : '')
    });
    setEditingId(blog._id || blog.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBlogs(blogs.filter(b => (b._id || b.id) !== id));
      } else {
        alert('Failed to delete blog');
      }
    } catch (err) {
      console.error('Error deleting blog:', err);
    }
  };

  return (
    <div className="cms-manager">
      <div className="cms-header">
        <h3>Manage Blogs</h3>
        {!isFormVisible && (
          <button className="ad-btn primary" onClick={() => setIsFormVisible(true)}>
            + Add New Blog
          </button>
        )}
      </div>

      {isFormVisible ? (
        <form className="cms-form" onSubmit={handleSubmit}>
          <h4>{editingId ? 'Edit Blog' : 'Create New Blog'}</h4>
          
          <div className="cms-form-group">
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </div>

          <div className="cms-form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} required />
          </div>

          <div className="cms-form-group">
            <label>Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
          </div>

          <div className="cms-form-group">
            <label>Short Content (Appears on blog card)</label>
            <textarea name="summary" value={formData.summary} onChange={handleInputChange} rows="3" required />
          </div>

          <div className="cms-form-group">
            <label>Main Content (Appears on individual blog page)</label>
            <textarea name="content" value={formData.content} onChange={handleInputChange} rows="10" required />
          </div>

          <div className="cms-form-actions">
            <button type="submit" className="ad-btn primary">Save Published Blog</button>
            <button type="button" className="ad-btn secondary" onClick={() => { setIsFormVisible(false); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="ad-table-wrapper">
          {loading ? (
            <div className="ad-loader">Loading blogs...</div>
          ) : (
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog._id || blog.id}>
                    <td style={{ fontWeight: 600 }}>{blog.title}</td>
                    <td><span className="ad-tag">{blog.tag || 'General'}</span></td>
                    <td>{new Date(blog.createdAt || blog.date || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <div className="cms-action-btns">
                        <button onClick={() => handleEdit(blog)} className="action-btn edit-btn">Edit</button>
                        <button onClick={() => handleDelete(blog._id || blog.id)} className="action-btn delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {blogs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No blogs found.</td>
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

export default BlogsManager;
