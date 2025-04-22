import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaExclamationCircle, FaInfoCircle, FaCamera, FaLock, FaShieldAlt, FaTrash, FaEdit, FaUserCircle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, error, loading, isAuthenticated } = useContext(AuthContext);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });

      if (user.avatar) {
        setAvatarPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${user.avatar}`);
      }
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);

    if (validateForm()) {
      try {
        const profileData = new FormData();
        profileData.append('name', formData.name);
        profileData.append('email', formData.email);
        profileData.append('phone', formData.phone || '');
        profileData.append('bio', formData.bio || '');

        if (avatar) {
          profileData.append('avatar', avatar);
        }

        await updateProfile(profileData);
        setUpdateSuccess(true);

        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-blue-50 via-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-blue-500 to-indigo-600 -z-10 opacity-20"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute top-40 right-10 w-48 h-48 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 relative inline-block">
            My Profile
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform translate-y-2"></span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">Manage your personal information and account preferences</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start shadow-md">
            <FaExclamationCircle className="mr-3 mt-0.5 flex-shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {updateSuccess && (
          <div className="mb-8 p-5 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-start shadow-md">
            <FaInfoCircle className="mr-3 mt-0.5 flex-shrink-0 text-green-500" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center border border-gray-100 relative">
              <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20"></div>

              <div className="relative mx-auto mb-8 group">
                <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-white shadow-xl mx-auto hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <FaUserCircle className="h-32 w-32 text-blue-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar"
                  className="absolute bottom-2 right-1/3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-3.5 cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  <FaCamera className="h-5 w-5" />
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-1">{formData.name || "Your Name"}</h2>
              <p className="text-gray-500 mb-6">{formData.email || "your.email@example.com"}</p>

              {formData.bio && (
                <div className="mt-6 text-left bg-gray-50 p-5 rounded-lg border border-gray-100 shadow-inner">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2 font-semibold">About</h3>
                  <p className="text-gray-700 italic">{formData.bio}</p>
                </div>
              )}

              <div className="pt-6 mt-8 border-t border-gray-200">
                <button
                  onClick={() => navigate('/profile/change-password')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <FaLock size={14} />
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
              <div className="px-7 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center">
                <FaEdit className="text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <div>
                        <label htmlFor="name" className="block font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaUser className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-400'} focus:ring-2 focus:ring-blue-100 shadow-sm outline-none transition-all duration-200`}
                            placeholder="John Doe"
                          />
                        </div>
                        {formErrors.name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FaExclamationCircle className="mr-1.5" size={14} />
                            {formErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-400'} focus:ring-2 focus:ring-blue-100 shadow-sm outline-none transition-all duration-200`}
                            placeholder="you@example.com"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <FaExclamationCircle className="mr-1.5" size={14} />
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block font-medium text-gray-700 mb-2">Phone Number (optional)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 focus:border-blue-400'} focus:ring-2 focus:ring-blue-100 shadow-sm outline-none transition-all duration-200`}
                          placeholder="1234567890"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <FaExclamationCircle className="mr-1.5" size={14} />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="bio" className="block font-medium text-gray-700 mb-2">Bio (optional)</label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm outline-none transition-all duration-200"
                        placeholder="Tell us a little about yourself..."
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium transform hover:-translate-y-0.5"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : 'Update Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-7 py-5 bg-gradient-to-r from-gray-700 to-gray-800 flex items-center">
                <FaShieldAlt className="text-white mr-3" />
                <h2 className="text-xl font-bold text-white">Account Security</h2>
              </div>
              <div className="p-7">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 pl-5 pr-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 flex items-center">
                        <FaLock className="text-blue-500 mr-3" />
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-500 ml-8 mt-1">Update your password for enhanced security</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile/change-password')}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg border border-blue-200 font-medium hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                      <FaLock size={14} />
                      Change
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-4 pl-5 pr-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 flex items-center">
                        <FaShieldAlt className="text-indigo-500 mr-3" />
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-500 ml-8 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 font-medium hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                      <FaShieldAlt size={14} />
                      Setup
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-4 pl-5 pr-3 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 flex items-center">
                        <FaTrash className="text-red-500 mr-3" />
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-500 ml-8 mt-1">Permanently delete your account and all data</p>
                    </div>
                    <button
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center gap-2 shadow-md"
                    >
                      <FaTrash size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;