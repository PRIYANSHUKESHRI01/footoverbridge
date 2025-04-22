import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaClipboardList, FaAward, FaUserShield, FaCheckCircle,
  FaTimesCircle, FaTrash, FaEdit, FaSearch, FaFilter, FaTimes,
  FaExclamationCircle, FaInfoCircle, FaChartBar, FaMapMarkerAlt
} from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ReportContext from '../context/ReportContext';
import RewardContext from '../context/RewardContext';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { user, isAuthenticated, api } = useContext(AuthContext);
  const { reports, getReports } = useContext(ReportContext);
  const { rewards, getRewards, createReward, updateReward } = useContext(RewardContext);
  const navigate = useNavigate();

  const [rewardFormData, setRewardFormData] = useState({
    name: '',
    description: '',
    pointsCost: 0,
    category: 'Vouchers',
    isActive: true,
    image: null
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (!user || user.role !== 'admin') {
        navigate('/dashboard');
      }
    } else {
      navigate('/login', { state: { from: '/admin' } });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
      getReports(1, { limit: 10 });
      getRewards(1, { limit: 10 });
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      let queryString = `?page=${page}&limit=10`;
      if (searchQuery) queryString += `&search=${searchQuery}`;
      if (filterRole !== 'all') queryString += `&role=${filterRole}`;
      if (filterVerified !== 'all') queryString += `&verified=${filterVerified === 'verified'}`;

      const response = await api.get(`/users/admin${queryString}`);

      setUsers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleVerifiedFilterChange = (e) => {
    setFilterVerified(e.target.value);
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.put(`/users/admin/${userId}/verify`);
      fetchUsers(currentPage);
      setSuccessMessage('User verified successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await api.put(`/users/admin/${userId}/role`, { role });
      fetchUsers(currentPage);
      setShowUserModal(false);
      setSuccessMessage('User role updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/admin/${userId}`);
      fetchUsers(currentPage);
      setShowDeleteModal(false);
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRewardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
  if (type === 'checkbox') {
      setRewardFormData({
        ...rewardFormData,
        [name]: checked
      });
    } else if (name === 'pointsCost') {
      setRewardFormData({
        ...rewardFormData,
        [name]: parseInt(value) || 0
      });
    } else {
      setRewardFormData({
        ...rewardFormData,
        [name]: value
      });
    }
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalType === 'create') {
        await createReward(rewardFormData);
        setSuccessMessage('Reward created successfully');
      } else if (modalType === 'edit' && selectedUser) {
        await updateReward(selectedUser._id, rewardFormData);
        setSuccessMessage('Reward updated successfully');
      }

      getRewards();
      setShowRewardModal(false);
      resetRewardForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reward');
    }
  };

  const resetRewardForm = () => {
    setRewardFormData({
      name: '',
      description: '',
      pointsCost: 0,
      category: 'general',
      isActive: true,
      image: null
    });
  };

  const openCreateRewardModal = () => {
    resetRewardForm();
    setModalType('create');
    setShowRewardModal(true);
  };

  const openEditRewardModal = (reward) => {
    setRewardFormData({
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      isActive: reward.isActive,
    });
    setSelectedUser(reward);
    setModalType('edit');
    setShowRewardModal(true);
  };

  const renderUserList = () => {
    if (loading) {
      return (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-700 my-4">
          <FaExclamationCircle className="inline-block mr-2" />
          {error}
        </div>
      );
    }

    if (!users.length) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No users found matching your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="mt-6 bg-white shadow overflow-hidden rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`http://localhost:5000/uploads/${user.avatar}`}
                          alt=""
                        />
                      ) : (
                        <FaUsers className="text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isVerified ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <FaExclamationCircle className="mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.reportCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.rewardPoints || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    {!user.isVerified && (
                      <button
                        onClick={() => handleVerifyUser(user._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Verify User"
                      >
                        <FaCheckCircle />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit User"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  {[...Array(totalPages).keys()].map((x) => (
                    <button
                      key={x + 1}
                      onClick={() => handlePageChange(x + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === x + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {x + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportsManagement = () => {
    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Report Management</h2>
          <div className="flex space-x-2">
            <select
              className="input"
              onChange={(e) => {
                // Handle status filter change for reports
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports && reports.slice(0, 6).map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{report.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600 my-1">
                  <FaMapMarkerAlt className="mr-1" />
                  <span className="truncate">{report.location?.address || 'No address'}</span>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{report.description}</p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/report/${report._id}`)}
                      className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
          >
            View All Reports
          </button>
        </div>
      </div>
    );
  };

  const renderRewardsManagement = () => {
    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Reward Management</h2>
          <button
            onClick={openCreateRewardModal}
            className="btn btn-primary btn-sm"
          >
            Add New Reward
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards && rewards.map((reward) => (
            <div key={reward._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-gray-800">{reward.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">{reward.description}</p>

                <div className="mt-4 flex justify-between items-center">
                  <span className="font-bold text-primary-600">{reward.pointsCost} Points</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditRewardModal(reward)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Reward"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Delete Reward"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage users, reports, and rewards for the FOB Management system</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
            <FaInfoCircle className="mr-3 mt-1 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Total Users</p>
                <h3 className="font-bold text-2xl text-gray-800">{users.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaClipboardList className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Total Reports</p>
                <h3 className="font-bold text-2xl text-gray-800">{reports?.length || 0}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaAward className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Active Rewards</p>
                <h3 className="font-bold text-2xl text-gray-800">
                  {rewards?.filter(r => r.isActive).length || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaExclamationCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Pending Verifications</p>
                <h3 className="font-bold text-2xl text-gray-800">
                  {users.filter(u => !u.isVerified).length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'users'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <FaUsers className="inline-block mr-2" />
                  User Management
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'reports'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <FaClipboardList className="inline-block mr-2" />
                  Report Management
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'rewards'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <FaAward className="inline-block mr-2" />
                  Reward Management
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <form onSubmit={handleSearch} className="sm:w-96">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                      </div>
                      <input
                        type="search"
                        placeholder="Search users..."
                        className="pl-10 input w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>

                  <div className="flex space-x-2">
                    <select
                      value={filterRole}
                      onChange={handleRoleFilterChange}
                      className="input"
                    >
                      <option value="all">All Roles</option>
                      <option value="citizen">Citizens</option>
                      <option value="engineer">Engineers</option>
                      <option value="official">Officials</option>
                      <option value="admin">Admins</option>
                    </select>

                    <select
                      value={filterVerified}
                      onChange={handleVerifiedFilterChange}
                      className="input"
                    >
                      <option value="all">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>

                {renderUserList()}
              </div>
            )}

            {activeTab === 'reports' && renderReportsManagement()}
            {activeTab === 'rewards' && renderRewardsManagement()}
          </div>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {selectedUser.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {selectedUser.email}
              </p>
            </div>

            <div className="mb-4">
              <label className="label">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleUpdateUserRole(selectedUser._id, 'citizen')}
                  className={`px-4 py-2 border rounded-md text-center ${selectedUser.role === 'citizen'
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUserRole(selectedUser._id, 'engineer')}
                  className={`px-4 py-2 border rounded-md text-center ${selectedUser.role === 'engineer'
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Engineer
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUserRole(selectedUser._id, 'official')}
                  className={`px-4 py-2 border rounded-md text-center ${selectedUser.role === 'official'
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Official
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUserRole(selectedUser._id, 'admin')}
                  className={`px-4 py-2 border rounded-md text-center ${selectedUser.role === 'admin'
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setShowDeleteModal(true);
                }}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <FaExclamationCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 text-center">Confirm Deletion</h2>
              <p className="text-gray-600 text-center mt-2">
                Are you sure you want to delete the user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-4 overflow-hidden transform transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FaAward className="mr-2 text-blue-600" />
                {modalType === 'create' ? 'Create New Reward' : 'Edit Reward'}
              </h2>
              <button
                onClick={() => setShowRewardModal(false)}
                className="rounded-full p-1 hover:bg-white transition-colors duration-200 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 py-4 max-h-[calc(100vh-150px)] overflow-y-auto">
              <form onSubmit={handleRewardSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Reward Title</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={rewardFormData.name}
                    onChange={handleRewardFormChange}
                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white"
                    placeholder="Enter reward title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={rewardFormData.description}
                    onChange={handleRewardFormChange}
                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white resize-none"
                    rows="2"
                    placeholder="Describe the reward"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pointsCost" className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
                    <div className="relative">
                      <input
                        type="number"
                        id="pointsCost"
                        name="pointsCost"
                        value={rewardFormData.pointsCost}
                        onChange={handleRewardFormChange}
                        className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white"
                        min="0"
                        placeholder="100"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">pts</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={rewardFormData.category}
                      onChange={handleRewardFormChange}
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white cursor-pointer"
                      required
                    >
                      <option value="Vouchers">Vouchers</option>
                      <option value="Discounts">Discounts</option>
                      <option value="Merchandise">Merchandise</option>
                      <option value="Recognition">Recognition</option>
                      <option value="Special Access">Special Access</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={rewardFormData.isActive}
                    onChange={handleRewardFormChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-2 text-sm">
                    <label htmlFor="isActive" className="font-medium text-gray-700">Make reward active</label>
                    <p className="text-xs text-gray-500">Immediately available for redemption</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRewardModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    {modalType === 'create' ? (
                      <>
                        <FaAward className="mr-1" /> Create Reward
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-1" /> Update Reward
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;