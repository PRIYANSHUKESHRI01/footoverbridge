import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-gray-800 mt-16">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center mb-5">
              <span className="text-primary-700 font-heading font-bold text-2xl">FOB</span>
              <span className="text-accent-600 font-heading font-bold ml-1 text-2xl">Management</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Our platform enables citizens to report and track foot over bridge conditions,
              contributing to safer pedestrian infrastructure while earning rewards for engagement.
            </p>
            <div className="mt-6 flex space-x-5">
              <a
                href="#"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary-600 transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-700 hover:text-primary-700 text-sm inline-flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/report/new" className="text-gray-700 hover:text-primary-700 text-sm inline-flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="text-gray-700 hover:text-primary-700 text-sm inline-flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Rewards
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-700 text-sm inline-flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-700 hover:text-primary-700 text-sm inline-flex items-center">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                  Your Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-500"></span>
            </h3>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start">
                <FaMapMarkerAlt className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <span>
                  123 Infrastructure Avenue<br />
                  City Center, State 12345
                </span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-primary-600 mr-3" />
                <a href="mailto:info@fobmanagement.com" className="hover:text-primary-700">
                  info@fobmanagement.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhone className="h-5 w-5 text-primary-600 mr-3" />
                <a href="tel:+11234567890" className="hover:text-primary-700">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-900 relative inline-block">
              Stay Updated
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary-500"></span>
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Subscribe to our newsletter for updates on bridge safety and community initiatives.
            </p>
            <div className="mt-3">
              <div className="flex flex-col space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 text-sm rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 bg-white border border-gray-300"
                />
                <button className="bg-blue-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            &copy; {currentYear} FOB Management System. All rights reserved.
          </div>
          <div className="mt-6 md:mt-0">
            <ul className="flex flex-wrap space-x-6 text-sm text-gray-600">
              <li>
                <Link to="/privacy" className="hover:text-primary-700 transition duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary-700 transition duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary-700 transition duration-200">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;