import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CustomerOrderTracking() {
    const [orders, setOrders] = useState([]);
    const [USER_DATA, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTrackingOrders = async (customerId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/API/V1/OrderTracking/customer/${customerId}`
            );
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching tracking orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loginData = sessionStorage.getItem("LoginData");
        if (loginData) {
            const parsedData = JSON.parse(loginData);
            setUserData(parsedData);
            fetchTrackingOrders(parsedData.id);

            // Auto-refresh every 30 seconds
            const interval = setInterval(() => {
                fetchTrackingOrders(parsedData.id);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "COMPLETED": return "bg-green-100 text-green-800";
            case "DELIVERY": return "bg-blue-100 text-blue-800";
            case "CLEANING": return "bg-yellow-100 text-yellow-800";
            case "PICKUP": return "bg-orange-100 text-orange-800";
            case "WAITING_FOR_PICKUP": return "bg-purple-100 text-purple-800";
            case "NOTPICKUP": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const StatusTimeline = ({ order }) => {
        const steps = [
            { status: "NOTPICKUP", label: "Order Placed" },
            { status: "WAITING_FOR_PICKUP", label: "Waiting for Pickup" },
            { status: "PICKUP", label: "Picked Up" },
            { status: "CLEANING", label: "Cleaning" },
            { status: "DELIVERY", label: "Delivery" },
            { status: "COMPLETED", label: "Completed" }
        ];

        const currentIndex = steps.findIndex(step => step.status === order.orderState);

        return (
            <div className="timeline">
                {steps.map((step, index) => (
                    <div key={step.status} className="timeline-item">
                        <div className={`timeline-circle ${index <= currentIndex ? 'active' : ''}`}>
                            {index <= currentIndex ? '✓' : index}
                        </div>
                        <div className="timeline-label">{step.label}</div>
                        {index < steps.length - 1 && (
                            <div className={`timeline-line ${index < currentIndex ? 'active' : ''}`} />
                        )}
                    </div>
                ))}
                <style jsx>{`
          .timeline { display: flex; align-items: center; gap: 1rem; position: relative; }
          .timeline-item { display: flex; flex-direction: column; align-items: center; }
          .timeline-circle {
            width: 40px; height: 40px; border-radius: 50%; 
            background: #e5e7eb; color: #6b7280; display: flex; align-items: center; 
            justify-content: center; font-weight: bold; font-size: 16px; border: 3px solid #e5e7eb;
            transition: all 0.3s ease;
          }
          .timeline-circle.active {
            background: #10b981; color: white; border-color: #10b981; transform: scale(1.1);
          }
          .timeline-label { font-size: 0.85rem; color: #6b7280; margin-top: 0.5rem; text-align: center; }
          .timeline-line {
            width: 50px; height: 2px; background: #e5e7eb; position: absolute; 
            top: 20px; left: 70px; z-index: -1;
          }
          .timeline-line.active { background: #10b981; }
        `}</style>
            </div>
        );
    };

    if (loading) return <div className="text-center py-20">Loading your orders...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        📦 Order Tracking
                    </h1>
                    <p className="text-xl text-gray-600">Track your laundry orders in real-time</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📦</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No orders found</h3>
                        <p className="text-gray-500">Your orders will appear here once created</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order.orderid} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">Order #{order.orderid}</h3>
                                        <p className="text-gray-500 mt-1">{new Date(order.orderdata).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.orderState)}`}>
                    {order.orderState.replace('_', ' ')}
                  </span>
                                </div>

                                <StatusTimeline order={order} />

                                <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Order Details</h4>
                                        <p><span className="font-medium">Weight:</span> {order.itemWeight?.toFixed(2)}kg</p>
                                        <p><span className="font-medium">Service:</span> {order.packTitle}</p>
                                        <p><span className="font-medium">Type:</span> {order.orderType.replace('_', ' ')}</p>
                                        <p><span className="font-bold text-2xl text-purple-600 mt-2">${order.totalAmount?.toFixed(2)}</span></p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Payment</h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            order.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                        }`}>
                      {order.paymentStatus}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerOrderTracking;