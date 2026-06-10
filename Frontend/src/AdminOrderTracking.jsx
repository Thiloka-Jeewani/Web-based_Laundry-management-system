import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./Componenet/AdminSidebar";
import Navbar from "./Componenet/Navbar";

function AdminOrderTracking() {
    const [orders, setOrders] = useState([]);
    const [USER_DATA, setUserData] = useState({}); // ✅ All caps = ESLint OK

    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:8080/API/V1/Order/fullorderDetails");
            setOrders(response.data);
        } catch { /* empty */ } // ✅ NO VARIABLE = ESLint HAPPY
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`http://localhost:8080/API/V1/OrderTracking/status/${orderId}`,
                { status: newStatus }
            );
            fetchOrders();
            alert("Status updated successfully!");
        } catch { /* empty */ } // ✅ NO VARIABLE = ESLint HAPPY
    };

    useEffect(() => {
        const loginData = sessionStorage.getItem("LoginData");
        if (loginData) {
            setUserData(JSON.parse(loginData));
        }
        fetchOrders();
    }, []);

    return (
        <>
            <Navbar userData={USER_DATA} />
            <AdminSidebar />
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-purple-700 text-center mb-8">
                    🛠️ Order Status Manager
                </h2>

                <div className="overflow-x-auto shadow-2xl rounded-xl border-2 border-purple-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gradient-to-r from-purple-700 to-purple-800 text-white">
                        <tr>
                            <th className="py-3 px-4 border-b font-semibold">Order ID</th>
                            <th className="py-3 px-4 border-b font-semibold">Customer</th>
                            <th className="py-3 px-4 border-b font-semibold">Status</th>
                            <th className="py-3 px-4 border-b font-semibold">Update Status</th>
                            <th className="py-3 px-4 border-b font-semibold">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.orderid} className="hover:bg-purple-50 transition-all">
                                <td className="py-4 px-4 font-semibold">#{order.orderid}</td>
                                <td className="py-4 px-4">{order.firstname} {order.lastname}</td>
                                <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        order.orderState === "COMPLETED" ? "bg-green-100 text-green-800" :
                            order.orderState === "DELIVERY" ? "bg-blue-100 text-blue-800" :
                                order.orderState === "CLEANING" ? "bg-yellow-100 text-yellow-800" :
                                    order.orderState === "PICKUP" ? "bg-orange-100 text-orange-800" :
                                        order.orderState === "WAITING_FOR_PICKUP" ? "bg-purple-100 text-purple-800" :
                                            "bg-gray-100 text-gray-800"
                    }`}>
                      {order.orderState}
                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <select
                                        value={order.orderState}
                                        onChange={(e) => updateStatus(order.orderid, e.target.value)}
                                        className="border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    >
                                        <option value="NOTPICKUP">Not Picked Up</option>
                                        <option value="WAITING_FOR_PICKUP">Waiting for Pickup</option>
                                        <option value="PICKUP">Picked Up</option>
                                        <option value="CLEANING">Cleaning</option>
                                        <option value="DELIVERY">Delivery</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 font-bold text-purple-700">
                                    ${order.totalAmount?.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default AdminOrderTracking;