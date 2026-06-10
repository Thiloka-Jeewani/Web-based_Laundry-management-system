import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CustomerShowOrders() {
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [method, setMethod] = useState("");
    const [itemWeight, setItemWeight] = useState("");
    const [loading, setLoading] = useState(true);

    const paymentMethods = ["CASH_ON_DELIVERY", "CARD", "MOBILE_WALLET"];

    const orderFilters = [
        { key: "ALL", label: "All Orders", count: 0 },
        { key: "UNPAID", label: "Unpaid", count: 0 },
        { key: "PAID", label: "Paid", count: 0 },
        { key: "ACTIVE", label: "Active", count: 0 },
        { key: "COMPLETED", label: "Completed", count: 0 }
    ];

    const orderStatusSteps = {
        NOTPICKUP: ["Order Placed", "Payment Pending", "Waiting for Pickup", "In Progress", "Ready for Delivery"],
        WAITING_FOR_PICKUP: ["Order Placed", "Payment Complete", "Waiting for Pickup", "In Progress", "Ready for Delivery"],
        PICKUP: ["Order Placed", "Payment Complete", "Picked Up", "In Progress", "Ready for Delivery"],
        CLEANING: ["Order Placed", "Payment Complete", "Picked Up", "Cleaning", "Ready for Delivery"],
        DELIVERY: ["Order Placed", "Payment Complete", "Picked Up", "Cleaning", "Out for Delivery"],
        COMPLETED: ["Order Placed", "Payment Complete", "Picked Up", "Cleaning", "Completed"]
    };

    // Fixed: Removed unused orderType parameter
    const getStatusIndex = (orderState) => {
        switch (orderState) {
            case "NOTPICKUP": return 0;
            case "WAITING_FOR_PICKUP": return 2;
            case "PICKUP": return 2;
            case "CLEANING": return 3;
            case "DELIVERY": return 4;
            case "COMPLETED": return 4;
            default: return 0;
        }
    };

    const getOrderStatus = (order) => {
        if (order.orderState === "COMPLETED") return "Completed";
        if (order.orderState === "DELIVERY") return "Out for Delivery";
        if (order.orderState === "CLEANING") return "In Cleaning";
        if (order.orderState === "PICKUP") return "Picked Up";
        if (order.orderState === "WAITING_FOR_PICKUP") return "Waiting for Pickup";
        if (order.orderState === "NOTPICKUP" && order.paymentStatus === "PAID") return "Paid - Ready for Pickup";
        if (order.orderState === "NOTPICKUP") return "Pending Payment";
        return "Processing";
    };

    const fetchOrders = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:8080/API/V1/Order/uniqueOrders?id=${id}`
            );
            const ordersData = response.data || [];
            setOrders(ordersData);

            // Update filter counts
            const unpaidCount = ordersData.filter(order => !order.paymentStatus || order.paymentStatus === "UNPAID").length;
            const paidCount = ordersData.filter(order => order.paymentStatus === "PAID").length;
            const activeCount = ordersData.filter(order =>
                order.paymentStatus === "PAID" && order.orderState !== "COMPLETED"
            ).length;
            const completedCount = ordersData.filter(order => order.orderState === "COMPLETED").length;

            orderFilters[0].count = ordersData.length;
            orderFilters[1].count = unpaidCount;
            orderFilters[2].count = paidCount;
            orderFilters[3].count = activeCount;
            orderFilters[4].count = completedCount;

            applyFilter(activeFilter, ordersData);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = (filterKey, ordersList = orders) => {
        let filtered = [];

        switch (filterKey) {
            case "UNPAID":
                filtered = ordersList.filter(order => !order.paymentStatus || order.paymentStatus === "UNPAID");
                break;
            case "PAID":
                filtered = ordersList.filter(order => order.paymentStatus === "PAID");
                break;
            case "ACTIVE":
                filtered = ordersList.filter(order =>
                    order.paymentStatus === "PAID" && order.orderState !== "COMPLETED"
                );
                break;
            case "COMPLETED":
                filtered = ordersList.filter(order => order.orderState === "COMPLETED");
                break;
            default:
                filtered = ordersList;
        }

        setFilteredOrders(filtered);
        setActiveFilter(filterKey);
    };

    useEffect(() => {
        const loginData = sessionStorage.getItem("LoginData");
        if (loginData) {
            const parsedData = JSON.parse(loginData);
            setUserData(parsedData);
            fetchOrders(parsedData.id);
        }
    }, []);

    // ---- PAYMENT HANDLERS ----
    const handlePayClick = (order) => {
        setSelectedOrder(order);
        setShowPaymentDialog(true);
    };

    const handlePaymentSubmit = async () => {
        if (!method) {
            alert("Please select a payment method");
            return;
        }

        const paymentData = {
            method: method,
            amount: selectedOrder.totalAmount,
            orderId: selectedOrder.orderid,
        };

        console.log("Sending payment data:", paymentData);
        console.log("Selected order:", selectedOrder);

        try {
            await axios.post(
                "http://localhost:8080/API/V1/payment/createPayment",
                paymentData
            );
            alert("Payment successful!");
            setShowPaymentDialog(false);
            setMethod("");
            setSelectedOrder(null);
            // Refresh orders to show updated payment status
            fetchOrders(userData.id);
        } catch (error) {
            console.error("Payment error:", error);
            console.error("Error response:", error.response);
            console.error("Error data:", error.response?.data);
            const errorMessage = error.response?.data || error.message || "Payment failed!";
            alert(`Payment failed: ${errorMessage}`);
        }
    };

    // ---- EDIT HANDLERS ----
    const handleEditClick = (order) => {
        setSelectedOrder(order);
        setItemWeight(order.itemWeight);
        setShowEditDialog(true);
    };

    const handleUpdateOrder = async () => {
        if (!itemWeight || itemWeight <= 0) {
            alert("Please enter a valid item weight");
            return;
        }

        const updatedOrder = {
            orderid: selectedOrder.orderid,
            orderdata: selectedOrder.orderdata,
            totalAmount: parseFloat((itemWeight * selectedOrder.oneKGprice).toFixed(2)),
            itemWeight: parseFloat(itemWeight),
            customerid: selectedOrder.customerid,
            orderState: selectedOrder.orderState,
            orderType: selectedOrder.orderType,
        };

        try {
            await axios.put(
                "http://localhost:8080/API/V1/Order/updateOrder",
                updatedOrder
            );
            alert("Order updated successfully!");
            setShowEditDialog(false);
            setSelectedOrder(null);
            fetchOrders(userData.id);
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order!");
        }
    };

    // ---- DELETE HANDLER ----
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            await axios.delete(
                `http://localhost:8080/API/V1/Order/deleteOrder?id=${orderId}`
            );
            alert("Order deleted successfully!");
            fetchOrders(userData.id);
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete order!");
        }
    };

    // Fixed: Removed unused orderType parameter
    const StatusProgressBar = ({ orderState }) => {
        const currentStep = getStatusIndex(orderState);
        const steps = orderStatusSteps[orderState] || orderStatusSteps.NOTPICKUP;

        return (
            <div className="status-progress-bar">
                <div className="progress-line">
                    <div
                        className="progress-fill"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
                <div className="progress-steps">
                    {steps.map((step, index) => (
                        <div key={step} className="step-container">
                            <div
                                className={`step-indicator ${index <= currentStep ? 'active' : ''}`}
                            >
                                {index <= currentStep && (
                                    <span className="checkmark">✓</span>
                                )}
                            </div>
                            <span className={`step-label ${index <= currentStep ? 'active' : ''}`}>
                {step}
              </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const OrderCard = ({ order }) => (
        <div key={order.orderid} className="order-card">
            <div className="order-header">
                <div className="order-title-section">
                    <h3 className="order-title">{order.packTitle}</h3>
                    <p className="order-description">{order.packDescription}</p>
                    <div className="order-meta">
                        <span className="order-id">Order #: {order.orderid}</span>
                        <span className="order-status-badge">{getOrderStatus(order)}</span>
                    </div>
                </div>
                <div className="order-badges">
          <span className={`badge type-${order.orderType?.toLowerCase()}`}>
            {order.orderType}
          </span>
                    <span className={`badge state-${order.orderState?.toLowerCase()}`}>
            {order.orderState}
          </span>
                    <span className={`badge payment-${order.paymentStatus?.toLowerCase() || 'unpaid'}`}>
            {order.paymentStatus || "UNPAID"}
          </span>
                </div>
            </div>

            {/* Fixed: Removed orderType prop */}
            <StatusProgressBar orderState={order.orderState} />

            <div className="order-details">
                <div className="detail-row">
                    <span className="detail-label">Order Date:</span>
                    <span className="detail-value">
            {new Date(order.orderdata).toLocaleString()}
          </span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">
            {order.firstname} {order.lastname}
          </span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">
            {order.email} • {order.phoneNumber}
          </span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Item Weight:</span>
                    <span className="detail-value">{order.itemWeight} kg</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Price per KG:</span>
                    <span className="detail-value">${order.oneKGprice}</span>
                </div>

                <div className="detail-row total-amount">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value highlight">${order.totalAmount}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <Link to={order.address} className="map-link">
                        <button className="map-button">
                            📍 View Map
                        </button>
                    </Link>
                </div>
            </div>

            <div className="order-actions">
                {(!order.paymentStatus || order.paymentStatus === "UNPAID") && (
                    <button
                        onClick={() => handlePayClick(order)}
                        className="btn btn-primary"
                    >
                        💳 Pay Now
                    </button>
                )}

                {order.orderState === "NOTPICKUP" && order.paymentStatus !== "PAID" && (
                    <div className="action-buttons">
                        <button
                            onClick={() => handleEditClick(order)}
                            className="btn btn-secondary"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => handleDeleteOrder(order.orderid)}
                            className="btn btn-danger"
                        >
                            🗑️ Cancel
                        </button>
                    </div>
                )}

                {order.paymentStatus === "PAID" && order.orderState !== "DELIVERED" && (
                    <div className="tracking-info">
                        <div className="tracking-header">
                            <span className="tracking-title">📦 Order Tracking</span>
                            <span className="tracking-status">Active</span>
                        </div>
                        <p className="tracking-message">
                            Your order is being processed. You'll receive updates on the progress.
                        </p>
                    </div>
                )}

                {order.orderState === "DELIVERED" && (
                    <div className="completed-order">
                        <div className="completed-badge">✅ Order Delivered</div>
                        <p className="completed-message">
                            Thank you for choosing our service! We hope you're satisfied.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="customer-orders-container">
            <div className="orders-header">
                <h2>My Orders</h2>
                <p className="orders-subtitle">Track and manage your laundry orders</p>

                {/* Order Statistics */}
                <div className="order-stats">
                    <div className="stat-card">
                        <span className="stat-number">{orders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                    <div className="stat-card">
            <span className="stat-number">
              {orders.filter(order => order.paymentStatus === "PAID" && order.orderState !== "COMPLETED").length}
            </span>
                        <span className="stat-label">Active Orders</span>
                    </div>
                    <div className="stat-card">
            <span className="stat-number">
              {orders.filter(order => order.orderState === "COMPLETED").length}
            </span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="order-filters">
                {orderFilters.map((filter) => (
                    <button
                        key={filter.key}
                        className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
                        onClick={() => applyFilter(filter.key)}
                    >
                        <span className="filter-label">{filter.label}</span>
                        <span className="filter-count">{filter.count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            ) : !filteredOrders.length ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders found</h3>
                    <p>
                        {activeFilter === "ALL"
                            ? "You haven't placed any orders yet."
                            : `No ${orderFilters.find(f => f.key === activeFilter)?.label.toLowerCase()} orders found.`
                        }
                    </p>
                    {activeFilter !== "ALL" && (
                        <button
                            className="btn btn-primary"
                            onClick={() => applyFilter("ALL")}
                        >
                            View All Orders
                        </button>
                    )}
                </div>
            ) : (
                <div className="orders-grid">
                    {filteredOrders.map((order) => (
                        <OrderCard key={order.orderid} order={order} />
                    ))}
                </div>
            )}

            {/* ---- PAYMENT DIALOG ---- */}
            {showPaymentDialog && selectedOrder && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <h3>Complete Payment</h3>
                        <p className="payment-amount">Amount: ${selectedOrder.totalAmount}</p>

                        <div className="form-group">
                            <label>Select Payment Method</label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="form-select"
                            >
                                <option value="">-- Choose Method --</option>
                                {paymentMethods.map((m) => (
                                    <option key={m} value={m}>
                                        {m.replaceAll("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="dialog-actions">
                            <button
                                onClick={handlePaymentSubmit}
                                className="btn btn-success"
                            >
                                ✅ Confirm Payment
                            </button>
                            <button
                                onClick={() => setShowPaymentDialog(false)}
                                className="btn btn-cancel"
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- EDIT ORDER DIALOG ---- */}
            {showEditDialog && selectedOrder && (
                <div className="dialog-overlay">
                    <div className="dialog-content">
                        <h3>Edit Order</h3>

                        <div className="form-group">
                            <label>Item Weight (kg)</label>
                            <input
                                type="number"
                                value={itemWeight}
                                onChange={(e) => setItemWeight(e.target.value)}
                                className="form-input"
                                min="0.1"
                                step="0.1"
                            />
                        </div>

                        <div className="amount-preview">
                            <span>Total Amount: </span>
                            <span className="amount-value">
                ${(itemWeight * selectedOrder.oneKGprice).toFixed(2)}
              </span>
                        </div>

                        <div className="dialog-actions">
                            <button
                                onClick={handleUpdateOrder}
                                className="btn btn-success"
                            >
                                💾 Save Changes
                            </button>
                            <button
                                onClick={() => setShowEditDialog(false)}
                                className="btn btn-cancel"
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .customer-orders-container {
                    padding: 2rem;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .orders-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .orders-header h2 {
                    color: #1e293b;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .orders-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                }

                .order-stats {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    min-width: 120px;
                }

                .stat-number {
                    display: block;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: #64748b;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .order-filters {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .filter-tab {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-weight: 500;
                }

                .filter-tab.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .filter-count {
                    background: #64748b;
                    color: white;
                    padding: 0.25rem 0.5rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                }

                .filter-tab.active .filter-count {
                    background: rgba(255, 255, 255, 0.2);
                }

                .loading-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #64748b;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #64748b;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    color: #475569;
                    margin-bottom: 0.5rem;
                }

                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .order-card {
                    background: white;
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e2e8f0;
                    transition: all 0.3s ease;
                }

                .order-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                }

                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .order-title-section {
                    flex: 1;
                }

                .order-title {
                    color: #1e293b;
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .order-description {
                    color: #64748b;
                    font-style: italic;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }

                .order-meta {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .order-id {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    font-family: monospace;
                }

                .order-status-badge {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.25rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .order-badges {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-end;
                }

                .badge {
                    padding: 0.4rem 0.8rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .badge.type-delivery {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge.type-pickup {
                    background: #fef3c7;
                    color: #92400e;
                }

                .badge.state-notpickup {
                    background: #fecaca;
                    color: #dc2626;
                }

                .badge.state-pickup {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .badge.state-inprogress {
                    background: #fef3c7;
                    color: #92400e;
                }

                .badge.state-delivered {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge.payment-paid {
                    background: #dcfce7;
                    color: #166534;
                }

                .badge.payment-unpaid {
                    background: #fecaca;
                    color: #dc2626;
                }

                /* Progress Bar Styles */
                .status-progress-bar {
                    margin: 1.5rem 0;
                }

                .progress-line {
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 2px;
                    position: relative;
                    margin: 0.5rem 0 1.5rem;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    border-radius: 2px;
                    transition: width 0.5s ease;
                }

                .progress-steps {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                }

                .step-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                }

                .step-indicator {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.5rem;
                    transition: all 0.3s ease;
                }

                .step-indicator.active {
                    background: #3b82f6;
                }

                .checkmark {
                    color: white;
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .step-label {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    text-align: center;
                    transition: color 0.3s ease;
                }

                .step-label.active {
                    color: #3b82f6;
                    font-weight: 500;
                }

                .order-details {
                    space-y: 0.75rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f1f5f9;
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .detail-row.total-amount {
                    border-top: 2px solid #e2e8f0;
                    margin-top: 0.5rem;
                    padding-top: 1rem;
                }

                .detail-label {
                    color: #64748b;
                    font-weight: 500;
                }

                .detail-value {
                    color: #1e293b;
                    font-weight: 600;
                }

                .detail-value.highlight {
                    color: #dc2626;
                    font-size: 1.1rem;
                }

                .map-button {
                    background: #f1f5f9;
                    color: #3b82f6;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .map-button:hover {
                    background: #e0f2fe;
                }

                .order-actions {
                    margin-top: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .action-buttons {
                    display: flex;
                    gap: 0.75rem;
                }

                .tracking-info, .completed-order {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 12px;
                    border-left: 4px solid #3b82f6;
                }

                .completed-order {
                    border-left-color: #10b981;
                }

                .tracking-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .tracking-title {
                    font-weight: 600;
                    color: #1e293b;
                }

                .tracking-status {
                    background: #3b82f6;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .tracking-message, .completed-message {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .completed-badge {
                    background: #10b981;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    justify-content: center;
                }

                .btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .btn-primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: #10b981;
                    color: white;
                    flex: 1;
                }

                .btn-secondary:hover {
                    background: #059669;
                }

                .btn-danger {
                    background: #ef4444;
                    color: white;
                    flex: 1;
                }

                .btn-danger:hover {
                    background: #dc2626;
                }

                .btn-success {
                    background: #10b981;
                    color: white;
                }

                .btn-success:hover {
                    background: #059669;
                }

                .btn-cancel {
                    background: #6b7280;
                    color: white;
                }

                .btn-cancel:hover {
                    background: #4b5563;
                }

                /* Dialog Styles */
                .dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .dialog-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                }

                .dialog-content h3 {
                    color: #1e293b;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #374151;
                    font-weight: 500;
                }

                .form-select, .form-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: border-color 0.2s ease;
                }

                .form-select:focus, .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .payment-amount {
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #dc2626;
                    margin-bottom: 1.5rem;
                }

                .amount-preview {
                    text-align: center;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .amount-value {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #dc2626;
                }

                .dialog-actions {
                    display: flex;
                    gap: 0.75rem;
                }

                .dialog-actions .btn {
                    flex: 1;
                }

                @media (max-width: 768px) {
                    .customer-orders-container {
                        padding: 1rem;
                    }

                    .order-stats {
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                    }

                    .stat-card {
                        width: 100%;
                        max-width: 200px;
                    }

                    .order-filters {
                        flex-direction: column;
                    }

                    .orders-grid {
                        grid-template-columns: 1fr;
                    }

                    .order-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .order-badges {
                        flex-direction: row;
                        align-self: stretch;
                        justify-content: flex-start;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }

                    .dialog-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

export default CustomerShowOrders;