import React from 'react';

interface WishlistItemProps {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    onRemove?: (id: number) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ id, title, description, imageUrl, onRemove }) => {
    const handleRemove = () => {
        if (onRemove) {
            onRemove(id);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={title}
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '0.5rem' }}
                />
            )}
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            <button
                onClick={handleRemove}
                style={{
                    backgroundColor: '#ff5252',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                }}
            >
                Remove
            </button>
        </div>
    );
};

export default WishlistItem;