// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Topbar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const profileMenuRef = useRef(null);

  // Mock user for now (replace with your own auth system)
  const user = {
    name: "User",
    role: "Admin",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear any stored auth data and navigate to login
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMyProfile = () => {
    setShowProfileMenu(false);
    navigate("/dashboard/profile");
  };

  const handleCheckIn = () => {
    setShowCheckInModal(true);
    setLocationError(null);
    setLocation(null);
    getLocation();
  };

  const handleCloseModal = () => {
    setShowCheckInModal(false);
    setLocation(null);
    setLocationError(null);
    setLoading(false);
  };

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setLocation(locationData);
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        let errorMessage = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "An unknown error occurred";
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCheckInSubmit = async () => {
    if (!location) {
      alert(
        "⚠️ Please wait for location to be detected or allow location access."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/attendance/check-in", {
        mode_id: 1,
        location: {
          type: "web",
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        remarks: `Checked in via web at ${location.latitude.toFixed(
          6
        )}, ${location.longitude.toFixed(6)}`,
      });

      if (response.data.success) {
        alert("✅ Checked in successfully!");
        setCheckInStatus("checked-in");
        setShowCheckInModal(false);
        setLocation(null);
      }
    } catch (error) {
      console.error("Error checking in:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check in. You may have already checked in today.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!location) {
      alert(
        "⚠️ Please wait for location to be detected or allow location access."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/attendance/check-out", {
        location: {
          type: "web",
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        remarks: `Checked out via web at ${location.latitude.toFixed(
          6
        )}, ${location.longitude.toFixed(6)}`,
      });

      if (response.data.success) {
        const hours = response.data.data.working_hours || 0;
        alert(
          `✅ Checked out successfully! You worked ${parseFloat(hours).toFixed(
            2
          )} hours today.`
        );
        setCheckInStatus("checked-out");
        setShowCheckInModal(false);
        setLocation(null);
      }
    } catch (error) {
      console.error("Error checking out:", error);
      console.error("Error response:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check out.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Page title */}
        <div className="flex items-end gap-2">
          <svg
            className="w-5 h-5 text-gray-600 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h2 className="text-base font-semibold text-gray-900">Dashboard</h2>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Check In/Out Button */}
          <button
            onClick={handleCheckIn}
            className="px-4 py-2 bg-[#A24689] text-white rounded-lg hover:bg-[#8a3a73] transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Check In/Out
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-4 border-l border-gray-200"
            >
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role || "Employee"}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full border-2 border-gray-200 bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-700">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                <div className="py-1">
                  <button
                    onClick={handleMyProfile}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Profile
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check In/Out Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Mark Attendance
            </h3>

            {/* Location Status */}
            <div className="mb-6">
              {loading && !location && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Detecting your location...
                    </p>
                    <p className="text-xs text-blue-700">
                      Please allow location access
                    </p>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      Location Error
                    </p>
                    <p className="text-xs text-red-700">{locationError}</p>
                    <button
                      onClick={getLocation}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {location && !locationError && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Location Detected
                    </p>
                    <p className="text-xs text-green-700">
                      {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Accuracy: ~{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              Choose whether you want to check in or check out.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCheckInSubmit}
                disabled={loading || !location}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && location ? "Processing..." : "Check In"}
              </button>
              <button
                onClick={handleCheckOutSubmit}
                disabled={loading || !location}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && location ? "Processing..." : "Check Out"}
              </button>
            </div>
            <button
              onClick={handleCloseModal}
              className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
