import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { deleteLostAndFound } from "../api";

const ViewLostItem = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, lost, found
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('http://localhost:5000/lostandfound');
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteLostAndFound(itemId);
      setItems(items.filter(item => item._id !== itemId));
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        color: '#333', 
        marginBottom: '10px',
        fontSize: '32px'
      }}>
        Lost and Found Items
      </h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Browse items that have been reported as lost or found in the community
      </p>

      {/* Search Bar */}
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search items by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.3s',
            backgroundColor: '#fafafa',
            color:"black",
            width:"400px"
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b5998'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        marginBottom: '30px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'all' ? '#3b5998' : '#f0f0f0',
            color: filter === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width:"120px"
          }}
        >
          All Items ({items.length})
        </button>
        <button
          onClick={() => setFilter('lost')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'lost' ? '#f44336' : '#ffebee',
            color: filter === 'lost' ? 'white' : '#c62828',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width:"120px"
          }}
        >
          Lost Items ({items.filter(i => i.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilter('found')}
          style={{
            padding: '10px 20px',
            backgroundColor: filter === 'found' ? '#4CAF50' : '#e8f5e9',
            color: filter === 'found' ? 'white' : '#2e7d32',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width:"120px"
          }}
        >
          Found Items ({items.filter(i => i.type === 'found').length})
        </button>
        <button
          onClick={fetchItems}
          style={{
            padding: '10px 20px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginLeft: 'auto',
            transition: 'background-color 0.3s',
            width:"120px"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          color: '#999',
          fontSize: '18px'
        }}>
          <div style={{ marginBottom: '10px' }}>⏳</div>
          Loading items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <h3 style={{ marginBottom: '10px', color: '#666' }}>No items found</h3>
          <p>
            {searchTerm
              ? `No items match your search "${searchTerm}".`
              : filter === 'all'
                ? 'No items have been posted yet.'
                : `No ${filter} items at the moment.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px'
          }}>
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                style={{ 
                  border: '1px solid #e0e0e0',
                  borderLeft: `6px solid ${item.type === 'lost' ? '#f44336' : '#4CAF50'}`,
                  padding: '25px',
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                {/* Poster Profile Header */}
                {(item.posterImage || item.posterName) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    {item.posterImage && (
                      <img
                        src={`data:image/jpeg;base64,${item.posterImage}`}
                        alt="Poster Profile"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #ddd',
                          marginRight: '10px'
                        }}
                      />
                    )}
                    {item.posterName && (
                      <div>
                        <p style={{
                          margin: 0,
                          color: '#1565c0',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          👤 Posted by: {item.posterName}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: item.type === 'lost' ? '#ffebee' : '#e8f5e9',
                  color: item.type === 'lost' ? '#c62828' : '#2e7d32',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {item.type === 'lost' ? '🔍 Lost' : '✨ Found'}
                </div>

                {/* Photo */}
                {item.image && (
                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                    <img
                      src={`data:image/jpeg;base64,${item.image}`}
                      alt={item.title}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}

                {/* Title */}
                <h3 style={{ 
                  margin: '0 0 12px 0',
                  color: '#222',
                  fontSize: '22px',
                  fontWeight: '700',
                  lineHeight: '1.3'
                }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p style={{ 
                  color: '#555',
                  lineHeight: '1.7',
                  marginBottom: '20px',
                  fontSize: '15px',
                  minHeight: '60px'
                }}>
                  {item.description}
                </p>

                {/* Footer Section */}
                <div style={{
                  paddingTop: '20px',
                  borderTop: '1px solid #f0f0f0'
                }}>


                  {/* Contact Info */}
                  <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#444',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      📞 Contact: <span style={{ fontWeight: '500', color: '#666' }}>{item.name} - {item.contact}</span>
                    </p>
                  </div>

                  {/* Timestamp */}
                  {item.createdAt && (
                    <p style={{
                      margin: 0,
                      color: '#999',
                      fontSize: '13px',
                      fontStyle: 'italic'
                    }}>
                      🕒 Posted: {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}

                  {/* Delete Button for Admins */}
                  {user && user.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      🗑️ Delete Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Items Count */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            Showing {filteredItems.length} of {items.length} items
          </div>
        </>
      )}
    </div>
  );
};

export default ViewLostItem;
