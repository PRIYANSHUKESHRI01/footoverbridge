import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaAward, FaClipboardList, FaMapMarkedAlt, FaChartLine } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-700 font-heading font-bold text-xl">FOB</span>
              <span className="text-accent-600 font-heading font-bold ml-1 text-xl">Management</span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:items-center md:space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                    Dashboard
                  </Link>
                  <Link to="/report/new" className="text-gray-700 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                    Report Issue
                  </Link>
                  <Link to="/rewards" className="text-gray-700 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                    Rewards
                  </Link>
                  {user && user.role === 'admin' && (
                    <Link to="/admin" className="text-gray-700 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="bg-blue-600 text-white rounded-full px-4 py-1 text-sm mr-4 shadow-md">
                  <span className="font-semibold">{user?.rewardPoints || 0}</span> Points
                </div>

                <div className="ml-3 relative">
                  <div>
                    <button
                      onClick={toggleProfile}
                      className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white transition duration-150"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white border-2 border-white shadow-md">
                        {user?.avatar ? (
                          <img
                            className="h-full w-full rounded-full object-cover"
                            src={`http://localhost:5000/uploads/${user.avatar}`}
                            alt={user.name}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                    </button>
                  </div>
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 transform transition-all duration-200">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs mt-1 text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-primary-600" />
                        Your Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaClipboardList className="mr-3 text-primary-600" />
                        Your Reports
                      </Link>
                      <Link
                        to="/rewards"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaAward className="mr-3 text-accent-500" />
                        Your Rewards
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center border-t border-gray-100"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:ml-6 md:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-700 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-primary-700 px-5 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}

            <div className="flex md:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={toggleMenu}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/report/new"
                  className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Report Issue
                </Link>
                <Link
                  to="/rewards"
                  className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Rewards
                </Link>
                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white border-2 border-white shadow-sm">
                        {user?.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost:5000/uploads/${user.avatar}`}
                            alt={user.name}
                          />
                        ) : (
                          <FaUser className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                    <div className="ml-auto bg-blue-600 text-white rounded-full px-3 py-1 text-sm shadow-md">
                      <span className="font-semibold">{user?.rewardPoints || 0}</span> Points
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-700 hover:bg-gray-50 flex items-center"
                      onClick={toggleMenu}
                    >
                      <FaUser className="mr-2 text-primary-600" />
                      Your Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2 text-red-500" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 flex flex-col space-y-3 px-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-primary-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;