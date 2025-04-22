import { createContext, useState, useContext } from 'react';
import AuthContext from './AuthContext';

const RewardContext = createContext();

export const RewardProvider = ({ children }) => {
  const { api, isAuthenticated } = useContext(AuthContext);
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [currentReward, setCurrentReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'pointsCost:asc'
  });

  const getRewards = async (page = 1, filtersObj = null) => {
    setLoading(true);
    setError(null);

    try {
      const queryFilters = filtersObj || filters;

      let queryString = `?page=${page}&limit=${pagination.limit}`;
      if (queryFilters.category) queryString += `&category=${queryFilters.category}`;
      if (queryFilters.sortBy) queryString += `&sortBy=${queryFilters.sortBy}`;

      const res = await api.get(`/rewards${queryString}`);

      setRewards(res.data.data);
      setPagination({
        ...pagination,
        page: res.data.pagination.page,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      });

      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch rewards');
      throw err;
    }
  };

  const getUserRewards = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/rewards/user/my-rewards');
      setUserRewards(res.data.data);
      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch user rewards');
      throw err;
    }
  };

  const getReward = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/rewards/${id}`);

      setCurrentReward(res.data.data);
      setLoading(false);

      return res.data.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch reward');
      throw err;
    }
  };

  const createReward = async (rewardData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/rewards', rewardData);

      setRewards([res.data.data, ...rewards]);

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create reward');
      throw err;
    }
  };

  const updateReward = async (id, rewardData) => {
    setLoading(true);
    setError(null);

    try {

      const res = await api.put(`/rewards/${id}`, rewardData);

      setCurrentReward(res.data.data);

      setRewards(
        rewards.map(reward =>
          reward._id === id ? res.data.data : reward
        )
      );

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update reward');
      throw err;
    }
  };

  const deleteReward = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/rewards/${id}`);

      setRewards(rewards.filter(reward => reward._id !== id));

      setLoading(false);

      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to delete reward');
      throw err;
    }
  };

  const redeemReward = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post(`/rewards/${id}/redeem`);

      getUserRewards();

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to redeem reward');
      throw err;
    }
  };

  const updateFilters = async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    return getRewards(1, updatedFilters);
  };

  return (
    <RewardContext.Provider
      value={{
        rewards,
        userRewards,
        currentReward,
        loading,
        error,
        pagination,
        filters,
        getRewards,
        getUserRewards,
        getReward,
        createReward,
        updateReward,
        deleteReward,
        redeemReward,
        updateFilters,
        setCurrentReward
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export default RewardContext;