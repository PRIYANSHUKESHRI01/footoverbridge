import { createContext, useState, useContext } from 'react';
import AuthContext from './AuthContext';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { api, isAuthenticated } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    condition: '',
    issueType: '',
    sortBy: 'createdAt:desc'
  });

  const getReports = async (page = 1, filtersObj = null) => {
    setLoading(true);
    setError(null);

    try {
      const queryFilters = filtersObj || filters;

      let queryString = `?page=${page}&limit=${pagination.limit}`;
      if (queryFilters.status) queryString += `&status=${queryFilters.status}`;
      if (queryFilters.condition) queryString += `&condition=${queryFilters.condition}`;
      if (queryFilters.issueType) queryString += `&issueType=${queryFilters.issueType}`;
      if (queryFilters.sortBy) queryString += `&sortBy=${queryFilters.sortBy}`;
      if (queryFilters.lat && queryFilters.lng && queryFilters.radius) {
        queryString += `&lat=${queryFilters.lat}&lng=${queryFilters.lng}&radius=${queryFilters.radius}`;
      }

      const res = await api.get(`/reports${queryString}`);

      setReports(res.data.data);
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
      setError(err.response?.data?.message || 'Failed to fetch reports');
      throw err;
    }
  };

  const getUserReports = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/reports/user-reports`);
      setUserReports(res.data.data);
      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch user reports');
      throw err;
    }
  };

  const getReport = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/reports/${id}`);

      setCurrentReport(res.data.data);
      setLoading(false);

      return res.data.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch report');
      throw err;
    }
  };

  const createReport = async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.keys(reportData).forEach(key => {
        if (key === 'images') {
          return;
        } else if (key === 'location') {
          formData.append('location[type]', reportData.location.type || 'Point');
          formData.append('location[coordinates][0]', reportData.location.coordinates[0]);
          formData.append('location[coordinates][1]', reportData.location.coordinates[1]);
          formData.append('location[address]', reportData.location.address);
          formData.append('location[city]', reportData.location.city);
          formData.append('location[state]', reportData.location.state);
        } else {
          formData.append(key, reportData[key]);
        }
      });

      if (reportData.images && reportData.images.length > 0) {
        reportData.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const res = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setReports([res.data.data, ...reports]);

      if (userReports.length > 0) {
        setUserReports([res.data.data, ...userReports]);
      }

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create report');
      throw err;
    }
  };

  const updateReport = async (id, reportData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      Object.keys(reportData).forEach(key => {
        if (key === 'images' && typeof reportData.images[0] === 'object') {
          return;
        } else if (key === 'location') {
          formData.append('location[type]', reportData.location.type || 'Point');
          formData.append('location[coordinates][0]', reportData.location.coordinates[0]);
          formData.append('location[coordinates][1]', reportData.location.coordinates[1]);
          formData.append('location[address]', reportData.location.address);
          formData.append('location[city]', reportData.location.city);
          formData.append('location[state]', reportData.location.state);
        } else {
          formData.append(key, reportData[key]);
        }
      });

      if (reportData.newImages && reportData.newImages.length > 0) {
        reportData.newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      const res = await api.put(`/reports/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCurrentReport(res.data.data);

      setReports(
        reports.map(report =>
          report._id === id ? res.data.data : report
        )
      );

      if (userReports.length > 0) {
        setUserReports(
          userReports.map(report =>
            report._id === id ? res.data.data : report
          )
        );
      }

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to update report');
      throw err;
    }
  };

  const deleteReport = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/reports/${id}`);

      setReports(reports.filter(report => report._id !== id));

      if (userReports.length > 0) {
        setUserReports(userReports.filter(report => report._id !== id));
      }

      setLoading(false);

      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to delete report');
      throw err;
    }
  };

  const addPublicComment = async (id, comment) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post(`/reports/${id}/public-comments`, { comment });

      if (currentReport && currentReport._id === id) {
        setCurrentReport({
          ...currentReport,
          publicComments: res.data.data
        });
      }

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to add comment');
      throw err;
    }
  };

  const addAdminComment = async (id, comment, status = null) => {
    setLoading(true);
    setError(null);

    try {
      const requestData = { comment };

      if (status) {
        requestData.status = status;
      }

      const res = await api.post(`/reports/${id}/admin-comments`, requestData);

      if (currentReport && currentReport._id === id) {
        setCurrentReport({
          ...currentReport,
          adminComments: res.data.data,
          ...(status && { status })
        });

        setReports(
          reports.map(report =>
            report._id === id ? {
              ...report,
              adminComments: res.data.data,
              ...(status && { status })
            } : report
          )
        );

        if (userReports.length > 0) {
          setUserReports(
            userReports.map(report =>
              report._id === id ? {
                ...report,
                adminComments: res.data.data,
                ...(status && { status })
              } : report
            )
          );
        }
      }

      setLoading(false);

      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to add admin comment');
      throw err;
    }
  };

  const upvoteReport = async (id) => {
    setError(null);

    try {
      const res = await api.put(`/reports/${id}/upvote`);

      if (currentReport && currentReport._id === id) {
        setCurrentReport({
          ...currentReport,
          upvotes: res.data.data.upvotes
        });
      }

      setReports(
        reports.map(report =>
          report._id === id ? {
            ...report,
            upvotes: res.data.data.upvotes
          } : report
        )
      );

      if (userReports.length > 0) {
        setUserReports(
          userReports.map(report =>
            report._id === id ? {
              ...report,
              upvotes: res.data.data.upvotes
            } : report
          )
        );
      }

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upvote report');
      throw err;
    }
  };

  const updateFilters = async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    return getReports(1, updatedFilters);
  };

  const getAllReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/reports');
      setReports(res.data.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to fetch all reports');
      throw err;
    }
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        userReports,
        currentReport,
        loading,
        error,
        pagination,
        filters,
        getReports,
        getUserReports,
        getAllReports,
        getReport,
        createReport,
        updateReport,
        deleteReport,
        addPublicComment,
        addAdminComment,
        upvoteReport,
        updateFilters,
        setCurrentReport
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export default ReportContext;