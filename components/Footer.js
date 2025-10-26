import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-gray-300 relative z-10">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                {/* Branding */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Rooms4u</h2>
                    <p className="text-gray-400 leading-relaxed">
                        Your trusted place for seamless hall booking and event management.
                        We make your events memorable ✨.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                        Quick Links
                        <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-500 rounded"></span>
                    </h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="hover:text-blue-400 transition">Home</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Book Now</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">Pricing</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition">FAQs</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                        Contact Us
                        <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-green-500 rounded"></span>
                    </h3>
                    <ul className="space-y-2">
                        <li>Email: <span className="text-gray-400">contact@myhall.com</span></li>
                        <li>Phone: <span className="text-gray-400">+1 (234) 567-8901</span></li>
                        <li>Location: <span className="text-gray-400">123 Main St, City</span></li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
                        Follow Us
                        <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-pink-500 rounded"></span>
                    </h3>
                    <div className="flex space-x-4">
                        <a href="#" className="flex items-center justify-center p-3 w-10 h-10 rounded-full bg-white/10 hover:bg-blue-500 transition">
                            <FontAwesomeIcon icon={faFacebookF} className="text-white" />
                        </a>
                        <a href="#" className="flex items-center justify-center p-3 w-10 h-10 rounded-full bg-white/10 hover:bg-pink-500 transition">
                            <FontAwesomeIcon icon={faInstagram} className="text-white" />
                        </a>
                        <a href="#" className="flex items-center justify-center p-3 w-10 h-10 rounded-full bg-white/10 hover:bg-sky-400 transition">
                            <FontAwesomeIcon icon={faTwitter} className="text-white" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} MyHall. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
