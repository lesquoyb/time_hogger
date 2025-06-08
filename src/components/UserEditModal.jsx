import { useState, useRef, useEffect } from 'react';

const emojiCategories = {
  people: {
    name: 'People',
    icon: '👤',
    emojis: [
      '👤', '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍🎨', '👨‍🎨', 
      '👩‍🔬', '👨‍🔬', '👩‍🏫', '👨‍🏫', '👩‍⚕️', '👨‍⚕️', 
      '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎤', '👨‍🎤',
      '👩‍🏭', '👨‍🏭', '👮‍♀️', '👮‍♂️', '🕵️‍♀️', '🕵️‍♂️'
    ]
  },
  faces: {
    name: 'Faces',
    icon: '😊',
    emojis: [
      '😊', '😎', '🤓', '🧐', '😇', '😈', '🤔', '😴', 
      '🤩', '🥳', '😜', '🤗', '😋', '🤤', '😌', '😁',
      '🙂', '😉', '😍', '🥰', '😘', '😗', '😚', '😙'
    ]
  },
  animals: {
    name: 'Animals',
    icon: '🐱',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺'
    ]
  },
  objects: {
    name: 'Objects',
    icon: '💼',
    emojis: [
      '💼', '🎯', '🏆', '⭐', '🔥', '💡', '🎭', '🎨',
      '🎸', '🎹', '🎪', '🎲', '♠️', '♥️', '♦️', '♣️',
      '🚀', '⚡', '🌟', '💎', '🔑', '🎁', '🏅', '🥇'
    ]
  }
};

const colors = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Green', value: '#10B981', bg: 'bg-emerald-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-violet-500' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-amber-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Cyan', value: '#06B6D4', bg: 'bg-cyan-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' },
  { name: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500' }
];

export default function UserEditModal({ user, isOpen, onClose, onSave }) {
  const [editedUser, setEditedUser] = useState({
    name: '',
    avatar: '👤',
    avatarType: 'emoji',
    color: '#3B82F6'
  });
  
  const [activeTab, setActiveTab] = useState('emoji');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setEditedUser({
          name: user.name || '',
          avatar: user.avatar || '👤',
          avatarType: user.avatarType || 'emoji',
          color: user.color || '#3B82F6'
        });
      } else {
        setEditedUser({
          name: '',
          avatar: '👤',
          avatarType: 'emoji',
          color: '#3B82F6'
        });
      }
    }
  }, [user, isOpen]);

  const handleSave = () => {
    if (!editedUser.name.trim()) {
      alert('Please enter a name');
      return;
    }
    onSave(editedUser);
    onClose();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File too large. Please choose an image under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({
          ...prev,
          avatar: e.target.result,
          avatarType: 'photo'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectEmoji = (emoji) => {
    setEditedUser(prev => ({
      ...prev,
      avatar: emoji,
      avatarType: 'emoji'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Edit User' : 'New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4"
              style={{ borderColor: editedUser.color }}
            >
              {editedUser.avatarType === 'photo' ? (
                <img 
                  src={editedUser.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">{editedUser.avatar}</span>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Avatar Preview</h3>
              <p className="text-sm text-gray-500">Choose an emoji or upload a photo</p>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the person's name"
            />
          </div>

          {/* Avatar selection tabs */}
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('emoji')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'emoji'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                😊 Emoji
              </button>
              <button
                onClick={() => setActiveTab('photo')}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'photo'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📷 Photo
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'emoji' ? (
              <div className="space-y-4">
                {Object.entries(emojiCategories).map(([key, category]) => (
                  <div key={key}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-8 gap-2">
                      {category.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => selectEmoji(emoji)}
                          className={`w-10 h-10 rounded-lg border-2 hover:bg-gray-50 transition-colors flex items-center justify-center ${
                            editedUser.avatar === emoji && editedUser.avatarType === 'emoji'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <span className="text-lg">{emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    📁 Choose File
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Accepted formats: PNG, JPG, GIF (max 5MB)
                  </p>
                </div>
                {editedUser.avatarType === 'photo' && editedUser.avatar && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <img 
                      src={editedUser.avatar} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-green-800">Photo uploaded</p>
                      <button 
                        onClick={() => setEditedUser(prev => ({ ...prev, avatar: '👤', avatarType: 'emoji' }))}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Color selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setEditedUser(prev => ({ ...prev, color: color.value }))}
                  className={`h-12 rounded-lg border-2 transition-all ${color.bg} ${
                    editedUser.color === color.value
                      ? 'border-gray-800 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-3">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                🎨 Custom Color
              </button>
              {showColorPicker && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={editedUser.color}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{editedUser.color}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {user ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
