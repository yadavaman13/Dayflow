import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resume");
  const [profileData, setProfileData] = useState({
    name: "",
    loginId: "",
    email: "",
    mobile: "",
    company: "",
    department: "",
    manager: "",
    location: "",
  });

  const [aboutData, setAboutData] = useState({
    about: "",
    whatILove: "",
    interests: "",
  });

  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [salaryData, setSalaryData] = useState({
    monthWage: 0,
    yearlyWage: 0,
    workingDaysInWeek: 5,
    breakTime: 1,
  });

  const [privateInfo, setPrivateInfo] = useState({
    dateOfBirth: "",
    residingAddress: "",
    nationality: "",
    personalEmail: "",
    gender: "",
    maritalStatus: "",
    dateOfJoining: "",
  });

  const [salaryInfo, setSalaryInfo] = useState({
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    panNo: "",
    uanNo: "",
    empCode: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Set active tab based on role
    if (parsedUser.role === 'ADMIN' || parsedUser.role === 'HR') {
      setActiveTab('salary-info');
    }
    
    fetchProfileData();
  }, [navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userAPI.getUserProfile();
      console.log('Profile data:', response.data);
      const userData = response.data.data;

      // Set basic profile data
      setProfileData({
        name: userData.full_name || userData.name || "",
        loginId: userData.employee_id || "",
        email: userData.email || "",
        mobile: userData.phone || "",
        company: "ODOO India",
        department: userData.role || "",
        manager: "N/A",
        location: "India",
      });

      // Set about data (empty for now)
      setAboutData({
        about: "",
        whatILove: "",
        interests: "",
      });

      // Set skills and certifications (empty for now)
      setSkills([]);
      setCertifications([]);

      // Set salary data (empty for now)
      setSalaryData({
        monthWage: 0,
        yearlyWage: 0,
        workingDaysInWeek: 5,
        breakTime: 1,
      });

      // Set private info
      setPrivateInfo({
        dateOfBirth: "",
        residingAddress: "",
        nationality: "Indian",
        personalEmail: userData.email || "",
        gender: "",
        maritalStatus: "",
        dateOfJoining: userData.created_at?.split('T')[0] || "",
      });

      // Set salary info
      setSalaryInfo({
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        panNo: "",
        uanNo: "",
        empCode: userData.employee_id || "",
      });

    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      setError(error.response?.data?.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleAboutEdit = (field) => {
    console.log("Edit", field);
  };

  const handleAddSkill = () => {
    const skill = prompt("Enter new skill:");
    if (skill) {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCertification = () => {
    const cert = prompt("Enter new certification:");
    if (cert) {
      setCertifications([...certifications, cert]);
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  const tabs = [
    { id: "resume", label: "Resume" },
    { id: "private-info", label: "Private Info" },
    ...(user?.role === "admin" || user?.role === "payroll" ? [{ id: "salary-info", label: "Salary Info" }] : []),
    { id: "security", label: "Security" },
  ];

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#A24689] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500">Loading profile...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchProfileData}
              className="px-4 py-2 bg-[#A24689] text-white rounded-lg hover:bg-[#8a3a73] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-pink-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">{profileData.name}</h2>
                    <div className="h-px bg-gray-300 w-48"></div>
                  </div>
                  {profileData.loginId && (
                    <div>
                      <label className="text-sm text-gray-600">Employee ID</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.loginId}</p>
                    </div>
                  )}
                  {profileData.email && (
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.email}</p>
                    </div>
                  )}
                  {profileData.mobile && (
                    <div>
                      <label className="text-sm text-gray-600">Mobile</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.mobile}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {profileData.company && (
                    <div>
                      <label className="text-sm text-gray-600">Company</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.company}</p>
                    </div>
                  )}
                  {profileData.department && (
                    <div>
                      <label className="text-sm text-gray-600">Role</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.department}</p>
                    </div>
                  )}
                  {profileData.location && (
                    <div>
                      <label className="text-sm text-gray-600">Location</label>
                      <p className="text-base text-gray-900 mt-1">{profileData.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-8 py-4 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id ? "border-gray-900 text-gray-900 bg-gray-50" : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "resume" && (
              <div className="text-center py-12 text-gray-500">
                <p>No resume information available</p>
              </div>
            )}

            {activeTab === "salary-info" && (
              <div className="text-center py-12 text-gray-500">
                <p>No salary information available</p>
              </div>
            )}

            {activeTab === "private-info" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {privateInfo.personalEmail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900 pb-2">{privateInfo.personalEmail}</p>
                    </div>
                  )}

                  {privateInfo.nationality && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <p className="text-gray-900 pb-2">{privateInfo.nationality}</p>
                    </div>
                  )}

                  {privateInfo.dateOfJoining && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Joining
                      </label>
                      <p className="text-gray-900 pb-2">{new Date(privateInfo.dateOfJoining).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {salaryInfo.empCode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Code
                      </label>
                      <p className="text-gray-900 pb-2">{salaryInfo.empCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="text-center">
                    <div className="mb-6">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Password Security
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Keep your account secure by managing your password settings
                    </p>

                    <button
                      onClick={handleResetPassword}
                      className="px-8 py-3 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-lg"
                      style={{ backgroundColor: "#A24689" }}
                    >
                      Reset Password
                    </button>
                  </div>

                  {/* Security Tips */}
                  <div className="mt-10 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Password Security Tips
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Use a combination of letters, numbers, and special characters</li>
                      <li>• Avoid using personal information in your password</li>
                      <li>• Change your password regularly</li>
                      <li>• Don't share your password with anyone</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
