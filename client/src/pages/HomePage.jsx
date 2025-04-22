import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaChartLine, FaAward, FaUsers, FaClipboardCheck } from 'react-icons/fa';
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

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { getReports, reports, loading, error } = useContext(ReportContext);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    activeUsers: 0,
    averageResponseTime: '3 days',
  });

  useEffect(() => {
    getReports(1, { limit: 10, sortBy: 'createdAt:desc' });

    setStats({
      totalReports: 142,
      resolvedReports: 87,
      activeUsers: 53,
      averageResponseTime: '3 days',
    });
  }, []);

  return (
    <div className="pt-16">
      <section className="bg-white text-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="mb-10 md:mb-0 md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                Safer Bridges, Stronger Communities
              </h1>
              <p className="text-xl mb-10 text-gray-700 leading-relaxed">
                Report conditions, contribute to improvements, and earn rewards through our Foot Over Bridge
                Management System.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link to="/report/new" className="btn bg-blue-600 hover:bg-primary-700 border-0 text-white font-medium px-8 py-3 rounded-lg transition duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Report an Issue
                  </Link>
                ) : (
                  <Link to="/register" className="btn bg-blue-600 hover:bg-primary-700 border-0 text-white font-medium px-8 py-3 rounded-lg transition duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Join Today
                  </Link>
                )}
                <Link to="/dashboard" className="btn bg-white hover:bg-gray-100 border-2 border-gray-300 text-gray-800 font-medium px-8 py-3 rounded-lg transition duration-300 text-center">
                  View Dashboard
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1592859600972-1b0834d83747?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
                alt="Foot Over Bridge"
                className="rounded-xl shadow-2xl object-cover w-full h-[350px] transform rotate-1"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-primary-500">
              <FaClipboardCheck className="h-10 w-10 mx-auto text-primary-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">{stats.totalReports}</h3>
              <p className="text-gray-700 mt-2">Total Reports</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-green-500">
              <FaChartLine className="h-10 w-10 mx-auto text-green-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">{stats.resolvedReports}</h3>
              <p className="text-gray-700 mt-2">Issues Resolved</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500">
              <FaUsers className="h-10 w-10 mx-auto text-blue-600 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">{stats.activeUsers}</h3>
              <p className="text-gray-700 mt-2">Active Users</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-accent-500">
              <FaAward className="h-10 w-10 mx-auto text-accent-500 mb-4" />
              <h3 className="text-4xl font-bold text-gray-900">{stats.averageResponseTime}</h3>
              <p className="text-gray-700 mt-2">Avg Response Time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto">
              Our platform empowers citizens to report, track, and improve bridge safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-primary-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
                <FaMapMarkerAlt className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Report Issues</h3>
              <p className="text-gray-700">
                Easily report bridge conditions with our intuitive form. Add photos, location details, and
                descriptions of the issues you observe.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-secondary-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
                <FaChartLine className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-700">
                Monitor the status of your reports and see updates as authorities address the issues. Stay
                informed every step of the way.
              </p>
            </div>

            <div className="text-center bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-accent-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
                <FaAward className="h-8 w-8 text-accent-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Rewards</h3>
              <p className="text-gray-700">
                Get rewarded for your contributions with our points system. Redeem points for exclusive rewards
                and recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Reports</h2>
            <p className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto">
              Explore the latest bridge condition reports from our community
            </p>
          </div>

          <div className="h-[500px] rounded-xl overflow-hidden shadow-xl border border-gray-200">
            {!loading && reports.length > 0 && (
              <MapContainer
                center={[reports[0]?.location.coordinates[1], reports[0]?.location.coordinates[0]]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {reports.map(
                  (report) =>
                    report.location &&
                    report.location.coordinates && (
                      <Marker
                        key={report._id}
                        position={[report.location.coordinates[1], report.location.coordinates[0]]}
                      >
                        <Popup>
                          <div className="p-1">
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            <p className="text-sm text-gray-600">{report.location.address}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Status: <span className="font-medium">{report.status}</span>
                            </p>
                            <Link to={`/report/${report._id}`} className="text-primary-600 text-sm font-medium hover:text-primary-700 inline-block mt-2">
                              View Details →
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    )
                )}
              </MapContainer>
            )}
            {loading && (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-700">Loading map data...</p>
              </div>
            )}
            {!loading && reports.length === 0 && (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-700">No reports available to display on the map.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link to="/dashboard" className="btn bg-blue-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg inline-block font-medium shadow-md hover:shadow-lg transition duration-300">
              View All Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to make a difference?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
            Join our community today and help improve the safety and quality of pedestrian bridges in your area.
          </p>
          {isAuthenticated ? (
            <Link to="/report/new" className="btn bg-white text-blue-700 hover:bg-gray-100 font-medium px-8 py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-xl">
              Report an Issue Now
            </Link>
          ) : (
            <Link to="/register" className="btn bg-white text-blue-700 hover:bg-gray-100 font-medium px-8 py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-xl">
              Create an Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;