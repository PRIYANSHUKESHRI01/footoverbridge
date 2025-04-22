import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaMapMarkerAlt, FaUserCircle, FaMedal, FaPlus, FaFilter, FaSearch, FaCalendarAlt, FaCommentAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ReportContext from '../context/ReportContext';
import RewardContext from '../context/RewardContext';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('myReports');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { user } = useContext(AuthContext);
  const { userReports, getUserReports, getAllReports, loading: reportsLoading } = useContext(ReportContext);
  const { userPoints, redeemableRewards, getUserRewards, loading: rewardsLoading } = useContext(RewardContext);

  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        getUserReports();
      } else {
        getAllReports();
      }
      getUserRewards();
    }
  }, [user]);

  console.log(userReports)

  const filteredReports = userReports?.filter(report => {
    const matchesSearch = searchQuery === '' ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedReports = filteredReports?.sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const renderReportsList = () => {
    if (reportsLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (!sortedReports || sortedReports.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">No reports found.</p>
          <Link to="/report/new" className="btn-primary px-6 py-3 rounded-lg text-blue-500 font-medium inline-flex items-center transition-all hover:shadow-lg">
            <FaPlus className="mr-2" /> Submit a new report
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {sortedReports.map(report => (
          <div key={report._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <Link to={`/report/${report._id}`} className="block">
              {report.images && report.images.length > 0 && (
                <div className="relative">
                  <img
                    src={`http://localhost:5000/uploads/${report.images[0]}`}
                    alt="Report"
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-3 py-1.5 font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5">
                {(!report.images || report.images.length === 0) && (
                  <div className="mb-2 flex justify-end">
                    <span className={`text-xs px-3 py-1.5 font-medium rounded-full ${getStatusBadgeClass(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                )}

                <h3 className="font-semibold text-xl text-gray-800 line-clamp-1">{report.title}</h3>

                <div className="flex items-center text-sm text-gray-600 my-2">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  <span className="line-clamp-1">{report.location.address}</span>
                </div>

                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{report.description}</p>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1.5 text-gray-400" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  {report.comments && (
                    <div className="flex items-center">
                      <FaCommentAlt className="mr-1.5 text-gray-400" />
                      <span>{report.comments.length} comments</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  const renderProfileTab = () => {
    if (rewardsLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-4 shadow-inner">
              <FaUserCircle className="h-24 w-24 text-primary-400" />
            </div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-medium capitalize text-sm">{user?.role}</span>
              {user?.role !== 'citizen' && !user?.isVerified && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full ml-2 font-medium">
                  Pending Verification
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-blue-50 text-blue-700 rounded-xl px-6 py-4 text-center shadow-sm border border-blue-100">
                <p className="text-3xl font-bold">{userReports?.length || 0}</p>
                <p className="text-sm font-medium mt-1">Reports Submitted</p>
              </div>

              <div className="bg-green-50 text-green-700 rounded-xl px-6 py-4 text-center shadow-sm border border-green-100">
                <p className="text-3xl font-bold">{user?.rewardPoints}</p>
                <p className="text-sm font-medium mt-1">Reward Points</p>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/profile/edit" className="btn-outline px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:border-primary-500 hover:text-primary-600 font-medium mr-3 transition-colors">
                Edit Profile
              </Link>
              <Link to="/profile/change-password" className="btn-outline px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:border-primary-500 hover:text-primary-600 font-medium transition-colors">
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRewardsTab = () => {
    if (rewardsLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-md p-8 mb-8 text-white">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full mr-6">
              <FaMedal className="h-12 w-12 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-3xl text-blue-500 font-bold">{userPoints} Points</h3>
              <p className="text-black text-opacity-90 mt-1">Earn points by submitting quality reports and having them validated</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-5">Available Rewards</h3>

        {(!redeemableRewards || redeemableRewards.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No rewards available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {redeemableRewards.map(reward => (
              <div key={reward._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
                <h4 className="font-semibold text-lg text-gray-800">{reward.title}</h4>
                <p className="text-sm text-gray-600 mt-2 mb-4">{reward.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-xl text-primary-600">{reward.pointsCost} Points</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      userPoints >= reward.pointsCost
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={userPoints < reward.pointsCost}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">Dashboard</h1>

          <Link to="/report/new" className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-blue-500 font-medium inline-flex items-center transition-all shadow-sm hover:shadow">
            <FaPlus className="mr-2" /> Submit Report
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b">
            <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('myReports')}
                className={`whitespace-nowrap py-5 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'myReports'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaClipboardList className="inline-block mr-2" />
                My Reports
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap py-5 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaUserCircle className="inline-block mr-2" />
                Profile
              </button>

              <button
                onClick={() => setActiveTab('rewards')}
                className={`whitespace-nowrap py-5 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'rewards'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaMedal className="inline-block mr-2" />
                Rewards
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'myReports' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="search"
                      placeholder="Search reports..."
                      className="pl-11 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div className="sm:w-1/4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaFilter className="text-gray-400" />
                      </div>
                      <select
                        className="pl-11 py-3 border border-gray-300 rounded-lg w-full appearance-none bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        value={filterStatus}
                        onChange={handleFilterChange}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {renderReportsList()}
              </div>
            )}

            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'rewards' && renderRewardsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;