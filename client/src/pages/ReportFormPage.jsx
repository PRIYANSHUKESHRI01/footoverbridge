import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt, FaExclamationCircle, FaInfoCircle, FaTimes, FaPencilAlt, FaCheckCircle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ReportContext from '../context/ReportContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

const customIcon = new L.Icon({
  iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconRetinaUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const LocationPicker = ({ position, setPosition, setFormData }) => {
  const map = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
    },
  });

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const { road, suburb, city, state, country } = data.address;
        const address = [road, suburb, city, state, country].filter(Boolean).join(', ');

        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: address || data.display_name,
            city: city || suburb || '',
            state: state || '',
            type: 'Point',
            coordinates: [lng, lat],
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  return position ? <Marker position={position} icon={customIcon} /> : null;
};

const ReportFormPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { createReport, updateReport, getReport, currentReport, loading, error } = useContext(ReportContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [position, setPosition] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: '',
    condition: '',
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: '',
      city: '',
      state: '',
    },
    images: [],
    isAnonymous: false,
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchReport = async () => {
        try {
          await getReport(id);
        } catch (err) {
          console.error('Error fetching report:', err);
        }
      };

      fetchReport();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentReport) {
      setFormData({
        title: currentReport.title || '',
        description: currentReport.description || '',
        issueType: currentReport.issueType || '',
        condition: currentReport.condition || '',
        location: currentReport.location || {
          type: 'Point',
          coordinates: [0, 0],
          address: '',
          city: '',
          state: '',
        },
        isAnonymous: currentReport.isAnonymous || false,
      });

      if (currentReport.location && currentReport.location.coordinates) {
        setPosition([
          currentReport.location.coordinates[1],
          currentReport.location.coordinates[0]
        ]);
      }

      if (currentReport.images && currentReport.images.length > 0) {
        setPreviewImages(
          currentReport.images.map(image => ({
            url: `http://localhost:5000/uploads/${image}`,
            id: image
          }))
        );
      }
    }
  }, [isEditMode, currentReport]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/report/new' } });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.issueType) {
      errors.issueType = 'Issue type is required';
    }

    if (!formData.condition) {
      errors.condition = 'Condition assessment is required';
    }

    if (!position || !formData.location.address) {
      errors.location = 'Please select a location on the map';
    }

    if (!isEditMode && formData.images.length === 0 && uploadedImages.length === 0) {
      errors.images = 'Please upload at least one image';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const totalImages = previewImages.length + files.length;
    if (totalImages > 5) {
      setFormErrors({
        ...formErrors,
        images: `You can upload a maximum of 5 images (${previewImages.length} already uploaded)`
      });
      return;
    }

    if (files.length > 0) {
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setFormErrors({
          ...formErrors,
          images: 'Some files exceed the 5MB size limit'
        });
        return;
      }

      const newPreviewImages = files.map(file => ({
        url: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 15)
      }));

      setPreviewImages([...previewImages, ...newPreviewImages]);
      setUploadedImages([...uploadedImages, ...files]);

      if (formErrors.images) {
        setFormErrors({ ...formErrors, images: null });
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setPreviewImages(previewImages.filter((_, index) => index !== indexToRemove));

    if (indexToRemove < uploadedImages.length) {
      setUploadedImages(uploadedImages.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (validateForm()) {
      try {
        const reportData = {
          ...formData,
        };

        if (uploadedImages.length > 0) {
          reportData.images = uploadedImages;
        }

        if (isEditMode) {
          await updateReport(id, reportData);
          navigate(`/report/${id}`);
        } else {
          const result = await createReport(reportData);
          navigate(`/report/${result.data._id}`);
        }
      } catch (err) {
        console.error('Error submitting report:', err);
      }
    } else {
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="pt-20 pb-20 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              {isEditMode ? 'Update Your Report' : 'Report a Bridge Issue'}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {isEditMode
              ? 'Keep the community updated with the latest information'
              : 'Help improve infrastructure safety by sharing your observations'}
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-6 rounded-full"></div>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-xl shadow-sm border border-red-100 flex items-start animate-fade-in-up">
            <FaExclamationCircle className="mr-4 mt-1 flex-shrink-0 text-xl" />
            <div>
              <h3 className="font-semibold mb-1">Something went wrong</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="card bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:border-blue-100 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <FaPencilAlt />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="mb-6">
                <label htmlFor="title" className="label required">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input w-full px-4 py-3 rounded-lg border ${formErrors.title
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } transition-all duration-200 shadow-sm`}
                  placeholder="e.g., Broken handrail on Main Street bridge"
                />
                {formErrors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {formErrors.title}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="label required">
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`input w-full px-4 py-3 rounded-lg border ${formErrors.description
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } transition-all duration-200 shadow-sm`}
                  placeholder="Please describe the issue in detail. Include any safety concerns or accessibility issues."
                ></textarea>
                {formErrors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="issueType" className="label required">
                    Issue Type
                  </label>
                  <div className="relative">
                    <select
                      id="issueType"
                      name="issueType"
                      value={formData.issueType}
                      onChange={handleChange}
                      className={`input w-full appearance-none px-4 py-3 rounded-lg border ${formErrors.issueType
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } transition-all duration-200 shadow-sm`}
                    >
                      <option value="">Select issue type</option>
                      <option value="Structural">Structural</option>
                      <option value="Surface/Flooring">Surface/Flooring</option>
                      <option value="Handrail/Railing">Handrail/Railing</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Accessibility">Accessibility</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.issueType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {formErrors.issueType}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="condition" className="label required">
                    Overall Condition
                  </label>
                  <div className="relative">
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className={`input w-full appearance-none px-4 py-3 rounded-lg border ${formErrors.condition
                        ? 'border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } transition-all duration-200 shadow-sm`}
                    >
                      <option value="">Assess the condition</option>
                      <option value="Critical">Critical - Immediate attention required</option>
                      <option value="Poor">Poor - Significant issues</option>
                      <option value="Fair">Fair - Some issues present</option>
                      <option value="Good">Good - Minor issues</option>
                      <option value="Excellent">Excellent - No issues</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.condition && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {formErrors.condition}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAnonymous" className="ml-3 block text-sm font-medium text-gray-700">
                    Submit this report anonymously
                  </label>
                </div>
                <p className="mt-2 ml-8 text-xs text-gray-500">
                  Your personal information will not be displayed publicly, but we may still contact you for follow-up if needed.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:border-blue-100 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                  <FaMapMarkerAlt />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Location Information</h2>
              </div>

              <div className="mb-6">
                <label className="label required">Select Location on Map</label>
                <div
                  className={`h-[400px] rounded-xl overflow-hidden border-2 ${formErrors.location
                    ? 'border-red-500'
                    : 'border-gray-200 hover:border-blue-400'
                    } transition-colors shadow-md`}
                >
                  <MapContainer
                    center={position || [20.5937, 78.9629]}
                    zoom={position ? 15 : 5}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationPicker position={position} setPosition={setPosition} setFormData={setFormData} />
                  </MapContainer>
                </div>
                {formErrors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {formErrors.location}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600 flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <FaInfoCircle className="mr-2 text-blue-500" /> Click on the map to select the precise location of the issue
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="address" className="label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: e.target.value
                      }
                    })
                  }
                  className="input w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  placeholder="Street address or landmark"
                  readOnly
                />
                <p className="mt-2 text-sm text-gray-500 italic">
                  Address is automatically retrieved when you select a location on the map
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value
                        }
                      })
                    }
                    className="input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="label">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          state: e.target.value
                        }
                      })
                    }
                    className="input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="card bg-white shadow-xl rounded-2xl p-8 border border-gray-100 hover:border-blue-100 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                  <FaCamera />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Images</h2>
              </div>

              <div className="mb-6">
                <label className={`label ${!isEditMode ? 'required' : ''}`}>
                  Photos of the Issue
                </label>
                <div
                  className={`border-3 border-dashed rounded-xl p-8 text-center ${formErrors.images
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300'
                    } transition-all duration-300 cursor-pointer transform hover:scale-[1.01]`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <FaCamera className="text-gray-400 text-2xl" />
                  </div>
                  <p className="mt-2 font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or JPEG up to 5MB each (max 5 images)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    multiple
                    onChange={handleImageUpload}
                    maxLength={5}
                  />
                </div>
                {formErrors.images && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {formErrors.images}
                  </p>
                )}
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {previewImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div className="overflow-hidden rounded-lg shadow-md border border-gray-200 h-28">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-all z-10"
                        onClick={() => removeImage(index)}
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-5 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start">
                <FaInfoCircle className="text-indigo-500 mt-1 mr-3 flex-shrink-0" />
                <div className="text-sm text-indigo-700">
                  <p className="font-medium">Tips for better images:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1.5">
                    <li>Take clear, well-lit photos</li>
                    <li>Include close-ups of specific damage</li>
                    <li>Capture the issue from multiple angles</li>
                    <li>Include wider shots for context</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="sticky top-24">
              <div className="card bg-white shadow-xl rounded-2xl p-8 border border-gray-100 transition-all duration-300">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 shadow-lg transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-6 w-6 border-b-2 border-white rounded-full mr-3"></span>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <FaCheckCircle className="mr-2" />
                      {isEditMode ? 'Update Report' : 'Submit Report'}
                    </span>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4 px-3">
                  By submitting, you confirm this information is accurate to the best of your knowledge.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFormPage;