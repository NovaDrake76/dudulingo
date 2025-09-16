import React from 'react';



const Card = () => {
  return (
  <div style={{
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    width: '300px',
    background: '#fff'
  }}>
    <img
      src={"https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
      alt={"Card image"}
      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
    />
    
  </div>
)
}

export default Card;