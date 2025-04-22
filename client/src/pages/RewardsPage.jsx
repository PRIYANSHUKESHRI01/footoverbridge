import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaAward, FaGift, FaExclamationCircle, FaMedal, FaTrophy,
  FaFilter, FaSearch, FaSpinner, FaInfoCircle, FaExchangeAlt,
  FaHistory, FaChevronRight, FaClipboardCheck, FaCheckCircle
} from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import RewardContext from '../context/RewardContext';

const RewardsPage = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const { isAuthenticated } = useContext(AuthContext);
  const {
    rewards,
    userRewards,
    getRewards,
    getUserRewards,
    redeemReward,
    loading: rewardsLoading,
    updateFilters
  } = useContext(RewardContext);

  const {user} = useContext(AuthContext);
  const userPoints = user?.rewardPoints;

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/rewards' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      getRewards();
      getUserRewards();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();

    const filters = {
      ...filterCategory !== 'all' ? { category: filterCategory } : {},
      ...(searchQuery ? { search: searchQuery } : {})
    };

    updateFilters(filters);
  };

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);

    if (!searchQuery) {
      const filters = e.target.value !== 'all' ? { category: e.target.value } : {};
      updateFilters(filters);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    setLoading(true);
    setError(null);

    try {
      await redeemReward(rewardId);
      setSuccessMessage('Reward redeemed successfully! Check your email for details.');
      setTimeout(() => setSuccessMessage(''), 5000);
      setShowRedeemModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  const openRedeemModal = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const filteredRewards = () => {
    if (!rewards) return [];

    return rewards.filter(reward => {
      if (!reward.isActive) return false;

      const matchesSearch = !searchQuery ||
        reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || reward.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const userRedeemedRewards = () => {
    if (!userRewards) return [];

    return userRewards.filter(reward => {
      const matchesSearch = !searchQuery ||
        reward.reward.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  };

  const renderAvailableRewards = () => {
    const filtered = filteredRewards();

    if (rewardsLoading) {
      return (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaGift className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No rewards found</h3>
          <p className="mt-1 text-gray-500">
            {searchQuery || filterCategory !== 'all'
              ? 'Try changing your search or filter criteria'
              : 'Check back soon for new rewards!'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((reward) => (
          <div key={reward._id} className="bg-white rounded-lg shadow overflow-hidden">
            {reward.image ? (
              <div className="h-48 overflow-hidden">
                <img
                  src={`http://localhost:5000/uploads/${reward.image}`}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
                <FaGift className="h-16 w-16 text-primary-500" />
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                </span>
              </div>

              <p className="mt-2 text-gray-600">{reward.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FaAward className="text-yellow-500 mr-1" />
                  <span className="font-bold text-lg">{reward.pointsCost}</span>
                  <span className="text-gray-600 ml-1">points</span>
                </div>

                <button
                  onClick={() => openRedeemModal(reward)}
                  disabled={userPoints < reward.pointsCost}
                  className={`px-4 py-2 rounded-md ${userPoints >= reward.pointsCost
                    ? 'bg-blue-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Redeem
                </button>
              </div>

              {userPoints < reward.pointsCost && (
                <p className="mt-2 text-xs text-red-600">
                  You need {reward.pointsCost - userPoints} more points to redeem this reward
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRedeemedRewards = () => {
    const redeemed = userRedeemedRewards();
    console.log(redeemed)
    if (rewardsLoading) {
      return (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (redeemed.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No rewards redeemed yet</h3>
          <p className="mt-1 text-gray-500">
            When you redeem rewards, they will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {redeemed.map((redeemedReward) => (
          <div key={redeemedReward._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  {redeemedReward?.reward?.image ? (
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={`http://localhost:5000/uploads/${redeemedReward.reward.image}`}
                        alt={redeemedReward.reward.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <FaGift className="h-8 w-8 text-primary-500" />
                    </div>
                  )}

                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{redeemedReward?.name}</h3>
                    <p className="text-sm text-gray-600">
                      Desc: {redeemedReward?.description}
                    </p>
                    <div className="flex items-center mt-1">
                      <FaAward className="text-yellow-500 mr-1 text-sm" />
                      <span className="text-gray-600 text-sm">{redeemedReward?.pointsCost} points</span>
                    </div>
                  </div>
                </div>

                <div className="ml-auto">
                  {redeemedReward?.redemptions[0]?.code && (
                    <div className=" text-sm bg-gray-50 p-2 rounded font-mono">
                      Code: {redeemedReward?.redemptions[0]?.code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards Center</h1>
            <p className="mt-2 text-gray-600">Redeem your points for exciting rewards</p>
          </div>

          <div className="mt-4 md:mt-0 bg-white rounded-lg shadow-sm p-4 flex items-center">
            <FaTrophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Your Points</p>
              <p className="text-3xl font-bold text-primary-600">{userPoints || 0}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <FaExclamationCircle className="mr-3 mt-1 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
            <FaInfoCircle className="mr-3 mt-1 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'available'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <FaGift className="inline-block mr-2" />
                  Available Rewards
                </button>

                <button
                  onClick={() => setActiveTab('redeemed')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'redeemed'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  <FaHistory className="inline-block mr-2" />
                  My Redeemed Rewards
                </button>
              </div>

              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search rewards..."
                      className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="sr-only">Search</button>
                </form>

                <select
                  value={filterCategory}
                  onChange={handleCategoryChange}
                  className="border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="gift-card">Gift Card</option>
                  <option value="voucher">Voucher</option>
                  <option value="discount">Discount</option>
                  <option value="merchandise">Merchandise</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'available' ? renderAvailableRewards() : renderRedeemedRewards()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">How to Earn Points</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Submit Reports</h3>
                </div>
                <p className="text-gray-600">Earn 10 points for each verified bridge issue report you submit.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Verification Bonus</h3>
                </div>
                <p className="text-gray-600">Receive an additional 5 points when your report is verified by officials.</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaMedal className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Referrals</h3>
                </div>
                <p className="text-gray-600">Earn 20 points for each new user who signs up using your referral code.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-0 overflow-hidden">
            <div className="relative">
              {selectedReward.image ? (
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={`http://localhost:5000/uploads/${selectedReward.image}`}
                    alt={selectedReward.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-r from-primary-600 to-blue-500 flex items-center justify-center">
                  <FaGift className="h-20 w-20 text-white/80" />
                </div>
              )}

              <button
                onClick={() => setShowRedeemModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-all duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-white/20">
                {selectedReward.category.charAt(0).toUpperCase() + selectedReward.category.slice(1)}
              </span>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReward.title}</h2>
                <p className="text-gray-600 mt-2">{selectedReward.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Redemption Cost</span>
                  <span className="flex items-center text-lg font-bold text-primary-600">
                    <FaAward className="text-yellow-500 mr-1.5" />
                    {selectedReward.pointsCost} points
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full ${userPoints >= selectedReward.pointsCost ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, (userPoints / selectedReward.pointsCost) * 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Your Points</span>
                    <p className="text-lg font-semibold">{userPoints}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">Remaining After</span>
                    <p className={`text-lg font-semibold ${userPoints - selectedReward.pointsCost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {userPoints - selectedReward.pointsCost}
                    </p>
                  </div>
                </div>

                {userPoints < selectedReward.pointsCost && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-red-700 mb-4">
                    <FaExclamationCircle className="mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      You need <strong>{selectedReward.pointsCost - userPoints}</strong> more points to redeem this reward
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      <li>Once redeemed, points cannot be refunded</li>
                      <li>Reward codes and details will be sent to your email</li>
                      <li>This redemption is subject to verification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRedeemReward(selectedReward._id)}
                  className={`px-5 py-2 rounded-lg shadow-md text-white font-medium text-sm transition-all duration-200 flex items-center justify-center min-w-[140px] ${
                    userPoints >= selectedReward.pointsCost
                      ? 'bg-blue-600 hover:to-primary-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={userPoints < selectedReward.pointsCost || loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaExchangeAlt className="mr-2" />
                      Confirm Redemption
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;