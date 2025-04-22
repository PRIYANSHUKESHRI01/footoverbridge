import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt, FaUser, FaClock, FaClipboardCheck, FaCalendarAlt, FaThumbsUp,
  FaPencilAlt, FaTrash, FaComment, FaExclamationCircle, FaCheckCircle, FaInfoCircle,
  FaSpinner, FaImage, FaArrowLeft, FaUserShield, FaArrowRight, FaArrowUp
} from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ReportContext from '../context/ReportContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const {
    getReport,
    currentReport,
    loading,
    error,
    addPublicComment,
    addAdminComment,
    upvoteReport,
    deleteReport
  } = useContext(ReportContext);

  const [commentText, setCommentText] = useState('');
  const [adminCommentText, setAdminCommentText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [upvoteSubmitting, setUpvoteSubmitting] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (id) {
      getReport(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentReport && currentReport.status) {
      setNewStatus(currentReport.status);
    }
  }, [currentReport]);

  const handlePublicCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      await addPublicComment(id, commentText);
      setCommentText('');
      setSuccessMessage('Comment added successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleAdminCommentSubmit = async (e) => {
    e.preventDefault();
    if (!adminCommentText.trim()) return;

    setCommentSubmitting(true);
    try {
      await addAdminComment(id, adminCommentText, newStatus !== currentReport.status ? newStatus : null);
      setAdminCommentText('');
      setSuccessMessage('Comment and status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add admin comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/report/${id}` } });
      return;
    }

    setUpvoteSubmitting(true);
    try {
      await upvoteReport(id);
    } catch (err) {
      console.error('Failed to upvote:', err);
    } finally {
      setUpvoteSubmitting(false);
    }
  };

  const handleDeleteReport = async () => {
    setDeleteSubmitting(true);
    try {
      await deleteReport(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete report:', err);
    } finally {
      setDeleteSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-200 to-yellow-100 text-yellow-800 border border-yellow-300';
      case 'in-progress':
        return 'bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 border border-blue-300';
      case 'completed':
        return 'bg-gradient-to-r from-green-200 to-green-100 text-green-800 border border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-200 to-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const isUserAuthorized = () => {
    if (!isAuthenticated || !user || !currentReport) return false;
    return user._id === currentReport.user || user.role === 'admin' || user.role === 'official' || user.role === 'engineer';
  };

  const isReportOwner = () => {
    if (!isAuthenticated || !user || !currentReport) return false;
    return user._id === currentReport.user;
  };

  const canManageStatus = () => {
    if (!isAuthenticated || !user || !currentReport) return false;
    return user.role === 'admin' || user.role === 'official' || user.role === 'engineer';
  };

  if (loading) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin h-10 w-10 text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 bg-red-50 rounded-lg text-red-700 flex items-start">
          <FaExclamationCircle className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Error Loading Report</h2>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center text-red-700 hover:text-red-900"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 bg-gray-50 rounded-lg text-gray-700 text-center">
          <p className="text-lg">Report not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 btn btn-outline"
          >
            <FaArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-2 transition-colors duration-200 group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">{currentReport.title}</h1>
          </div>

          <div className="flex space-x-2">
            {isReportOwner() && (
              <>
                <Link
                  to={`/report/edit/${id}`}
                  className="btn btn-outline inline-flex items-center transform hover:scale-105 transition-transform duration-200"
                >
                  <FaPencilAlt className="mr-2" /> Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white inline-flex items-center transform hover:scale-105 transition-transform duration-200 shadow-md"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start border-l-4 border-green-500 shadow-sm animate-fade-in">
            <FaInfoCircle className="mr-3 mt-1 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card mb-8 shadow-lg border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-primary-50 to-gray-50 p-6 border-b border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${getStatusBadgeClass(currentReport.status)}`}>
                    <FaClipboardCheck className="mr-2" />
                    {currentReport.status.charAt(0).toUpperCase() + currentReport.status.slice(1)}
                  </span>
                  <span className="ml-4 inline-flex items-center text-gray-500 text-sm">
                    <FaCalendarAlt className="mr-1" />
                    {new Date(currentReport.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={handleUpvote}
                  disabled={upvoteSubmitting}
                  className="inline-flex items-center px-3 py-1 bg-white hover:bg-gray-50 rounded-full text-gray-700 border border-gray-200 shadow-sm hover:shadow transform hover:scale-105 transition-all duration-200"
                >
                  {upvoteSubmitting ? (
                    <FaSpinner className="animate-spin mr-1" />
                  ) : (
                    <FaArrowUp className={`mr-1 ${currentReport.upvotes > 0 ? 'text-primary-500' : ''}`} />
                  )}
                  <span>{currentReport.upvotes}</span>
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{currentReport.description}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary-500" />
                  Location
                </h3>
                <div className="flex items-start text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
                  <span>{currentReport.location?.address || 'No address provided'}</span>
                </div>
                <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-md">
                  {currentReport.location?.coordinates && (
                    <MapContainer
                      center={[currentReport.location.coordinates[1], currentReport.location.coordinates[0]]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[currentReport.location.coordinates[1], currentReport.location.coordinates[0]]}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{currentReport.title}</h3>
                            <p className="text-sm">{currentReport.location.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-400 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Issue Type</h3>
                  <p className="mt-1 text-lg text-gray-900 font-medium">{currentReport.issueType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-400 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                  <p className="mt-1 text-lg text-gray-900 font-medium">{currentReport.condition}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaImage className="mr-2 text-primary-500" />
                  Photos
                </h3>

                {currentReport.images && currentReport.images.length > 0 ? (
                  <div>
                    <div className="relative rounded-xl overflow-hidden h-[450px] mb-4 shadow-md group">
                      <img
                        src={`http://localhost:5000/uploads/${currentReport.images[activeImageIndex]}`}
                        alt={`Report image ${activeImageIndex + 1}`}
                        className="w-full h-full object-contain bg-black bg-opacity-80"
                      />

                      {currentReport.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? currentReport.images.length - 1 : prev - 1))}
                            className="bg-black bg-opacity-50 rounded-full p-3 text-white hover:bg-opacity-70 hover:scale-110 transition-all duration-200"
                          >
                            <FaArrowLeft />
                          </button>
                          <button
                            onClick={() => setActiveImageIndex((prev) => (prev === currentReport.images.length - 1 ? 0 : prev + 1))}
                            className="bg-black bg-opacity-50 rounded-full p-3 text-white hover:bg-opacity-70 hover:scale-110 transition-all duration-200"
                          >
                            <FaArrowRight />
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                          {activeImageIndex + 1} / {currentReport.images.length}
                        </span>
                      </div>
                    </div>

                    {currentReport.images.length > 1 && (
                      <div className="flex space-x-2 overflow-x-auto pt-2 pb-1 px-1">
                        {currentReport.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 shadow hover:shadow-md transition-all duration-200 transform hover:scale-105 ${
                              index === activeImageIndex ? 'border-primary-500' : 'border-transparent'
                            }`}
                          >
                            <img
                              src={`http://localhost:5000/uploads/${image}`}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-xl border border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <FaImage className="mx-auto h-10 w-10 mb-2 opacity-30" />
                      <p>No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {currentReport.adminComments && currentReport.adminComments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUserShield className="mr-2 text-primary-500" />
                    Official Updates
                  </h3>
                  <div className="space-y-4">
                    {currentReport.adminComments.map((comment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-400 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-b from-blue-300 to-blue-200 flex items-center justify-center shadow-inner">
                                <FaUserShield className="text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-blue-800">
                                {comment.user ? comment.user.name : 'Official'}
                                <span className="ml-2 font-normal text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                  ({comment.user ? comment.user.role.charAt(0).toUpperCase() + comment.user.role.slice(1) : 'Admin'})
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                              <div className="mt-3 text-blue-900 leading-relaxed">{comment.comment}</div>

                              {comment.statusChange && (
                                <div className="mt-3 text-sm bg-white bg-opacity-50 py-2 px-3 rounded-lg inline-block">
                                  <span className="font-medium">Status changed to: </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(comment.statusChange)}`}>
                                    {comment.statusChange.charAt(0).toUpperCase() + comment.statusChange.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaComment className="mr-2 text-primary-500" />
                  Community Discussion
                </h3>

                {currentReport.publicComments && currentReport.publicComments.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {currentReport.publicComments.map((comment, index) => (
                      <div key={index} className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 flex items-center justify-center shadow-inner">
                                {comment.user && comment.user.avatar ? (
                                  <img
                                    src={`http://localhost:5000/uploads/${comment.user.avatar}`}
                                    alt={comment.user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-gray-500" />
                                )}
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">
                                {comment.user ? comment.user.name : 'Anonymous User'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                              <div className="mt-3 text-gray-700 leading-relaxed">{comment.comment}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg mb-6 border border-dashed border-gray-300">
                    <FaComment className="mx-auto h-8 w-8 text-gray-400 opacity-60" />
                    <p className="mt-2 text-gray-500">No comments yet. Be the first to comment!</p>
                  </div>
                )}

                {isAuthenticated ? (
                  <form onSubmit={handlePublicCommentSubmit} className="mt-6">
                    <div className="mb-3">
                      <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Add a comment
                      </label>
                      <textarea
                        id="comment"
                        rows="3"
                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200 bg-white resize-none"
                        placeholder="Share your thoughts on this report..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn bg-gradient-to-r from-primary-500 to-primary-600 text-blue-500 p-3 px-6 flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        disabled={commentSubmitting || !commentText.trim()}
                      >
                        {commentSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FaComment className="mr-2" />
                            Add Comment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg text-center border border-gray-200 shadow-inner">
                    <p className="text-gray-600">
                      Please{' '}
                      <Link to={`/login?redirect=/report/${id}`} className="text-primary-600 font-medium hover:underline">
                        sign in
                      </Link>{' '}
                      to add a comment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card shadow-lg border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-primary-50 to-gray-50 p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaInfoCircle className="mr-2 text-primary-500" />
                Report Information
              </h3>
            </div>

            <div className="p-5 space-y-5">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-sm font-medium text-gray-500">Report ID</h4>
                <p className="mt-1 text-gray-900 text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">{currentReport._id}</p>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-sm font-medium text-gray-500">Reported By</h4>
                <div className="mt-1 flex items-center">
                  {currentReport.isAnonymous ? (
                    <span className="text-gray-700 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 shadow-inner">
                        <FaUser className="text-gray-400" />
                      </div>
                      Anonymous User
                    </span>
                  ) : currentReport.user && typeof currentReport.user === 'object' ? (
                    <>
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 shadow-inner">
                          {currentReport.user.avatar ? (
                            <img
                              src={`http://localhost:5000/uploads/${currentReport.user.avatar}`}
                              alt={currentReport.user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <FaUser className="text-primary-500" />
                          )}
                        </div>
                      </div>
                      <span className="text-gray-900 font-medium">{currentReport.user.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-700">User information unavailable</span>
                  )}
                </div>
              </div>

              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-sm font-medium text-gray-500">Reported On</h4>
                <p className="mt-1 text-gray-900 bg-gray-50 py-1.5 px-3 rounded-full inline-flex items-center">
                  <FaCalendarAlt className="mr-2 text-primary-500" />
                  {new Date(currentReport.createdAt).toLocaleDateString()} at{' '}
                  {new Date(currentReport.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {currentReport.updatedAt && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                  <p className="mt-1 text-gray-900 bg-gray-50 py-1.5 px-3 rounded-full inline-flex items-center">
                    <FaClock className="mr-2 text-primary-500" />
                    {new Date(currentReport.updatedAt).toLocaleDateString()} at{' '}
                    {new Date(currentReport.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {canManageStatus() && (
            <div className="card shadow-lg border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUserShield className="mr-2 text-blue-600" />
                  Administrative Actions
                </h3>
              </div>

              <div className="p-5">
                <form onSubmit={handleAdminCommentSubmit}>
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-2">
                      Add Official Comment
                    </label>
                    <textarea
                      id="adminComment"
                      rows="4"
                      className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white resize-none"
                      placeholder="Add an official update..."
                      value={adminCommentText}
                      onChange={(e) => setAdminCommentText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={commentSubmitting || !adminCommentText.trim()}
                  >
                    {commentSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2" />
                        Submit Update
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="card shadow-lg border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary-500" />
                Similar Reports
              </h3>
            </div>

            <div className="p-6 text-center">
              <div className="inline-block rounded-full bg-gray-100 p-4 mb-4">
                <FaMapMarkerAlt className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mt-2 text-gray-500">No similar reports found in this area.</p>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
            <div className="mb-6">
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <FaExclamationCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 text-center">Confirm Deletion</h2>
              <p className="text-gray-600 text-center mt-2">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline transform hover:scale-105 transition-transform duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                className="btn bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                disabled={deleteSubmitting}
              >
                {deleteSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;