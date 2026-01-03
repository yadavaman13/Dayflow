import { useState, useEffect } from "react";
import { leaveAPI } from "../services/api";

export default function TimeOff() {
  const [activeTab, setActiveTab] = useState("timeOff");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    paid_leave_balance: 24,
    sick_leave_balance: 7
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    durationType: "",
    description: "",
    contactNumber: "",
    document: null,
  });

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isHROrAdmin = user.role === "HR" || user.role === "ADMIN";

  // Fetch time off requests, leave types and leave balance on mount
  useEffect(() => {
    fetchTimeOffRequests();
    fetchLeaveBalance();
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveAPI.getLeaveTypes();
      if (response.data.success) {
        setLeaveTypes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchTimeOffRequests = async () => {
    try {
      setLoading(true);
      // HR/Admin can see all leaves, employees see their own
      const response = isHROrAdmin 
        ? await leaveAPI.getAllLeaves()
        : await leaveAPI.getMyLeaves();
      if (response.data.success) {
        setTimeOffRequests(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching time off requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveAPI.getLeaveBalance();
      if (response.data.success) {
        const balances = response.data.data || [];
        // Calculate totals from balance array
        let paidBalance = 0;
        let sickBalance = 0;
        
        balances.forEach(b => {
          const code = b.code?.toUpperCase();
          const leaveType = b.leave_type?.toLowerCase() || '';
          
          if (code === 'SL' || leaveType.includes('sick')) {
            sickBalance = parseFloat(b.remaining_days) || 0;
          } else if (code !== 'UL') {
            // Add all non-unpaid leave to paid balance
            paidBalance += parseFloat(b.remaining_days) || 0;
          }
        });
        
        setLeaveBalance({
          paid_leave_balance: paidBalance > 0 ? paidBalance : 24,
          sick_leave_balance: sickBalance > 0 ? sickBalance : 7
        });
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    }
  };

  const handleNewRequest = () => {
    setShowNewRequestModal(true);
  };

  const handleCloseNewRequestModal = () => {
    setShowNewRequestModal(false);
    setFormData({
      leaveType: "",
      fromDate: "",
      toDate: "",
      durationType: "",
      description: "",
      contactNumber: "",
      document: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      document: e.target.files[0],
    }));
  };

  const handleApplySuggestion = (suggestedDates) => {
    setFormData((prev) => ({
      ...prev,
      fromDate: suggestedDates.fromDate,
      toDate: suggestedDates.toDate
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.durationType || !formData.description) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      // Calculate total days
      const startDate = new Date(formData.fromDate);
      const endDate = new Date(formData.toDate);
      const diffTime = Math.abs(endDate - startDate);
      let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Adjust for half day
      if (formData.durationType === 'Half Day') {
        totalDays = totalDays * 0.5;
      }

      // Find leave type id from selected leave type name
      const selectedLeaveType = leaveTypes.find(lt => lt.name === formData.leaveType || lt.code === formData.leaveType);
      const leaveTypeId = selectedLeaveType?.id || 1; // Default to 1 if not found

      const submitData = {
        leave_type_id: leaveTypeId,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        total_days: totalDays,
        reason: `${formData.description}\n\nContact: ${formData.contactNumber}`,
        supporting_document_url: null // File upload can be added later
      };

      const response = await leaveAPI.applyLeave(submitData);

      if (response.data.success) {
        alert("Time off request submitted successfully!");
        handleCloseNewRequestModal();
        fetchTimeOffRequests();
        fetchLeaveBalance();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.approveLeave(selectedRequest.id, {});

      if (response.data.success) {
        alert("Request Approved");
        handleCloseModal();
        fetchTimeOffRequests();
        fetchLeaveBalance();
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert(error.response?.data?.message || "Failed to approve request");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.rejectLeave(selectedRequest.id, {});

      if (response.data.success) {
        alert("Request Rejected");
        handleCloseModal();
        fetchTimeOffRequests();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert(error.response?.data?.message || "Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter requests based on search query
  const filteredRequests = timeOffRequests.filter(request =>
    request.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.leave_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get employee name - use from request or fallback to logged in user
  const getEmployeeName = (request) => {
    return request.employee_name || user.name || user.full_name || 'You';
  };

  return (
    <>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Time Off</h1>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A24689] focus:border-transparent"
              />
            </div>
          </div>

          {/* Apply for Time Off Button */}
          <button
            onClick={handleNewRequest}
            className="px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90 active:opacity-80 transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
            style={{ backgroundColor: "#A24689" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Apply for Time Off
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Time Off Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paid Time Off Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Available paid time off
            </h3>
            <p className="text-4xl font-bold text-gray-900">
              {leaveBalance.paid_leave_balance} <span className="text-2xl font-semibold">Days</span>
            </p>
          </div>

          {/* Sick Time Off Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              Available sick time off
            </h3>
            <p className="text-4xl font-bold text-gray-900">
              {leaveBalance.sick_leave_balance} <span className="text-2xl font-semibold">Days</span>
            </p>
          </div>
        </div>

        {/* Time Off Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-[15%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="w-[15%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Start Date
                </th>
                <th className="w-[15%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  End Date
                </th>
                <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Time off Type
                </th>
                <th className="w-[15%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="w-[20%] px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No time off requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {getEmployeeName(request)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {formatDate(request.start_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {formatDate(request.end_date)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-blue-600 font-medium">
                        {request.leave_type} Time Off
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`capitalize px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        request.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                        }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-sm font-medium hover:underline"
                          style={{ color: "#A24689" }}
                        >
                          View details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for viewing request details */}
      {showModal && selectedRequest && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">
                Time Off Request Details
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-2 gap-8 px-8 py-6">
              {/* Left Column - Employee Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Employee Information
                </h3>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Employee Name</p>
                  <p className="text-base font-medium text-gray-900">
                    {getEmployeeName(selectedRequest)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(selectedRequest.start_date)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(selectedRequest.end_date)}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Time off Type</p>
                  <p className="text-base font-medium text-blue-600">
                    {selectedRequest.leave_type} Time Off
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Total Days</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedRequest.total_days} day(s)
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-base font-medium capitalize ${
                    selectedRequest.status === 'APPROVED' ? 'text-green-600' :
                    selectedRequest.status === 'REJECTED' ? 'text-red-600' :
                    'text-yellow-600'
                    }`}>
                    {selectedRequest.status}
                  </p>
                </div>

                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="text-base font-medium text-gray-900 text-right max-w-[250px]">
                    {selectedRequest.reason || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Request Details
                </h3>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Applied On</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedRequest.applied_at ? new Date(selectedRequest.applied_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Pay Type</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedRequest.pay_type || 'PAID'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-gray-200">
              {selectedRequest.status === 'PENDING' && isHROrAdmin && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                    style={{ backgroundColor: "#A24689" }}
                  >
                    {loading ? 'Processing...' : 'Approve'}
                  </button>
                </>
              )}
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Form Modal */}
      {showNewRequestModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
          onClick={handleCloseNewRequestModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-2xl font-semibold text-gray-900">
                Apply for Leave
              </h2>
              <button
                onClick={handleCloseNewRequestModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRequest} className="px-8 py-6">
              <div className="space-y-5">
                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.length > 0 ? (
                      leaveTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Earned Leave">Earned Leave</option>
                        <option value="Unpaid Leave">Unpaid Leave</option>
                      </>
                    )}
                  </select>
                </div>

                {/* From Date and To Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* AI Smart Scheduling Assistant - Removed */}
                {/* <SmartSchedulingAssistant
                  formData={formData}
                  onApplySuggestion={handleApplySuggestion}
                /> */}

                {/* Duration Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="durationType"
                    value={formData.durationType}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select Duration Type</option>
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows="4"
                    placeholder="Please provide a description for your leave request..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your contact number"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 10 digits</p>
                </div>

                {/* Attach Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Document{" "}
                    {formData.leaveType === 'Sick' ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required={formData.leaveType === 'Sick'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A24689] focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#A24689] file:text-white hover:file:bg-[#8a3a72] file:cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.leaveType === 'Sick'
                      ? '⚠️ Medical certificate required for sick leave (PDF, JPG, PNG, DOC - Max 5MB)'
                      : 'Medical proof, etc. (PDF, JPG, PNG, DOC - Max 5MB)'}
                  </p>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseNewRequestModal}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  style={{ backgroundColor: "#A24689" }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

