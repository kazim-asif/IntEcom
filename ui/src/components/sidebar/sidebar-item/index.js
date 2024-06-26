import React from 'react';
import './SidebarItem.css'; // Importing custom CSS

const SidebarItem = ({ icon, text, isSelected, onItemClick }) => {
    return (
        <div
            className={`sidebar-item font-semibold p-2 ${isSelected ? 'active' : ''}`}
            onClick={onItemClick}
        >
            {/* ${isSelected ? 'text-light' : 'text-slate-300'} */}
            <span className={`ms-2 ${isSelected ? 'text-light' : 'text-primary'}`}>{icon}</span>
            <span className={`ms-2`}>{text}</span>
        </div>
    )
}

export default SidebarItem;
