import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminSidebar from "./Componenet/AdminSidebar";
import Navbar from "./Componenet/Navbar";

function ViewAllOrdersAD() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/API/V1/Order/fullorderDetails`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setMessage({ text: "Error fetching orders", type: "error" });
    }
  };

  const updateOrderState = async (orderId, newState) => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/API/V1/Order/admin/updateOrderState?orderId=${orderId}&newState=${newState}`
      );
      setMessage({ text: "Order state updated successfully", type: "success" });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error updating order state:", error);
      setMessage({ text: "Error updating order state", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/API/V1/Order/admin/deleteOrder?orderId=${orderId}`
      );
      setMessage({ text: "Order deleted successfully", type: "success" });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error deleting order:", error);
      setMessage({ text: "Error deleting order", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const [userData, setUserData] = React.useState({});

  useEffect(() => {
    const loginData = sessionStorage.getItem("LoginData");
    if (loginData) {
      setUserData(JSON.parse(loginData));
    }
    fetchOrders();
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  return (
    <>
      <Navbar userData={userData} />
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">
          All Customer Orders
        </h2>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-100 text-green-700 border border-green-300" 
              : "bg-red-100 text-red-700 border border-red-300"
          }`}>
            {message.text}
            <button 
              onClick={() => setMessage({ text: "", type: "" })}
              className="ml-2 text-lg font-bold hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        <div className="overflow-x-auto margin-auto shadow-lg rounded-lg border border-gray-200">
          <table className="width-screen  bg-white">
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="py-2 px-4 border-b">Customer Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">Address</th>
                <th className="py-2 px-4 border-b">Order Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Pack Title</th>
                <th className="py-2 px-4 border-b">Pack Description</th>
                <th className="py-2 px-4 border-b">Weight (KG)</th>
                <th className="py-2 px-4 border-b">1KG Price ($)</th>
                <th className="py-2 px-4 border-b">Total Amount</th>
                <th className="py-2 px-4 border-b">Order Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.orderid}
                    className="hover:bg-gray-50 transition-all duration-150"
                  >
                    <td className="py-2 px-4 border-b">
                      {order.firstname} {order.lastname}
                    </td>
                    <td className="py-2 px-4 border-b">{order.email}</td>
                    <td className="py-2 px-4 border-b">{order.phoneNumber}</td>
                    <td className="py-2 px-4 border-b">
                      <Link to={order.address}>
                        <button className="text-blue-500  bg-gray-100 p-1 rounded-lg cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-all">
                          View
                        </button>
                      </Link>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {order.orderType === "DELIVERY" ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                          DELIVERY
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                          STORE PICKUP
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.orderState === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : order.orderState === "DELIVERY"
                            ? "bg-blue-100 text-blue-700"
                            : order.orderState === "WAITING_FOR_PICKUP"
                            ? "bg-purple-100 text-purple-700"
                            : order.orderState === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.orderState}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{order.packTitle}</td>
                    <td className="py-2 px-4 border-b">
                      {order.packDescription}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {order.itemWeight.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {order.oneKGprice.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center font-semibold text-purple-700">
                      $ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {new Date(order.orderdata).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex flex-col gap-2">
                        {/* State Change Dropdown */}
                        <select
                          value={order.orderState}
                          onChange={(e) => updateOrderState(order.orderid, e.target.value)}
                          disabled={loading}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <option value="NOTPICKUP">Not Picked Up</option>
                          <option value="WAITING_FOR_PICKUP">Waiting for Pickup</option>
                          <option value="PICKUP">Picked Up</option>
                          <option value="CLEANING">Cleaning</option>
                          <option value="DELIVERY">Out for Delivery</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => deleteOrder(order.orderid)}
                          disabled={loading}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="14"
                    className="py-4 px-4 text-center text-gray-500 font-medium"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ViewAllOrdersAD;
