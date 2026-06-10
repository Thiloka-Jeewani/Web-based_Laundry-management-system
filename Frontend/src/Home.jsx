import React from 'react'
import Navbar from './Componenet/Navbar'
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
      <>
        <Navbar />

        {/* Hero Section with Blurred Background */}
        <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
          {/* Blurred Background Image */}
          <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
              }}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 drop-shadow-lg">
              Best & Quality Laundry Services
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Experience the convenience of premium laundry services with quick turnaround and exceptional quality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                  onClick={() => navigate("/register")}
                  className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold transition duration-200 shadow-lg cursor-pointer text-lg transform hover:scale-105"
              >
                Get Started
              </button>
              <button
                  onClick={() => navigate("/Services")}
                  className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold transition duration-200 cursor-pointer text-lg transform hover:scale-105"
              >
                Our Services
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Why Choose FreshWash?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide premium laundry services with a focus on quality, convenience, and customer satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "⚡",
                  title: "Fast Service",
                  description: "Quick turnaround with express options available for urgent needs."
                },
                {
                  icon: "⭐",
                  title: "Premium Quality",
                  description: "Professional cleaning with attention to detail for the best results."
                },
                {
                  icon: "🚚",
                  title: "Free Pickup & Delivery",
                  description: "We pick up and deliver your laundry right at your doorstep."
                }
              ].map((feature, index) => (
                  <div
                      key={index}
                      className="bg-gray-50 p-8 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
                  >
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Services
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our range of professional laundry and cleaning services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Wash & Fold",
                  description: "Professional washing and folding service for your everyday laundry.",
                  image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                },
                {
                  title: "Dry Cleaning",
                  description: "Expert dry cleaning for delicate fabrics and special garments.",
                  image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                },
                {
                  title: "Stain Removal",
                  description: "Specialized treatment for tough stains on any fabric type.",
                  image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                }
              ].map((service, index) => (
                  <div
                      key={index}
                      className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                      onClick={() => navigate("/Services")}
                  >
                    <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {service.description}
                      </p>
                      <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200">
                        Learn More →
                      </button>
                    </div>
                  </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                  onClick={() => navigate("/Services")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition duration-200 cursor-pointer"
              >
                View All Services
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
                <div className="text-blue-200">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">50K+</div>
                <div className="text-blue-200">Loads Washed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-200">Customer Support</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2">4.8</div>
                <div className="text-blue-200">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust FreshWash with their laundry needs.
            </p>
            <button
                onClick={() => navigate("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition duration-200 cursor-pointer text-lg"
            >
              Get Started Today
            </button>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">FW</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">FreshWash</h3>
                    <p className="text-gray-400 text-sm">The Best Laundry Services</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Professional laundry services with quality and convenience at your doorstep.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">📞</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">(123) 456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">📧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">info@freshwash.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">📍</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="font-medium">123 Laundry St, City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {['Home', 'Services', 'Pricing', 'About', 'Contact'].map((item) => (
                      <li key={item}>
                        <button
                            onClick={() => {
                              if (item === 'Home') window.scrollTo(0, 0);
                              else if (item === 'Services') navigate('/Services');
                              else if (item === 'About') navigate('/Aboutus');
                            }}
                            className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm"
                        >
                          {item}
                        </button>
                      </li>
                  ))}
                </ul>
              </div>

              {/* Business Hours */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Business Hours</h4>
                <div className="text-gray-400 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Mon - Fri:</span>
                    <span>7:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 FreshWash. All rights reserved. | Professional Laundry Services
              </p>
            </div>
          </div>
        </footer>
      </>
  );
}

export default Home;