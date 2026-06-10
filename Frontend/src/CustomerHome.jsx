import React, { useEffect, useState } from "react";
import Navbar from "./Componenet/Navbar";
import CustomerShowOrders from "./CustomerShowOrders";
import CustomerPaidOrders from "./CustomerPaiedOrdrs";
import CustomerFeedbackShow from "./CustomerFeedbackShow";
import EditProfile from "./EditProfile";
import { useNavigate } from "react-router-dom";

function CustomerHome() {
    const [userData, setUserData] = useState({});
    const [activeSection, setActiveSection] = useState("orders");
    const navigate = useNavigate();

    const handlenavigate = () => {
        navigate("/Services");
    };

    useEffect(() => {
        const loginData = sessionStorage.getItem("LoginData");
        if (loginData) {
            setUserData(JSON.parse(loginData));
        }
    }, []);

    const renderSection = () => {
        switch (activeSection) {
            case "orders":
                return <CustomerShowOrders />;
            case "paid":
                return <CustomerPaidOrders id={userData.id} />;
            case "feedback":
                return <CustomerFeedbackShow customerId={userData.id} />;
            default:
                return <CustomerShowOrders />;
        }
    };

    return (
        <>
            <Navbar userData={userData} />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header Section */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6">
                            {/* Welcome Section */}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Welcome back, {userData.firstname || "Customer"}!
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Here's an overview of your laundry orders and account activity.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 mt-4 lg:mt-0">
                                <EditProfile userData={userData} />
                                <button
                                    onClick={handlenavigate}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer flex items-center gap-2"
                                >
                                    <span>👕</span>
                                    New Order
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex space-x-1 bg-gray-100/50 rounded-2xl p-1">
                            {[
                                { key: "orders", label: "My Orders", icon: "📦" },
                                { key: "paid", label: "Order History", icon: "✅" },
                                { key: "feedback", label: "Feedback", icon: "💬" }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveSection(tab.key)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex-1 text-center justify-center ${
                                        activeSection === tab.key
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderSection()}
                </div>

                {/* Small Footer - Added at the bottom */}
                <footer className="bg-gray-800 text-white py-6 border-t border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-center md:text-left">
                                <p className="text-gray-300 text-sm">
                                    © 2024 FreshWash. All rights reserved.
                                </p>
                            </div>
                            <div className="flex gap-6 text-sm">
                                <span className="text-gray-400">📞 (123) 456-7890</span>
                                <span className="text-gray-400">📧 info@freshwash.com</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default CustomerHome;

