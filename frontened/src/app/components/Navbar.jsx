import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchablePages = [
    { title: 'Admin Dashboard', path: '/', role: 'admin' },
    { title: 'Sales Dashboard', path: '/salesdashboard', role: 'sales' },
    { title: 'Production View', path: '/production', role: 'production' },
    { title: 'Leads Management', path: '/leads' },
    { title: 'Projects Track', path: '/projects' },
    { title: 'Activity Log', path: '/activities' },
    { title: 'Targets', path: '/targets' }
  ];

  const searchResults = searchablePages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (!page.role || page.role === user?.role || user?.role === 'admin')
  );

  const handleSearchNavigate = (path) => {
    navigate(path);
    setShowSearch(false);
    setSearchQuery('');
  };

  const notifications = [
    { id: 1, text: 'New lead from Acme Corporation', time: '5 min ago', unread: true },
    { id: 2, text: 'Deal closed with Blue Ocean Ventures', time: '1 hour ago', unread: true },
    { id: 3, text: 'Meeting scheduled with TechStart Inc', time: '2 hours ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;
  const userAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`;

  return (
    <div className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 w-full transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="p-2 mr-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search data or pages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm transition-all focus:outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-gray-400 text-gray-900"
            />
            
            {showSearch && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-50 mb-1">
                  Pages & Pages
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchNavigate(result.path)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      {result.title}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No matching results found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6 ml-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                        notification.unread ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {notification.unread && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      )}
                      <p className={`text-sm leading-snug ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {notification.text}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 mt-1.5">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-50">
                  <button className="w-full text-center py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-100" />

          {/* Profile */}
          <button className="flex items-center group p-1 pr-2 rounded-xl hover:bg-gray-50 transition-all">
            <div className="relative">
              <img
                src={userAvatar}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-white group-hover:ring-indigo-100 transition-all"
              />
            </div>
            <div className="ml-3 text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{user?.role}</p>
            </div>
            <ChevronDown className="ml-2 w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
