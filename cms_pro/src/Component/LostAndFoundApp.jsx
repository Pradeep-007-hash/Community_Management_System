import React, { useState } from "react";

const LostAndFoundApp = () => {
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', contact: '', name: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setPhoto(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('contact', form.contact);
      formData.append('name', form.name);
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await fetch('http://localhost:5000/lostandfound', {
        method: 'POST',
        headers: {
          'x-user-id': userId
        },
        body: formData
      });

      if (res.ok) {
        setForm({ type: 'lost', title: '', description: '', contact: '', name: '' });
        setPhoto(null);
        setPhotoPreview(null);
        setSuccess('✅ Item posted successfully! You can view it in "View Lost/Found Items"');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to post item');
      }
    } catch (err) {
      console.error('Error posting item:', err);
      setError('Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        color: '#333', 
        marginBottom: '10px',
        fontSize: '32px'
      }}>
        Post Lost or Found Item
      </h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Help your community by reporting items you've lost or found
      </p>

      {/* Success Message */}
      {success && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #4CAF50'
        }}>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #f44336'
        }}>
          {error}
        </div>
      )}

      {/* Form Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Type Selection */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Item Type: *
            </label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{ 
                flex: 1,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="lost"
                  checked={form.type === 'lost'}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                  style={{ marginRight: '8px' }}
                />
                <span style={{
                  padding: '10px 20px',
                  backgroundColor: form.type === 'lost' ? '#ffebee' : '#f9f9f9',
                  color: form.type === 'lost' ? '#c62828' : '#666',
                  borderRadius: '5px',
                  display: 'inline-block',
                  fontWeight: form.type === 'lost' ? 'bold' : 'normal',
                  border: form.type === 'lost' ? '2px solid #f44336' : '1px solid #ddd'
                }}>
                  🔍 I Lost Something
                </span>
              </label>
              <label style={{ 
                flex: 1,
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="type"
                  value="found"
                  checked={form.type === 'found'}
                  onChange={(e) => setForm({...form, type: e.target.value})}
                  style={{ marginRight: '8px' }}
                />
                <span style={{
                  padding: '10px 20px',
                  backgroundColor: form.type === 'found' ? '#e8f5e9' : '#f9f9f9',
                  color: form.type === 'found' ? '#2e7d32' : '#666',
                  borderRadius: '5px',
                  display: 'inline-block',
                  fontWeight: form.type === 'found' ? 'bold' : 'normal',
                  border: form.type === 'found' ? '2px solid #4CAF50' : '1px solid #ddd'
                }}>
                  ✨ I Found Something
                </span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Item Title: *
            </label>
            <input 
              type="text" 
              placeholder="e.g., Red Wallet, Blue Umbrella, Phone Case" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})} 
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',background:"white",color:"black"
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b5998'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Description: *
            </label>
            <textarea 
              placeholder="Describe the item in detail (color, size, brand, where it was lost/found, etc.)" 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})} 
              required
              rows="5"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '15px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'Arial, sans-serif',
                transition: 'border-color 0.3s',background:"white",color:"black"
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b5998'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Name */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Your Name: *
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',background:"white",color:"black"
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b5998'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Contact Information: *
            </label>
            <input
              type="text"
              placeholder="Phone number or email address"
              value={form.contact}
              onChange={(e) => setForm({...form, contact: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '15px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',background:"white",color:"black"
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b5998'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <small style={{ color: '#666', fontSize: '13px', marginTop: '5px', display: 'block' }}>
              This will be visible to others so they can contact you
            </small>
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333'
            }}>
              Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: 'white',
                color: 'black'
              }}
            />
            <small style={{ color: '#666', fontSize: '13px', marginTop: '5px', display: 'block' }}>
              Upload a photo of the item (JPEG, PNG, GIF - Max 5MB)
            </small>

            {/* Photo Preview */}
            {photoPreview && (
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    objectFit: 'cover'
                  }}
                />
                <br />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#ccc' : '#3b5998',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              boxShadow: '0 4px 10px rgba(59, 89, 152, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2e4475')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b5998')}
          >
            {loading ? '⏳ Posting...' : '📤 Post Item'}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f0f7ff',
        borderRadius: '8px',
        border: '1px solid #bbdefb'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 Tips:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
          <li>Provide as much detail as possible to help identify the item</li>
          <li>Include the location where it was lost or found</li>
          <li>Check "View Lost/Found Items" regularly to see if anyone has found your item</li>
          <li>Update your contact info if it changes</li>
        </ul>
      </div>
    </div>
  );
};

export default LostAndFoundApp;
