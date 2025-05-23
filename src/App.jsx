import {
  Activity,
  AlertCircle,
  AlignLeft,
  Award,
  BarChart3,
  BarChartHorizontalBig,
  BookCopy,
  BookOpen,
  Briefcase,
  Building,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Filter,
  Gift,
  History,
  Landmark,
  ListChecks,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  PieChart,
  PlusCircle,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  TrendingUp,
  UserCircle,
  UserPlus,
  Users,
  Users2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// AU Dominant Color
const AU_RED = "#C20000";
const AU_RED_DARKER = "#A00000";
const AU_RED_LIGHTER = "#FAD7D7";

// --- Mock Data (For initial state / fallback if API fails, or for seeding backend) ---
const MOCK_INTERNAL_SCHOLARSHIPS_INITIAL = [
  {
    id: "int_sch001",
    internalName: "General Merit Scholarship Fund A",
    description:
      "For students with excellent academic records across all faculties. Committee to assign based on top percentile.",
    type: "Merit-based",
    coverage: "Partial - $2000/year (covers 2 semesters)",
    duration: "Renewable Semesterly, up to 8 semesters",
    eligibilityCriteria: {
      minCGPA: 3.7,
      minSGPA: 3.5,
      minEntryPoints: 16,
      programs: ["Any"],
      nationalities: ["Any"],
      gender: "Any",
    },
    availableSlots: 15,
    fundSource: "General Endowment Fund",
    allocatedAmount: 1000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  // ... (other seed data can be kept here for reference or initial frontend state before API loads)
];
const MOCK_FUND_SOURCES_INITIAL = [
  {
    id: "fund001",
    name: "General Endowment Fund",
    totalAmount: 150000,
    description: "Multi-purpose fund for various scholarships.",
    createdAt: new Date().toISOString(),
  },
  // ...
];
const MOCK_GENERAL_APPLICATIONS_INITIAL = [
  {
    id: "gen_app001",
    studentName: "Tariro Moyo",
    studentId: "AU2025001",
    program: "Computer Science",
    yearOfStudy: 1,
    semesterOfStudy: 1,
    nationality: "Zimbabwe",
    cgpa: null,
    sgpa: null,
    entryPoints: 17,
    motivation: "Passionate about tech.",
    financialStatement: "Low income.",
    documents: ["T1.pdf"],
    status: "Submitted",
    assignedScholarshipId: null,
    awardDetails: null,
    submissionDate: "2025-03-15T00:00:00Z",
    gender: "Female",
    demonstratesFinancialNeed: true,
    createdAt: new Date().toISOString(),
  },
  // ...
];
// --- End Mock Data ---

const NEW_STUDENT_DEMO_ID = "NEW_APPLICANT_DEMO";

const mockPrograms = [
  "Accounting",
  "Agribusiness Management",
  "Agriculture",
  "Business Administration",
  "Chemistry",
  "Civil Engineering",
  "Computer Science",
  "Economics",
  "Education",
  "Electrical Engineering",
  "Environmental Science",
  "Finance",
  "Health Sciences",
  "Hospitality & Tourism Management",
  "International Relations",
  "Law",
  "Marketing",
  "Mathematics",
  "Mechanical Engineering",
  "Nursing",
  "Peace, Leadership & Governance",
  "Physics",
  "Psychology",
  "Public Administration",
  "Social Work",
  "Sociology",
  "Theology",
];
const mockNationalities = [
  "Algerian",
  "Angolan",
  "Beninese",
  "Motswana",
  "Burkinabé",
  "Burundian",
  "Cabo Verdean",
  "Cameroonian",
  "Central African",
  "Chadian",
  "Comoran",
  "Congolese (DRC)",
  "Congolese (ROC)",
  "Ivorian",
  "Djiboutian",
  "Egyptian",
  "Equatorial Guinean",
  "Eritrean",
  "Eswatini",
  "Ethiopian",
  "Gabonese",
  "Gambian",
  "Ghanaian",
  "Guinean",
  "Guinea-Bissauan",
  "Kenyan",
  "Basotho",
  "Liberian",
  "Libyan",
  "Malagasy",
  "Malawian",
  "Malian",
  "Mauritanian",
  "Mauritian",
  "Moroccan",
  "Mozambican",
  "Namibian",
  "Nigerien",
  "Nigerian",
  "Rwandan",
  "Sahrawi",
  "São Toméan",
  "Senegalese",
  "Seychellois",
  "Sierra Leonean",
  "Somali",
  "South African",
  "South Sudanese",
  "Sudanese",
  "Tanzanian",
  "Togolese",
  "Tunisian",
  "Ugandan",
  "Zambian",
  "Zimbabwean",
];

// Base URL for your backend API
const API_BASE_URL = "http://localhost:3001/api"; // Using a full placeholder URL

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [currentView, setCurrentView] = useState("dashboard");
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [authToken, setAuthToken] = useState(null); // For storing JWT or session token

  const [studentApplication, setStudentApplication] = useState(null);
  const [studentAwardHistory, setStudentAwardHistory] = useState([]);
  const [showGeneralApplyModal, setShowGeneralApplyModal] = useState(false);
  const [motivationText, setMotivationText] = useState("");
  const [motivationSuggestion, setMotivationSuggestion] = useState("");
  const [motivationLoading, setMotivationLoading] = useState(false);
  const [motivationError, setMotivationError] = useState("");

  const [internalScholarships, setInternalScholarships] = useState([]);
  const [applicationsToReview, setApplicationsToReview] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedInternalScholarship, setSelectedInternalScholarship] =
    useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningScholarshipId, setAssigningScholarshipId] = useState("");

  const [descriptionSuggestion, setDescriptionSuggestion] = useState("");
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");

  const [fundSources, setFundSources] = useState([]);

  const [loadingScholarships, setLoadingScholarships] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingFundSources, setLoadingFundSources] = useState(true);
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false); // To manage initial auth check

  // --- API Helper Function ---
  const fetchAPI = async (endpoint, options = {}) => {
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorResponseMessage = `API request failed for ${endpoint} with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorResponseMessage =
            errorData.message ||
            errorData.error ||
            JSON.stringify(errorData) ||
            errorResponseMessage;
        } catch (jsonError) {
          try {
            const textError = await response.text();
            errorResponseMessage =
              textError || response.statusText || errorResponseMessage;
          } catch (textParseError) {
            errorResponseMessage = response.statusText || errorResponseMessage;
          }
        }
        throw new Error(errorResponseMessage);
      }
      return response.json();
    } catch (error) {
      const displayMessage =
        error && error.message
          ? error.message
          : `An unspecified error occurred. Check console for details.`;
      console.error(`API Error (${endpoint}):`, error);
      alert(
        `API Communication Error for ${endpoint}: ${displayMessage}. Please ensure the backend is running or check network.`
      );
      throw new Error(displayMessage);
    }
  };

  // --- Authentication ---
  useEffect(() => {
    const storedToken = localStorage.getItem("ssms_auth_token");
    const storedRole = localStorage.getItem("ssms_user_role");
    const storedStudentId = localStorage.getItem("ssms_student_id");

    if (storedToken && storedRole) {
      setAuthToken(storedToken);
      setUserRole(storedRole);
      setIsAuthenticated(true);
      if (storedStudentId) setLoggedInStudentId(storedStudentId);
    }
    setIsAuthCheckComplete(true);
  }, []);

  // Fetch Internal Scholarships
  useEffect(() => {
    if (!isAuthCheckComplete) return;
    if (
      !isAuthenticated &&
      !(userRole === "admin" || userRole === "superadmin")
    )
      return;

    setLoadingScholarships(true);
    fetchAPI("/scholarships/internal")
      .then((data) => {
        setInternalScholarships(data || []);
      })
      .catch((error) => {
        setInternalScholarships(MOCK_INTERNAL_SCHOLARSHIPS_INITIAL);
      })
      .finally(() => setLoadingScholarships(false));
  }, [isAuthenticated, isAuthCheckComplete, userRole, authToken]);

  // Fetch General Applications (for Admin/Superadmin)
  useEffect(() => {
    if (!isAuthCheckComplete) return;
    if (
      !isAuthenticated ||
      (userRole !== "admin" && userRole !== "superadmin")
    ) {
      setApplicationsToReview([]);
      setLoadingApplications(false);
      return;
    }
    setLoadingApplications(true);
    fetchAPI("/applications/general")
      .then((data) => {
        setApplicationsToReview(data || []);
      })
      .catch((error) => {
        setApplicationsToReview(MOCK_GENERAL_APPLICATIONS_INITIAL);
      })
      .finally(() => setLoadingApplications(false));
  }, [isAuthenticated, isAuthCheckComplete, userRole, authToken]);

  // Fetch Fund Sources (for Admin/Superadmin)
  useEffect(() => {
    if (!isAuthCheckComplete) return;
    if (
      !isAuthenticated ||
      (userRole !== "admin" && userRole !== "superadmin")
    ) {
      setFundSources([]);
      setLoadingFundSources(false);
      return;
    }
    setLoadingFundSources(true);
    fetchAPI("/funds")
      .then((data) => {
        setFundSources(data || []);
      })
      .catch((error) => {
        setFundSources(MOCK_FUND_SOURCES_INITIAL);
      })
      .finally(() => setLoadingFundSources(false));
  }, [isAuthenticated, isAuthCheckComplete, userRole, authToken]);

  // Fetch Student Specific Data (Application and Award History)
  useEffect(() => {
    if (
      !isAuthenticated ||
      !(userRole === "newapplicant" || userRole === "currentstudent") ||
      !loggedInStudentId ||
      loggedInStudentId === NEW_STUDENT_DEMO_ID
    ) {
      setStudentApplication(null);
      setStudentAwardHistory([]);
      return;
    }
    setLoadingStudentData(true);
    Promise.all([
      fetchAPI(`/applications/student/${loggedInStudentId}`).catch((e) => {
        console.error(`Failed to fetch student application: ${e.message}`);
        return null;
      }),
      fetchAPI(`/awards/student/${loggedInStudentId}/history`).catch((e) => {
        console.error(`Failed to fetch award history: ${e.message}`);
        return [];
      }),
    ])
      .then(([appData, historyData]) => {
        setStudentApplication(appData);
        setStudentAwardHistory(historyData || []);
      })
      .catch((error) => {
        setStudentApplication(null);
        setStudentAwardHistory([]);
      })
      .finally(() => setLoadingStudentData(false));
  }, [isAuthenticated, userRole, loggedInStudentId, authToken]);

  useEffect(() => {
    if (
      isAuthenticated &&
      (userRole === "newapplicant" || userRole === "currentstudent") &&
      loggedInStudentId
    ) {
      setCurrentView("dashboard");
    } else if (
      isAuthenticated &&
      (userRole === "admin" ||
        userRole === "superadmin" ||
        userRole === "donor")
    ) {
      setCurrentView("dashboard");
    }
  }, [isAuthenticated, userRole, loggedInStudentId, studentApplication]);

  const handleLogin = async (
    attemptedRoleOnLoginPage,
    userIdInput,
    callback
  ) => {
    const userId = userIdInput.trim();

    let validExistingStudentIdsFromApi = [];
    if (attemptedRoleOnLoginPage === "student") {
      try {
        validExistingStudentIdsFromApi =
          (await fetchAPI("/applications/student-ids").catch(() => [])) || [];
      } catch (e) {
        console.warn(
          "Could not fetch student IDs for mock login, proceeding with empty list."
        );
      }
    }

    try {
      let loginSuccess = false;
      let determinedRole = "";
      let determinedStudentId = null;

      if (attemptedRoleOnLoginPage === "student") {
        if (
          userId.toLowerCase() === "newstudent" ||
          userId === NEW_STUDENT_DEMO_ID
        ) {
          determinedRole = "newapplicant";
          determinedStudentId = NEW_STUDENT_DEMO_ID;
          loginSuccess = true;
        } else if (validExistingStudentIdsFromApi.includes(userId)) {
          determinedRole = "currentstudent";
          determinedStudentId = userId;
          loginSuccess = true;
        } else if (userId.startsWith("AU")) {
          determinedRole = "currentstudent";
          determinedStudentId = userId;
          loginSuccess = true;
        }
      } else if (attemptedRoleOnLoginPage === "staff") {
        if (userId.toLowerCase() === "admin") {
          determinedRole = "admin";
          loginSuccess = true;
        } else if (userId.toLowerCase() === "superadmin") {
          determinedRole = "superadmin";
          loginSuccess = true;
        } else if (userId.toLowerCase() === "donor") {
          determinedRole = "donor";
          loginSuccess = true;
        }
      }

      if (loginSuccess) {
        setUserRole(determinedRole);
        setLoggedInStudentId(determinedStudentId);
        setIsAuthenticated(true);
        const mockToken = `mock_token_for_${userId}_${Date.now()}`;
        setAuthToken(mockToken);
        localStorage.setItem("ssms_auth_token", mockToken);
        localStorage.setItem("ssms_user_role", determinedRole);
        if (determinedStudentId)
          localStorage.setItem("ssms_student_id", determinedStudentId);
        if (callback) callback();
      } else {
        if (callback) callback("Invalid credentials or role for demo.");
      }
    } catch (error) {
      if (callback) callback(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    setLoggedInStudentId(null);
    setAuthToken(null);
    localStorage.removeItem("ssms_auth_token");
    localStorage.removeItem("ssms_user_role");
    localStorage.removeItem("ssms_student_id");
  };

  const handleHeaderRoleChange = async (newRole) => {
    setUserRole(newRole);
    setSelectedApplication(null);
    setSelectedInternalScholarship(null);
    setMotivationSuggestion("");
    setDescriptionSuggestion("");

    if (newRole === "newapplicant") {
      setLoggedInStudentId(NEW_STUDENT_DEMO_ID);
      setCurrentView("dashboard");
    } else if (newRole === "currentstudent") {
      try {
        const studentIds =
          (await fetchAPI("/applications/student-ids").catch(() => [])) || [];
        setLoggedInStudentId(
          studentIds.length > 0 ? studentIds[0] : "AU_DEMO_STUDENT_001"
        );
      } catch (e) {
        setLoggedInStudentId("AU_DEMO_STUDENT_001");
      }
      setCurrentView("dashboard");
    } else {
      setStudentApplication(null);
      setStudentAwardHistory([]);
      setLoggedInStudentId(null);
      setCurrentView("dashboard");
    }
  };

  const openGeneralApplyModal = () => {
    setMotivationText("");
    setMotivationSuggestion("");
    setMotivationError("");
    setShowGeneralApplyModal(true);
  };

  const closeGeneralApplyModal = () => setShowGeneralApplyModal(false);

  const submitGeneralApplication = async (formData) => {
    const studentIdForApp =
      loggedInStudentId === NEW_STUDENT_DEMO_ID
        ? formData.studentId
        : loggedInStudentId;
    const newApplicationData = {
      studentName: formData.studentName,
      studentId: studentIdForApp,
      program: formData.program,
      yearOfStudy: parseInt(formData.yearOfStudy),
      semesterOfStudy: parseInt(formData.semesterOfStudy),
      nationality: formData.nationality,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
      sgpa: formData.sgpa ? parseFloat(formData.sgpa) : null,
      entryPoints: formData.entryPoints ? parseInt(formData.entryPoints) : null,
      motivation: formData.motivation,
      financialStatement: formData.financialStatement,
      documents: ["DemoDoc1.pdf", "DemoDoc2.pdf"],
      status: "Submitted",
      gender: formData.gender,
      demonstratesFinancialNeed: formData.demonstratesFinancialNeed === "yes",
    };

    try {
      const existingApp =
        applicationsToReview.find((app) => app.studentId === studentIdForApp) ||
        studentApplication;
      let savedApplication;
      if (existingApp && existingApp.id) {
        savedApplication = await fetchAPI(
          `/applications/general/${existingApp.id}`,
          { method: "PUT", body: JSON.stringify(newApplicationData) }
        );
        alert("General Application Updated Successfully!");
      } else {
        savedApplication = await fetchAPI("/applications/general", {
          method: "POST",
          body: JSON.stringify(newApplicationData),
        });
        alert("General Application Submitted Successfully!");
      }

      if (userRole === "admin" || userRole === "superadmin") {
        setApplicationsToReview((prev) =>
          existingApp
            ? prev.map((a) =>
                a.id === savedApplication.id ? savedApplication : a
              )
            : [...prev, savedApplication]
        );
      } else {
        setStudentApplication(savedApplication);
      }

      if (
        userRole === "newapplicant" &&
        loggedInStudentId === NEW_STUDENT_DEMO_ID
      ) {
        setUserRole("currentstudent");
        setLoggedInStudentId(studentIdForApp);
        localStorage.setItem("ssms_user_role", "currentstudent");
        localStorage.setItem("ssms_student_id", studentIdForApp);
      }
      closeGeneralApplyModal();
    } catch (error) {
      /* Error already handled by fetchAPI */
    }
  };

  const callBackendGeminiAPI = async (prompt) => {
    try {
      const response = await fetchAPI("/generate-suggestion", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      return response.suggestion;
    } catch (error) {
      throw error;
    }
  };

  const handleGenerateMotivationSuggestion = async () => {
    setMotivationLoading(true);
    setMotivationSuggestion("");
    setMotivationError("");
    const promptText = `You are an assistant helping a student write a compelling motivation essay for a general scholarship application at Africa University. The student has written: "${
      motivationText || "Nothing yet."
    }" Provide 3-4 concise bullet points suggesting what the student could add or emphasize to strengthen their general motivation letter. Focus on aspects like their passion for their chosen field, future goals, how AU will help achieve them, any leadership experiences, or unique circumstances.`;
    try {
      const response = await callBackendGeminiAPI(promptText);
      setMotivationSuggestion(response);
    } catch (error) {
      setMotivationError(
        `Failed to get suggestions. (Backend might be unavailable)`
      );
    } finally {
      setMotivationLoading(false);
    }
  };

  const handleSuggestDescriptionImprovements = async (scholarship) => {
    if (!scholarship) return;
    setDescriptionLoading(true);
    setDescriptionSuggestion("");
    setDescriptionError("");
    const promptText = `You are an expert in crafting clear internal scholarship definitions for a university committee. For an internal scholarship named "${scholarship.internalName}" (Type: ${scholarship.type}, Coverage: ${scholarship.coverage}), with the current description: "${scholarship.description}". Provide 2-3 actionable suggestions on how to make this internal description clearer or more informative for the scholarship committee to aid in their matching process. Focus on highlighting key differentiators or target student profiles. Present suggestions as bullet points.`;
    try {
      const response = await callBackendGeminiAPI(promptText);
      setDescriptionSuggestion(response);
    } catch (error) {
      setDescriptionError(
        `Failed to get suggestions. (Backend might be unavailable)`
      );
    } finally {
      setDescriptionLoading(false);
    }
  };

  const handleAssignScholarship = async () => {
    if (!selectedApplication || !assigningScholarshipId) return;
    const scholarshipToAssign = internalScholarships.find(
      (s) => s.id === assigningScholarshipId
    );
    if (!scholarshipToAssign) {
      alert("Selected scholarship not found.");
      return;
    }
    const awardDetails = {
      scholarshipName: scholarshipToAssign.internalName,
      coverage: scholarshipToAssign.coverage,
      duration: scholarshipToAssign.duration,
      conditions: `Maintain CGPA & SGPA as per scholarship terms. Specific conditions for ${scholarshipToAssign.internalName} apply.`,
    };

    try {
      const updatedApplication = await fetchAPI(
        `/applications/general/${selectedApplication.id}/assign`,
        {
          method: "POST",
          body: JSON.stringify({
            scholarshipId: scholarshipToAssign.id,
            awardDetails,
          }),
        }
      );

      setApplicationsToReview((prev) =>
        prev.map((app) =>
          app.id === updatedApplication.id ? updatedApplication : app
        )
      );
      if (studentApplication && studentApplication.id === updatedApplication.id)
        setStudentApplication(updatedApplication);

      if (selectedApplication.studentId === loggedInStudentId) {
        fetchAPI(`/awards/student/${loggedInStudentId}/history`)
          .then((historyData) => setStudentAwardHistory(historyData || []))
          .catch((e) =>
            console.warn(
              "Could not refresh award history after assignment.",
              e.message
            )
          );
      }

      alert(
        `${selectedApplication.studentName} assigned to ${scholarshipToAssign.internalName}.`
      );
      setShowAssignModal(false);
      setSelectedApplication(null);
      setAssigningScholarshipId("");
    } catch (error) {
      /* Error already handled by fetchAPI */
    }
  };

  if (!isAuthCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: AU_RED }} />{" "}
        <p className="ml-3 text-slate-600">Checking Authentication...</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (
    isAuthenticated &&
    (userRole === "admin" || userRole === "superadmin") &&
    (loadingScholarships || loadingApplications || loadingFundSources)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: AU_RED }} />{" "}
        <p className="ml-3 text-slate-600">Loading Admin Data...</p>
      </div>
    );
  }
  if (
    isAuthenticated &&
    (userRole === "newapplicant" || userRole === "currentstudent") &&
    loadingStudentData &&
    loggedInStudentId !== NEW_STUDENT_DEMO_ID
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: AU_RED }} />{" "}
        <p className="ml-3 text-slate-600">Loading Your Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-inter flex flex-col">
      <Header
        userRole={userRole}
        onRoleChange={handleHeaderRoleChange}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">
        {userRole === "newapplicant" && (
          <NewApplicantDashboard onApplyClick={openGeneralApplyModal} />
        )}
        {userRole === "currentstudent" && (
          <StudentDashboard
            application={studentApplication}
            awardHistory={studentAwardHistory}
            onApplyClick={openGeneralApplyModal}
            loggedInStudentId={loggedInStudentId}
            isLoading={loadingStudentData}
          />
        )}
        {(userRole === "admin" || userRole === "superadmin") && (
          <AdminDashboard
            currentView={currentView}
            setCurrentView={setCurrentView}
            internalScholarships={internalScholarships}
            applicationsToReview={applicationsToReview}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            onShowAssignModal={(app) => {
              setSelectedApplication(app);
              setShowAssignModal(true);
            }}
            selectedInternalScholarship={selectedInternalScholarship}
            setSelectedInternalScholarship={setSelectedInternalScholarship}
            onSuggestDescriptionImprovements={
              handleSuggestDescriptionImprovements
            }
            descriptionSuggestion={descriptionSuggestion}
            descriptionLoading={descriptionLoading}
            descriptionError={descriptionError}
            setDescriptionSuggestion={setDescriptionSuggestion}
            fundSources={fundSources}
            userRole={userRole}
            fetchAPI={fetchAPI}
          />
        )}
        {userRole === "donor" && <DonorPortalView />}
      </main>
      {showGeneralApplyModal && (
        <GeneralApplicationModal
          onClose={closeGeneralApplyModal}
          onSubmit={submitGeneralApplication}
          motivationText={motivationText}
          setMotivationText={setMotivationText}
          onGenerateSuggestion={handleGenerateMotivationSuggestion}
          suggestion={motivationSuggestion}
          isLoading={motivationLoading}
          error={motivationError}
          studentId={loggedInStudentId}
          existingApplicationData={
            applicationsToReview.find(
              (app) =>
                app.studentId === loggedInStudentId &&
                loggedInStudentId !== NEW_STUDENT_DEMO_ID
            ) || studentApplication
          }
        />
      )}
      {showAssignModal && selectedApplication && (
        <AssignScholarshipModal
          application={selectedApplication}
          internalScholarships={internalScholarships.filter((s) => s.isActive)}
          assigningScholarshipId={assigningScholarshipId}
          setAssigningScholarshipId={setAssigningScholarshipId}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedApplication(null);
          }}
          onAssign={handleAssignScholarship}
        />
      )}
      <Footer />
    </div>
  );
};

const AULogo = ({ size = "h-10 w-10" }) => (
  <div
    className={`flex items-center justify-center ${size} rounded-full bg-white p-1 shadow`}
  >
    <div className="text-center">
      <span
        className="block text-xs font-bold leading-none"
        style={{ color: AU_RED_DARKER }}
      >
        AU
      </span>
      <span
        className="block text-[8px] leading-tight"
        style={{ color: AU_RED }}
      >
        TREE
      </span>
    </div>
  </div>
);

const LoginPage = ({ onLogin }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [roleToAttempt, setRoleToAttempt] = useState("student");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      await onLogin(roleToAttempt, userId, (errorMsg) => {
        if (errorMsg) {
          setLoginError(errorMsg);
        }
      });
    } catch (err) {
      setLoginError(err.message || "Login process failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-red-50 to-slate-100 p-4">
      <div className="w-full max-w-sm">
        <header className="text-center mb-8">
          <div className="mx-auto mb-5 inline-block p-2 bg-white rounded-full shadow-lg">
            {" "}
            <AULogo size="h-24 w-24" />{" "}
          </div>
          <h1 className="text-4xl font-bold" style={{ color: AU_RED_DARKER }}>
            Africa University
          </h1>
          <p className="text-xl text-slate-700 mt-1">SSMS Portal</p>
        </header>
        <div className="bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">
            Welcome Back!
          </h2>
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
              <AlertCircle size={18} className="mr-2" /> {loginError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700"
              >
                I am a...
              </label>
              <select
                id="role"
                value={roleToAttempt}
                onChange={(e) => setRoleToAttempt(e.target.value)}
                className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm transition-colors"
                style={{
                  borderColor: AU_RED_LIGHTER,
                  outlineColor: AU_RED,
                  "--tw-ring-color": AU_RED_LIGHTER,
                }}
              >
                <option value="student">Student</option>
                <option value="staff">Staff / Donor</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-slate-700"
              >
                University ID / Login ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder={
                  roleToAttempt === "student"
                    ? 'e.g., "newstudent" or AU ID'
                    : 'e.g., "admin", "superadmin", "donor"'
                }
                className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm transition-colors"
                style={{
                  borderColor: AU_RED_LIGHTER,
                  outlineColor: AU_RED,
                  "--tw-ring-color": AU_RED_LIGHTER,
                }}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 sm:text-sm transition-colors"
                style={{
                  borderColor: AU_RED_LIGHTER,
                  outlineColor: AU_RED,
                  "--tw-ring-color": AU_RED_LIGHTER,
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3.5 text-base text-white font-semibold rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity disabled:opacity-60"
              style={{
                backgroundColor: AU_RED,
                "--tw-ring-color": AU_RED_DARKER,
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <LogIn size={20} className="mr-2" />
              )}{" "}
              Sign In
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-6">
            Demo IDs: New Student ("newstudent"), Current Student (e.g.,
            "AU2025001"), Admin ("admin"), Super Admin ("superadmin"), Donor
            ("donor").
          </p>
        </div>
        <p className="text-center text-xs text-slate-500 mt-10">
          {" "}
          &copy; {new Date().getFullYear()} Africa University. SSMS Prototype
          (MySQL Conceptual).{" "}
        </p>
      </div>
    </div>
  );
};

const Header = ({ userRole, onRoleChange, onLogout }) => (
  <header style={{ backgroundColor: AU_RED }} className="text-white shadow-lg">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <AULogo size="h-10 w-10" />
        <h1 className="text-xl sm:text-2xl font-bold">
          Africa University SSMS
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Current Role:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="text-sm p-2 rounded-md focus:ring-2 focus:ring-white"
            style={{
              backgroundColor: AU_RED_DARKER,
              color: "white",
              border: "1px solid " + AU_RED_LIGHTER,
            }}
          >
            <option value="newapplicant">New Applicant</option>
            <option value="currentstudent">Current Student</option>
            <option value="donor">Donor Representative</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <UserCircle className="h-7 w-7 sm:h-8 sm:w-8 opacity-90" />
        </div>
        <button
          onClick={onLogout}
          className="text-sm px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors"
          style={{
            backgroundColor: AU_RED_DARKER,
            border: "1px solid " + AU_RED_LIGHTER,
          }}
        >
          {" "}
          Logout
        </button>
      </div>
    </div>
  </header>
);

const NewApplicantDashboard = ({ onApplyClick }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl text-center">
      <h2
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Welcome New Applicant!
      </h2>
      <FileText size={48} className="mx-auto text-slate-400 mb-6" />
      <p className="text-slate-600 mb-8 text-lg">
        Thank you for your interest in scholarships at Africa University. <br />
        Please submit your general application to be considered for financial
        aid.
      </p>
      <button
        onClick={onApplyClick}
        className="px-8 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center mx-auto"
        style={{ backgroundColor: AU_RED }}
      >
        <Edit3 size={20} className="mr-2" /> Submit General Application
      </button>
      <p className="text-xs text-slate-500 mt-8">
        Ensure all information is accurate and complete.
      </p>
      <p className="text-xs text-slate-400 mt-2 flex items-center justify-center">
        <Smartphone size={14} className="mr-1" /> A mobile app might be
        available in the future for easier access!
      </p>
    </div>
  );
};

const StudentDashboard = ({
  application,
  awardHistory,
  onApplyClick,
  loggedInStudentId,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState("currentApplication");
  const isNewApplicantDemo = loggedInStudentId === NEW_STUDENT_DEMO_ID;

  if (isLoading && loggedInStudentId !== NEW_STUDENT_DEMO_ID) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl text-center">
        <Loader2
          className="h-10 w-10 animate-spin mx-auto my-10"
          style={{ color: AU_RED }}
        />{" "}
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h2
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Student Dashboard
      </h2>
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex space-x-1 -mb-px">
          <button
            onClick={() => setActiveTab("currentApplication")}
            className={`px-4 py-3 font-medium text-sm rounded-t-md transition-colors ${
              activeTab === "currentApplication"
                ? "border-b-2 text-red-600"
                : "text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            style={
              activeTab === "currentApplication" ? { borderColor: AU_RED } : {}
            }
          >
            {" "}
            Current Application{" "}
          </button>
          <button
            onClick={() => setActiveTab("awardHistory")}
            className={`px-4 py-3 font-medium text-sm rounded-t-md transition-colors ${
              activeTab === "awardHistory"
                ? "border-b-2 text-red-600"
                : "text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
            style={activeTab === "awardHistory" ? { borderColor: AU_RED } : {}}
          >
            {" "}
            Award History{" "}
          </button>
        </nav>
      </div>
      {activeTab === "currentApplication" && (
        <>
          {!application && !isNewApplicantDemo && (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-6 text-lg">
                You have not submitted a general application for scholarship
                consideration for the current cycle.
              </p>
              <button
                onClick={onApplyClick}
                className="px-8 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center mx-auto"
                style={{ backgroundColor: AU_RED }}
              >
                {" "}
                <Edit3 size={20} className="mr-2" /> Submit General Application{" "}
              </button>
            </div>
          )}
          {application && (
            <ApplicationStatusDisplay application={application} />
          )}
        </>
      )}
      {activeTab === "awardHistory" && (
        <AwardHistoryDisplay awardHistory={awardHistory} />
      )}
      <p className="text-xs text-slate-400 mt-8 text-center flex items-center justify-center">
        {" "}
        <Smartphone size={14} className="mr-1" /> A mobile app might be
        available in the future for easier access to your applications and
        awards!{" "}
      </p>
    </div>
  );
};

const ApplicationStatusDisplay = ({ application }) => (
  <div>
    <h3 className="text-xl font-semibold text-slate-700 mb-4">
      My General Application Status
    </h3>
    <div className="border border-slate-200 p-6 rounded-lg space-y-3 mb-8">
      <p>
        <strong className="text-slate-600">Applicant:</strong>{" "}
        {application.studentName} ({application.studentId})
      </p>
      <p>
        <strong className="text-slate-600">Submission Date:</strong>{" "}
        {application.submissionDate
          ? new Date(application.submissionDate).toLocaleDateString()
          : "N/A"}
      </p>
      <p>
        <strong className="text-slate-600">Status:</strong>
        <span
          className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${
            application.status === "Submitted"
              ? "bg-yellow-100 text-yellow-700"
              : application.status === "Under Review"
              ? "bg-blue-100 text-blue-700"
              : application.status === "Committee Review"
              ? "bg-purple-100 text-purple-700"
              : application.status === "Decision Made"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {application.status}
        </span>
      </p>
    </div>
    {application.status === "Decision Made" &&
      application.assignedScholarshipId &&
      application.awardDetails && (
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Scholarship Award Details
          </h3>
          <div
            className="p-6 rounded-lg shadow-inner"
            style={{ backgroundColor: AU_RED_LIGHTER }}
          >
            <p
              className="text-2xl font-bold mb-3"
              style={{ color: AU_RED_DARKER }}
            >
              Congratulations!
            </p>
            <p className="mb-2">
              <strong style={{ color: AU_RED_DARKER }}>
                Scholarship Name:
              </strong>{" "}
              {application.awardDetails.scholarshipName}
            </p>
            <p className="mb-2">
              <strong style={{ color: AU_RED_DARKER }}>Coverage:</strong>{" "}
              {application.awardDetails.coverage}
            </p>
            <p className="mb-2">
              <strong style={{ color: AU_RED_DARKER }}>Duration:</strong>{" "}
              {application.awardDetails.duration}
            </p>
            <p>
              <strong style={{ color: AU_RED_DARKER }}>Conditions:</strong>{" "}
              {application.awardDetails.conditions}
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                className="px-6 py-2 text-white font-medium rounded-md shadow hover:opacity-90 flex items-center"
                style={{ backgroundColor: AU_RED_DARKER }}
              >
                <ThumbsUp size={18} className="mr-2" /> Accept Offer (Demo)
              </button>
              <button className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-md shadow hover:bg-slate-300 flex items-center">
                <ThumbsDown size={18} className="mr-2" /> Decline Offer (Demo)
              </button>
            </div>
          </div>
        </div>
      )}
    {application.status === "Decision Made" &&
      !application.assignedScholarshipId && (
        <div className="p-6 rounded-lg bg-slate-50 shadow-inner">
          <p className="text-lg font-medium text-slate-700">
            The committee has reviewed your application. Unfortunately, we are
            unable to offer you a scholarship at this time. We encourage you to
            apply again in the next cycle.
          </p>
        </div>
      )}
  </div>
);

const AwardHistoryDisplay = ({ awardHistory }) => (
  <div>
    <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
      <History size={22} className="mr-2" style={{ color: AU_RED }} />{" "}
      Scholarship Award History
    </h3>
    {awardHistory && awardHistory.length > 0 ? (
      <div className="space-y-4">
        {awardHistory.map((award) => (
          <div
            key={award.id}
            className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h4
              className="font-semibold text-md"
              style={{ color: AU_RED_DARKER }}
            >
              {award.scholarshipName}
            </h4>
            <p className="text-sm text-slate-600">
              <strong>Period:</strong> {award.awardPeriod}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Coverage:</strong> {award.coverage}
            </p>
            <p className="text-sm text-slate-500">
              <strong>Status:</strong> {award.status}
            </p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-slate-500">
        No past scholarship awards found in your record.
      </p>
    )}
  </div>
);

const GeneralApplicationModal = ({
  onClose,
  onSubmit,
  motivationText,
  setMotivationText,
  onGenerateSuggestion,
  suggestion,
  isLoading,
  error,
  studentId,
  existingApplicationData,
}) => {
  const initialFormData = {
    studentName: "",
    studentId: studentId === NEW_STUDENT_DEMO_ID ? "" : studentId || "",
    program: "",
    yearOfStudy: "1",
    semesterOfStudy: "1",
    nationality: "",
    cgpa: "",
    sgpa: "",
    entryPoints: "",
    financialStatement: "",
    gender: "Other",
    demonstratesFinancialNeed: "no",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (existingApplicationData) {
      setFormData({
        studentName: existingApplicationData.studentName || "",
        studentId: existingApplicationData.studentId || studentId,
        program: existingApplicationData.program || "",
        yearOfStudy: String(existingApplicationData.yearOfStudy || "1"),
        semesterOfStudy: String(existingApplicationData.semesterOfStudy || "1"),
        nationality: existingApplicationData.nationality || "",
        cgpa: String(existingApplicationData.cgpa || ""),
        sgpa: String(existingApplicationData.sgpa || ""),
        entryPoints: String(existingApplicationData.entryPoints || ""),
        financialStatement: existingApplicationData.financialStatement || "",
        gender: existingApplicationData.gender || "Other",
        demonstratesFinancialNeed:
          existingApplicationData.demonstratesFinancialNeed ? "yes" : "no",
      });
      setMotivationText(existingApplicationData.motivation || "");
    } else if (studentId && studentId !== NEW_STUDENT_DEMO_ID) {
      setFormData((prev) => ({ ...initialFormData, studentId: studentId }));
    } else if (studentId === NEW_STUDENT_DEMO_ID) {
      setFormData({ ...initialFormData, studentId: "" });
    }
  }, [studentId, existingApplicationData]);

  const validateField = (name, value, currentFormData) => {
    let errorMsg = "";
    const yearOfStudy = parseInt(currentFormData.yearOfStudy, 10);
    const semesterOfStudy = parseInt(currentFormData.semesterOfStudy, 10);
    if (!value || String(value).trim() === "") {
      if (
        [
          "studentName",
          "studentId",
          "program",
          "nationality",
          "financialStatement",
          "gender",
          "semesterOfStudy",
        ].includes(name)
      )
        errorMsg = `${name
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required.`;
      if (name === "program" && value === "")
        errorMsg = "Program of Study is required.";
      if (name === "nationality" && value === "")
        errorMsg = "Nationality is required.";
      if (name === "gender" && value === "") errorMsg = "Gender is required.";
      if (yearOfStudy === 1 && semesterOfStudy === 1) {
        if (name === "entryPoints")
          errorMsg =
            "Entry Points are required for new students (Year 1, Sem 1).";
      } else {
        if (name === "cgpa")
          errorMsg = "CGPA is required for continuing students.";
        if (name === "sgpa")
          errorMsg = "Latest SGPA is required for continuing students.";
      }
    } else if (
      (name === "cgpa" || name === "sgpa") &&
      (isNaN(parseFloat(value)) ||
        parseFloat(value) < 0 ||
        parseFloat(value) > 4.0)
    )
      errorMsg = "GPA must be a number between 0.0 and 4.0.";
    else if (
      name === "entryPoints" &&
      (isNaN(parseInt(value)) || parseInt(value) < 0)
    )
      errorMsg = "Entry Points must be a non-negative number.";
    return errorMsg;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "yearOfStudy" || name === "semesterOfStudy") {
        const newErrors = { ...formErrors };
        newErrors.cgpa = validateField("cgpa", newState.cgpa, newState);
        newErrors.sgpa = validateField("sgpa", newState.sgpa, newState);
        newErrors.entryPoints = validateField(
          "entryPoints",
          newState.entryPoints,
          newState
        );
        setFormErrors(newErrors);
      } else if (formErrors[name])
        setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      return newState;
    });
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value, formData);
    setFormErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    [
      "studentName",
      "studentId",
      "program",
      "nationality",
      "financialStatement",
      "gender",
      "yearOfStudy",
      "semesterOfStudy",
    ].forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });
    const year = parseInt(formData.yearOfStudy, 10);
    const semester = parseInt(formData.semesterOfStudy, 10);
    if (year === 1 && semester === 1) {
      const entryPointsError = validateField(
        "entryPoints",
        formData.entryPoints,
        formData
      );
      if (entryPointsError) {
        errors.entryPoints = entryPointsError;
        isValid = false;
      }
    } else {
      const cgpaError = validateField("cgpa", formData.cgpa, formData);
      if (cgpaError) {
        errors.cgpa = cgpaError;
        isValid = false;
      }
      const sgpaError = validateField("sgpa", formData.sgpa, formData);
      if (sgpaError) {
        errors.sgpa = sgpaError;
        isValid = false;
      }
    }
    if (!motivationText || motivationText.trim() === "") {
      errors.motivation = "Motivation Essay is required.";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit({ ...formData, motivation: motivationText });
    else console.log("Validation failed", formErrors);
  };

  const InputField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    type = "text",
    placeholder = "",
    required = false,
    children,
    disabled = false,
  }) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ? (
        React.cloneElement(children, {
          name,
          id: name,
          value,
          onChange,
          onBlur,
          required,
          disabled,
          className: `mt-1 block w-full p-2.5 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${
            error
              ? "border-red-500 ring-red-500"
              : "border-slate-300 focus:border-red-300"
          } ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}`,
          style: {
            borderColor: error ? "rgb(239 68 68)" : AU_RED_LIGHTER,
            outlineColor: error ? "rgb(239 68 68)" : AU_RED,
          },
        })
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`mt-1 block w-full p-2.5 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${
            error
              ? "border-red-500 ring-red-500"
              : "border-slate-300 focus:border-red-300"
          } ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}`}
          style={{
            borderColor: error ? "rgb(239 68 68)" : AU_RED_LIGHTER,
            outlineColor: error ? "rgb(239 68 68)" : AU_RED,
          }}
        />
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-6">
          {" "}
          <h2 className="text-2xl font-bold" style={{ color: AU_RED_DARKER }}>
            General Scholarship Application
          </h2>{" "}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <XCircle size={28} />
          </button>{" "}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="Full Name"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.studentName}
              required
            />
            <InputField
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.studentId}
              required
              disabled={
                studentId &&
                studentId !== NEW_STUDENT_DEMO_ID &&
                !!existingApplicationData
              }
              placeholder={
                studentId === NEW_STUDENT_DEMO_ID ? "Enter your Student ID" : ""
              }
            />
            <InputField
              label="Program of Study"
              name="program"
              value={formData.program}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.program}
              required
            >
              <select>
                <option value="">-- Select Program --</option>
                {mockPrograms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField
              label="Year of Study"
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.yearOfStudy}
              required
            >
              <select>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Graduate)</option>
              </select>
            </InputField>
            <InputField
              label="Semester of Study"
              name="semesterOfStudy"
              value={formData.semesterOfStudy}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.semesterOfStudy}
              required
            >
              <select>
                <option value="">-- Select Semester --</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </InputField>
            <InputField
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.nationality}
              required
            >
              <select>
                <option value="">-- Select Nationality --</option>
                {mockNationalities.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </InputField>
            <InputField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.gender}
              required
            >
              <select>
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </InputField>
            <InputField
              label="Current CGPA"
              name="cgpa"
              type="number"
              step="0.01"
              value={formData.cgpa}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.cgpa}
              disabled={
                parseInt(formData.yearOfStudy, 10) === 1 &&
                parseInt(formData.semesterOfStudy, 10) === 1
              }
              required={
                !(
                  parseInt(formData.yearOfStudy, 10) === 1 &&
                  parseInt(formData.semesterOfStudy, 10) === 1
                )
              }
              placeholder="e.g., 3.5"
            />
            <InputField
              label="Latest SGPA"
              name="sgpa"
              type="number"
              step="0.01"
              value={formData.sgpa}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.sgpa}
              disabled={
                parseInt(formData.yearOfStudy, 10) === 1 &&
                parseInt(formData.semesterOfStudy, 10) === 1
              }
              required={
                !(
                  parseInt(formData.yearOfStudy, 10) === 1 &&
                  parseInt(formData.semesterOfStudy, 10) === 1
                )
              }
              placeholder="e.g., 3.6"
            />
            <InputField
              label="Entry Points"
              name="entryPoints"
              type="number"
              value={formData.entryPoints}
              onChange={handleChange}
              onBlur={handleBlur}
              error={formErrors.entryPoints}
              disabled={
                !(
                  parseInt(formData.yearOfStudy, 10) === 1 &&
                  parseInt(formData.semesterOfStudy, 10) === 1
                )
              }
              required={
                parseInt(formData.yearOfStudy, 10) === 1 &&
                parseInt(formData.semesterOfStudy, 10) === 1
              }
              placeholder="For Year 1, Sem 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Do you require financial assistance?{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex space-x-4">
              {" "}
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="demonstratesFinancialNeed"
                  value="yes"
                  checked={formData.demonstratesFinancialNeed === "yes"}
                  onChange={handleChange}
                  className="form-radio text-red-600"
                  style={{ "--tw-ring-color": AU_RED }}
                />{" "}
                <span className="ml-2">Yes</span>
              </label>{" "}
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="demonstratesFinancialNeed"
                  value="no"
                  checked={formData.demonstratesFinancialNeed === "no"}
                  onChange={handleChange}
                  className="form-radio text-red-600"
                  style={{ "--tw-ring-color": AU_RED }}
                />{" "}
                <span className="ml-2">No</span>
              </label>{" "}
            </div>
            {formErrors.demonstratesFinancialNeed && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {formErrors.demonstratesFinancialNeed}
              </p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              {" "}
              <label
                htmlFor="motivation"
                className="block text-sm font-medium text-slate-700"
              >
                Motivation Essay <span className="text-red-500">*</span>
              </label>{" "}
              <button
                type="button"
                onClick={onGenerateSuggestion}
                disabled={isLoading}
                className="text-xs px-2.5 py-1.5 bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500 disabled:bg-slate-300 flex items-center transition-colors"
              >
                {" "}
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                ) : (
                  <Sparkles size={14} className="mr-1.5" />
                )}{" "}
                Get Writing Tips{" "}
              </button>{" "}
            </div>
            <textarea
              name="motivation"
              id="motivation"
              value={motivationText}
              onChange={(e) => {
                setMotivationText(e.target.value);
                if (formErrors.motivation)
                  setFormErrors((p) => ({ ...p, motivation: "" }));
              }}
              onBlur={(e) =>
                setFormErrors((p) => ({
                  ...p,
                  motivation: validateField(
                    "motivation",
                    e.target.value,
                    formData
                  ),
                }))
              }
              rows="5"
              required
              className={`mt-1 block w-full p-2.5 border rounded-md shadow-sm focus:ring-2 sm:text-sm ${
                formErrors.motivation
                  ? "border-red-500 ring-red-500"
                  : "border-slate-300 focus:border-red-300"
              }`}
              style={{
                borderColor: formErrors.motivation
                  ? "rgb(239 68 68)"
                  : AU_RED_LIGHTER,
                outlineColor: formErrors.motivation ? "rgb(239 68 68)" : AU_RED,
              }}
              placeholder="Explain your aspirations, why you chose AU, and why you need financial support..."
            ></textarea>
            {formErrors.motivation && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {formErrors.motivation}
              </p>
            )}
            {isLoading && (
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <Loader2 size={12} className="animate-spin mr-1" />
                Generating tips...
              </p>
            )}{" "}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            {suggestion && !isLoading && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                {" "}
                <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center">
                  <Sparkles size={14} className="mr-1.5 text-yellow-600" />{" "}
                  Writing Tips:
                </h4>{" "}
                <div className="text-xs text-yellow-700 whitespace-pre-wrap">
                  {suggestion}
                </div>{" "}
              </div>
            )}
          </div>
          <InputField
            label="Financial Statement/Proof of Need"
            name="financialStatement"
            value={formData.financialStatement}
            onChange={handleChange}
            onBlur={handleBlur}
            error={formErrors.financialStatement}
            required
          >
            <textarea
              rows="3"
              placeholder="Briefly describe your financial situation or refer to uploaded documents."
            ></textarea>
          </InputField>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Upload Supporting Documents (Conceptual)
            </label>
            <input
              type="file"
              multiple
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              style={{ colorScheme: "light" }}
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            {" "}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>{" "}
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center"
              style={{ backgroundColor: AU_RED }}
            >
              <Send size={16} className="mr-2" /> Submit Application
            </button>{" "}
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({
  currentView,
  setCurrentView,
  internalScholarships,
  applicationsToReview,
  selectedApplication,
  setSelectedApplication,
  onShowAssignModal,
  selectedInternalScholarship,
  setSelectedInternalScholarship,
  onSuggestDescriptionImprovements,
  descriptionSuggestion,
  descriptionLoading,
  descriptionError,
  setDescriptionSuggestion,
  fundSources,
  userRole,
  fetchAPI,
}) => {
  const NavButton = ({ view, label, icon: Icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
        currentView === view ? "text-white" : "text-slate-700 hover:bg-red-50"
      }`}
      style={currentView === view ? { backgroundColor: AU_RED } : {}}
    >
      {" "}
      <Icon size={18} /> <span>{label}</span>{" "}
    </button>
  );
  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
      <aside className="md:w-1/4 lg:w-1/5 bg-white p-4 rounded-xl shadow-lg">
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{ color: AU_RED_DARKER }}
        >
          {" "}
          {userRole === "superadmin" ? "Super Admin Menu" : "Admin Menu"}{" "}
        </h2>
        <nav className="space-y-2">
          <NavButton view="dashboard" label="Dashboard Summary" icon={Award} />{" "}
          <NavButton
            view="defineScholarship"
            label="Define Scholarships"
            icon={Briefcase}
          />{" "}
          <NavButton
            view="reviewApplications"
            label="Review Applications"
            icon={ListChecks}
          />{" "}
          <NavButton
            view="financialReport"
            label="Financial Report"
            icon={BarChart3}
          />{" "}
          <NavButton
            view="scholarshipPerformance"
            label="Scholarship Performance"
            icon={Activity}
          />{" "}
          <NavButton
            view="scholarshipAssignmentReport"
            label="Assignment Report"
            icon={PieChart}
          />{" "}
          <NavButton
            view="budgetingForecasting"
            label="Budgeting & Forecasting"
            icon={BarChartHorizontalBig}
          />
          {userRole === "superadmin" && (
            <>
              {" "}
              <NavButton
                view="userManagement"
                label="User Management"
                icon={UserPlus}
              />{" "}
              <NavButton
                view="systemSettings"
                label="System Settings"
                icon={Settings}
              />{" "}
              <NavButton
                view="appFormConfig"
                label="App Form Config"
                icon={AlignLeft}
              />{" "}
              <NavButton
                view="reviewWorkflowConfig"
                label="Review Workflow Config"
                icon={SlidersHorizontal}
              />{" "}
            </>
          )}
        </nav>
      </aside>
      <section className="md:w-3/4 lg:w-4/5">
        {currentView === "dashboard" && (
          <AdminDashboardSummary
            applications={applicationsToReview}
            scholarships={internalScholarships}
          />
        )}
        {currentView === "defineScholarship" && (
          <ScholarshipDefinitionManager
            scholarships={internalScholarships}
            selectedScholarship={selectedInternalScholarship}
            setSelectedScholarship={setSelectedInternalScholarship}
            onSuggestDescriptionImprovements={onSuggestDescriptionImprovements}
            descriptionSuggestion={descriptionSuggestion}
            descriptionLoading={descriptionLoading}
            descriptionError={descriptionError}
            setDescriptionSuggestion={setDescriptionSuggestion}
            fundSources={fundSources}
            fetchAPI={fetchAPI}
          />
        )}
        {currentView === "reviewApplications" && (
          <ApplicationReviewArea
            applications={applicationsToReview}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            onShowAssignModal={onShowAssignModal}
            internalScholarships={internalScholarships}
          />
        )}
        {currentView === "financialReport" && (
          <FinancialReport
            fundSources={fundSources}
            applications={applicationsToReview}
            internalScholarships={internalScholarships}
          />
        )}
        {currentView === "scholarshipPerformance" && (
          <ScholarshipPerformanceReport
            internalScholarships={internalScholarships}
            applications={applicationsToReview}
            fetchAPI={fetchAPI}
          />
        )}
        {currentView === "scholarshipAssignmentReport" && (
          <ScholarshipAssignmentReport
            applications={applicationsToReview}
            internalScholarships={internalScholarships}
          />
        )}
        {currentView === "budgetingForecasting" && (
          <PlaceholderView
            title="Budgeting & Forecasting"
            message="Tools for scholarship budget allocation across funds/academic years and forecasting fund depletion would be available here."
            icon={BarChartHorizontalBig}
          />
        )}
        {currentView === "userManagement" && userRole === "superadmin" && (
          <PlaceholderView
            title="User Management"
            message="User account creation, role assignments, and permission configurations would be managed here."
            icon={UserPlus}
          />
        )}
        {currentView === "systemSettings" && userRole === "superadmin" && (
          <PlaceholderView
            title="System Settings"
            message="Global system configurations, academic year setup, and other administrative settings would be managed here."
            icon={Settings}
          />
        )}
        {currentView === "appFormConfig" && userRole === "superadmin" && (
          <PlaceholderView
            title="Application Form Configuration"
            message="Here, Super Admins could define the fields, sections, validation rules, and layout of the general student application form. This would allow dynamic customization of the application intake process."
            icon={AlignLeft}
          />
        )}
        {currentView === "reviewWorkflowConfig" &&
          userRole === "superadmin" && (
            <PlaceholderView
              title="Review Workflow Configuration"
              message="This section would allow Super Admins to define multi-stage review processes, assign reviewers/committees, and set up custom scoring rubrics."
              icon={SlidersHorizontal}
            />
          )}
      </section>
    </div>
  );
};

const AdminDashboardSummary = ({ applications, scholarships }) => {
  const submittedCount = applications.filter(
    (a) => a.status === "Submitted"
  ).length;
  const reviewCount = applications.filter(
    (a) => a.status === "Under Review" || a.status === "Committee Review"
  ).length;
  const awardedCount = applications.filter(
    (a) => a.assignedScholarshipId !== null
  ).length;
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Dashboard Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Applications"
          value={applications.length}
          icon={FileText}
          color={AU_RED}
        />
        <SummaryCard
          title="Scholarships Defined"
          value={scholarships.length}
          icon={Briefcase}
          color="#3b82f6"
        />
        <SummaryCard
          title="Applications Awarded"
          value={awardedCount}
          icon={Award}
          color="#22c55e"
        />
        <SummaryCard
          title="Pending Review"
          value={submittedCount + reviewCount}
          icon={Clock}
          color="#f59e0b"
        />
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div
      className="p-6 rounded-lg shadow-lg text-white flex items-center space-x-4"
      style={{ backgroundColor: color }}
    >
      <div className="p-3 bg-white bg-opacity-20 rounded-full">
        {" "}
        <Icon size={28} />{" "}
      </div>
      <div>
        {" "}
        <p className="text-3xl font-bold">{value}</p>{" "}
        <p className="text-sm opacity-90">{title}</p>{" "}
      </div>
    </div>
  );
};

const ScholarshipDefinitionManager = ({
  scholarships,
  selectedScholarship,
  setSelectedScholarship,
  onSuggestDescriptionImprovements,
  descriptionSuggestion,
  descriptionLoading,
  descriptionError,
  setDescriptionSuggestion,
  fundSources,
  fetchAPI,
}) => {
  const initialFormState = {
    internalName: "",
    description: "",
    type: "",
    coverage: "",
    duration: "",
    eligibilityCriteria: {
      minCGPA: "",
      minSGPA: "",
      minEntryPoints: "",
      programs: "",
    },
    availableSlots: 0,
    fundSource: "",
    allocatedAmount: 0,
    isActive: true,
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [allScholarships, setAllScholarships] = useState(scholarships);

  useEffect(() => {
    setAllScholarships(scholarships);
  }, [scholarships]);

  useEffect(() => {
    if (selectedScholarship) {
      setFormState({
        ...initialFormState,
        ...selectedScholarship,
        eligibilityCriteria: {
          minCGPA: selectedScholarship.eligibilityCriteria?.minCGPA || "",
          minSGPA: selectedScholarship.eligibilityCriteria?.minSGPA || "",
          minEntryPoints:
            selectedScholarship.eligibilityCriteria?.minEntryPoints || "",
          programs:
            selectedScholarship.eligibilityCriteria?.programs?.join(",") || "",
        },
        isActive:
          selectedScholarship.isActive === undefined
            ? true
            : selectedScholarship.isActive,
      });
      setIsEditing(true);
      setDescriptionSuggestion("");
    } else {
      setFormState(initialFormState);
      setIsEditing(false);
      setDescriptionSuggestion("");
    }
  }, [selectedScholarship, setDescriptionSuggestion]);

  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    const val =
      inputType === "checkbox"
        ? checked
        : inputType === "number"
        ? parseFloat(value) || 0
        : value;
    if (name.startsWith("eligibilityCriteria.")) {
      const key = name.split(".")[1];
      setFormState((prev) => ({
        ...prev,
        eligibilityCriteria: {
          ...prev.eligibilityCriteria,
          [key]: key === "programs" ? value : val,
        },
      }));
    } else setFormState((prev) => ({ ...prev, [name]: val }));
  };

  const handleSaveScholarship = async () => {
    const finalFormState = {
      ...formState,
      eligibilityCriteria: {
        ...formState.eligibilityCriteria,
        programs: formState.eligibilityCriteria.programs
          ? formState.eligibilityCriteria.programs
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : [],
      },
    };
    const { id, ...dataToSave } = finalFormState;
    try {
      let savedScholarship;
      if (isEditing && selectedScholarship?.id) {
        savedScholarship = await fetchAPI(
          `/scholarships/internal/${selectedScholarship.id}`,
          { method: "PUT", body: JSON.stringify(dataToSave) }
        );
        setAllScholarships((prev) =>
          prev.map((s) => (s.id === savedScholarship.id ? savedScholarship : s))
        );
        alert(`Scholarship updated!`);
      } else {
        savedScholarship = await fetchAPI("/scholarships/internal", {
          method: "POST",
          body: JSON.stringify(dataToSave),
        });
        setAllScholarships((prev) => [...prev, savedScholarship]);
        alert(`Scholarship added!`);
      }
      setSelectedScholarship(null);
      setFormState(initialFormState);
      setIsEditing(false);
    } catch (error) {
      /* Error already handled by fetchAPI */
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Manage Internal Scholarship Definitions
      </h3>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          <button
            onClick={() => {
              setSelectedScholarship(null);
              setIsEditing(false);
              setFormState(initialFormState);
            }}
            className="w-full flex items-center justify-center px-4 py-2.5 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity mb-3"
            style={{ backgroundColor: AU_RED }}
          >
            {" "}
            <PlusCircle size={18} className="mr-2" /> Add New Definition{" "}
          </button>
          {allScholarships.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedScholarship(s)}
              className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                selectedScholarship?.id === s.id
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-red-300"
              }`}
              style={
                selectedScholarship?.id === s.id
                  ? { borderColor: AU_RED, backgroundColor: AU_RED_LIGHTER }
                  : {}
              }
            >
              {" "}
              <div className="flex justify-between items-center">
                {" "}
                <h4 className="font-medium text-slate-800">
                  {s.internalName}
                </h4>{" "}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    s.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {" "}
                  {s.isActive ? "Active" : "Inactive"}{" "}
                </span>{" "}
              </div>{" "}
              <p className="text-xs text-slate-500">
                {s.type} - {s.coverage}
              </p>{" "}
            </div>
          ))}
        </div>
        <div className="lg:w-3/5 p-1">
          {(selectedScholarship || !isEditing) && (
            <div className="space-y-4 p-4 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
              <h4
                className="text-lg font-semibold"
                style={{ color: AU_RED_DARKER }}
              >
                {isEditing ? "Edit Definition" : "Add New Definition"}
              </h4>
              <div>
                <label className="text-sm font-medium">Internal Name</label>
                <input
                  type="text"
                  name="internalName"
                  value={formState.internalName}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                {" "}
                <div className="flex justify-between items-center">
                  {" "}
                  <label className="text-sm font-medium">
                    Description (for committee)
                  </label>{" "}
                  {isEditing && selectedScholarship && (
                    <button
                      onClick={() =>
                        onSuggestDescriptionImprovements(selectedScholarship)
                      }
                      disabled={descriptionLoading}
                      className="text-xs px-2 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-slate-300 flex items-center"
                    >
                      {" "}
                      {descriptionLoading ? (
                        <Loader2 size={14} className="animate-spin mr-1" />
                      ) : (
                        <Sparkles size={14} className="mr-1" />
                      )}{" "}
                      Improve Desc.{" "}
                    </button>
                  )}{" "}
                </div>{" "}
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="mt-1 w-full p-2 border rounded-md"
                ></textarea>{" "}
                {descriptionLoading && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Loader2 size={12} className="animate-spin mr-1" />
                    Generating...
                  </p>
                )}{" "}
                {descriptionError && (
                  <p className="text-xs text-red-600 mt-1">
                    {descriptionError}
                  </p>
                )}{" "}
                {descriptionSuggestion && !descriptionLoading && (
                  <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    {" "}
                    <h5 className="text-xs font-semibold text-purple-800 mb-1 flex items-center">
                      <Sparkles size={14} className="mr-1.5 text-purple-600" />{" "}
                      Suggestions:
                    </h5>{" "}
                    <div className="text-xs text-purple-700 whitespace-pre-wrap">
                      {descriptionSuggestion}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <input
                  type="text"
                  name="type"
                  value={formState.type}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Coverage</label>
                <input
                  type="text"
                  name="coverage"
                  value={formState.coverage}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formState.duration}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Allocated Amount ($ per semester)
                </label>
                <input
                  type="number"
                  name="allocatedAmount"
                  value={formState.allocatedAmount}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Available Slots</label>
                <input
                  type="number"
                  name="availableSlots"
                  value={formState.availableSlots}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                {" "}
                <label className="text-sm font-medium">Fund Source</label>{" "}
                <select
                  name="fundSource"
                  value={formState.fundSource}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-2 border rounded-md bg-white"
                >
                  {" "}
                  <option value="">-- Select Fund Source --</option>{" "}
                  {fundSources.map((fs) => (
                    <option key={fs.id} value={fs.name}>
                      {fs.name}
                    </option>
                  ))}{" "}
                </select>{" "}
              </div>
              <div className="flex items-center mt-2">
                {" "}
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formState.isActive}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                  style={{ "--tw-ring-color": AU_RED }}
                />{" "}
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-slate-900"
                >
                  {" "}
                  Scholarship is Active
                </label>{" "}
              </div>
              <h5 className="text-sm font-semibold mt-2">
                Eligibility Criteria (Simplified)
              </h5>
              <div>
                <label className="text-xs">Min CGPA (Continuing)</label>
                <input
                  type="number"
                  step="0.1"
                  name="eligibilityCriteria.minCGPA"
                  value={formState.eligibilityCriteria?.minCGPA || ""}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-1.5 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs">
                  Min SGPA (Continuing, for renewal)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="eligibilityCriteria.minSGPA"
                  value={formState.eligibilityCriteria?.minSGPA || ""}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-1.5 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs">Min Entry Points (New)</label>
                <input
                  type="number"
                  name="eligibilityCriteria.minEntryPoints"
                  value={formState.eligibilityCriteria?.minEntryPoints || ""}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-1.5 text-sm border rounded-md"
                />
              </div>
              <div>
                <label className="text-xs">
                  Programs (comma-separated, or 'Any')
                </label>
                <input
                  type="text"
                  name="eligibilityCriteria.programs"
                  value={formState.eligibilityCriteria?.programs || ""}
                  onChange={handleFormChange}
                  className="mt-1 w-full p-1.5 text-sm border rounded-md"
                />
              </div>
              <button
                onClick={handleSaveScholarship}
                className="mt-3 px-5 py-2 text-white font-semibold rounded-md shadow hover:opacity-90"
                style={{ backgroundColor: AU_RED }}
              >
                {isEditing ? "Update" : "Save"} Definition
              </button>
            </div>
          )}
          {!selectedScholarship && isEditing && (
            <p className="text-slate-500">
              Select a scholarship to edit or click "Add New".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationReviewArea = ({
  applications,
  selectedApplication,
  setSelectedApplication,
  onShowAssignModal,
  internalScholarships,
}) => {
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedScholarships, setSuggestedScholarships] = useState([]);
  useEffect(() => {
    if (selectedApplication)
      setSuggestedScholarships(
        findMatchingScholarships(
          selectedApplication,
          internalScholarships.filter((s) => s.isActive)
        )
      );
    else setSuggestedScholarships([]);
  }, [selectedApplication, internalScholarships]);
  const findMatchingScholarships = (applicant, scholarships) => {
    if (!applicant) return [];
    return scholarships.filter((sch) => {
      const criteria = sch.eligibilityCriteria;
      let isMatch = true;
      if (
        applicant.yearOfStudy > 1 ||
        (applicant.yearOfStudy === 1 && applicant.semesterOfStudy > 1)
      ) {
        if (
          criteria.minCGPA &&
          (!applicant.cgpa || applicant.cgpa < criteria.minCGPA)
        )
          isMatch = false;
        if (
          criteria.minSGPA &&
          (!applicant.sgpa || applicant.sgpa < criteria.minSGPA)
        )
          isMatch = false;
      } else if (
        applicant.yearOfStudy === 1 &&
        applicant.semesterOfStudy === 1
      ) {
        if (
          criteria.minEntryPoints &&
          (!applicant.entryPoints ||
            applicant.entryPoints < criteria.minEntryPoints)
        )
          isMatch = false;
      }
      if (
        criteria.programs &&
        criteria.programs[0] !== "Any" &&
        !criteria.programs.includes(applicant.program)
      )
        isMatch = false;
      if (
        criteria.nationalities &&
        criteria.nationalities[0] !== "Any" &&
        criteria.nationalities[0] !== "Any African Nation" &&
        !criteria.nationalities.includes(applicant.nationality)
      )
        isMatch = false;
      if (
        criteria.gender &&
        criteria.gender !== "Any" &&
        applicant.gender !== criteria.gender
      )
        isMatch = false;
      if (criteria.financialNeed && !applicant.demonstratesFinancialNeed)
        isMatch = false;
      if (
        criteria.yearOfStudy &&
        Array.isArray(criteria.yearOfStudy) &&
        !criteria.yearOfStudy.includes(applicant.yearOfStudy)
      )
        isMatch = false;
      if (
        criteria.semesterOfStudy &&
        Array.isArray(criteria.semesterOfStudy) &&
        !criteria.semesterOfStudy.includes(applicant.semesterOfStudy)
      )
        isMatch = false;
      return isMatch;
    });
  };
  const filteredApplications = applications.filter(
    (app) =>
      (filterStatus ? app.status === filterStatus : true) &&
      (searchTerm
        ? app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Review General Applications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          {" "}
          <label className="text-sm font-medium mr-2">
            Filter by Status:
          </label>{" "}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-slate-300 rounded-md w-full md:w-auto"
          >
            {" "}
            <option value="">All</option>{" "}
            <option value="Submitted">Submitted</option>{" "}
            <option value="Under Review">Under Review</option>{" "}
            <option value="Committee Review">Committee Review</option>{" "}
            <option value="Decision Made">Decision Made</option>{" "}
          </select>{" "}
        </div>
        <div>
          {" "}
          <label className="text-sm font-medium mr-2">
            Search Applicant:
          </label>{" "}
          <input
            type="text"
            placeholder="Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-slate-300 rounded-md w-full md:w-auto"
          />{" "}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {" "}
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApplication(app)}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                  selectedApplication?.id === app.id
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 hover:border-red-300"
                }`}
                style={
                  selectedApplication?.id === app.id
                    ? { borderColor: AU_RED, backgroundColor: AU_RED_LIGHTER }
                    : {}
                }
              >
                {" "}
                <h4 className="font-medium text-slate-800">
                  {app.studentName}{" "}
                  <span className="text-xs text-slate-500">
                    ({app.studentId})
                  </span>
                </h4>{" "}
                <p className="text-xs text-slate-600">
                  {app.program} - Year {app.yearOfStudy}, Sem{" "}
                  {app.semesterOfStudy}
                </p>{" "}
                <span
                  className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                    app.status === "Submitted"
                      ? "bg-yellow-100 text-yellow-700"
                      : app.status === "Under Review"
                      ? "bg-blue-100 text-blue-700"
                      : app.status === "Committee Review"
                      ? "bg-purple-100 text-purple-700"
                      : app.status === "Decision Made"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {app.status}
                </span>{" "}
              </div>
            ))
          ) : (
            <p className="text-slate-500 p-4">
              No applications match current filters.
            </p>
          )}{" "}
        </div>
        <div className="lg:w-3/5 p-1">
          {" "}
          {selectedApplication ? (
            <ApplicantDetailsView
              application={selectedApplication}
              onShowAssignModal={onShowAssignModal}
              suggestedScholarships={suggestedScholarships}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-10 rounded-lg text-center">
              {" "}
              <Users size={48} className="text-slate-400 mb-4" />{" "}
              <p className="text-slate-600">
                Select an application from the list to view details.
              </p>{" "}
            </div>
          )}{" "}
        </div>
      </div>
    </div>
  );
};

const ApplicantDetailsView = ({
  application,
  onShowAssignModal,
  suggestedScholarships,
}) => {
  return (
    <div className="p-4 border border-slate-200 rounded-lg space-y-3 max-h-[600px] overflow-y-auto">
      <h4 className="text-xl font-semibold" style={{ color: AU_RED_DARKER }}>
        {application.studentName}{" "}
        <span className="text-sm font-normal text-slate-500">
          ({application.studentId})
        </span>
      </h4>
      <p>
        <strong>Program:</strong> {application.program}, Year{" "}
        {application.yearOfStudy}, Semester {application.semesterOfStudy}
      </p>{" "}
      <p>
        <strong>Nationality:</strong> {application.nationality}
      </p>{" "}
      <p>
        <strong>Gender:</strong> {application.gender || "Not Specified"}
      </p>
      {application.cgpa && (
        <p>
          <strong>CGPA:</strong> {application.cgpa}
        </p>
      )}{" "}
      {application.sgpa && (
        <p>
          <strong>SGPA:</strong> {application.sgpa}
        </p>
      )}{" "}
      {application.entryPoints && (
        <p>
          <strong>Entry Points:</strong> {application.entryPoints}
        </p>
      )}
      <p>
        <strong>Demonstrates Financial Need:</strong>{" "}
        {application.demonstratesFinancialNeed ? "Yes" : "No"}
      </p>
      <p>
        <strong>Motivation:</strong>{" "}
        <span className="text-sm text-slate-600 block whitespace-pre-wrap">
          {application.motivation}
        </span>
      </p>{" "}
      <p>
        <strong>Financial Statement:</strong>{" "}
        <span className="text-sm text-slate-600 block whitespace-pre-wrap">
          {application.financialStatement}
        </span>
      </p>{" "}
      <p>
        <strong>Documents:</strong> {application.documents?.join(", ") || "N/A"}
      </p>{" "}
      <p>
        <strong>Status:</strong> {application.status}
      </p>
      {suggestedScholarships && suggestedScholarships.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          {" "}
          <h5 className="font-semibold text-blue-600 mb-2 flex items-center">
            <Target size={18} className="mr-2" /> System Suggested Matches:
          </h5>{" "}
          <ul className="space-y-1 list-disc list-inside pl-2">
            {" "}
            {suggestedScholarships.map((sch) => (
              <li key={sch.id} className="text-sm text-slate-700">
                {" "}
                {sch.internalName}{" "}
                <span className="text-xs text-slate-500">
                  ({sch.type} - {sch.coverage})
                </span>{" "}
              </li>
            ))}{" "}
          </ul>{" "}
        </div>
      )}
      {application.assignedScholarshipId && application.awardDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          {" "}
          <h5 className="font-semibold text-green-600">
            Assigned Scholarship:
          </h5>{" "}
          <p className="text-sm">
            {application.awardDetails.scholarshipName} (
            {application.awardDetails.coverage})
          </p>{" "}
        </div>
      )}
      {application.status !== "Decision Made" && (
        <button
          onClick={() => onShowAssignModal(application)}
          className="mt-4 px-5 py-2 text-white font-semibold rounded-md shadow hover:opacity-90"
          style={{ backgroundColor: AU_RED }}
        >
          {" "}
          Assign to Scholarship{" "}
        </button>
      )}
    </div>
  );
};

const AssignScholarshipModal = ({
  application,
  internalScholarships,
  assigningScholarshipId,
  setAssigningScholarshipId,
  onClose,
  onAssign,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          {" "}
          <h2 className="text-xl font-bold" style={{ color: AU_RED_DARKER }}>
            Assign Scholarship to {application.studentName}
          </h2>{" "}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <XCircle size={28} />
          </button>{" "}
        </div>
        <div className="space-y-4">
          <div>
            {" "}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Internal Scholarship Definition:
            </label>{" "}
            <select
              value={assigningScholarshipId}
              onChange={(e) => setAssigningScholarshipId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 sm:text-sm"
              style={{ borderColor: AU_RED_LIGHTER, outlineColor: AU_RED }}
            >
              {" "}
              <option value="">-- Select Scholarship --</option>{" "}
              {internalScholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.internalName} ({s.coverage}) - Slots: {s.availableSlots}
                </option>
              ))}{" "}
            </select>{" "}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            {" "}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>{" "}
            <button
              type="button"
              onClick={onAssign}
              disabled={!assigningScholarshipId}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: AU_RED }}
            >
              {" "}
              Confirm Assignment{" "}
            </button>{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialReport = ({
  fundSources,
  applications,
  internalScholarships,
}) => {
  const totalAvailableFunds = fundSources.reduce(
    (sum, fund) => sum + (fund.totalAmount || 0),
    0
  );
  let totalDisbursed = 0;
  applications.forEach((app) => {
    if (app.assignedScholarshipId) {
      const assignedSch = internalScholarships.find(
        (s) => s.id === app.assignedScholarshipId
      );
      if (assignedSch && typeof assignedSch.allocatedAmount === "number")
        totalDisbursed += assignedSch.allocatedAmount;
      else if (assignedSch && typeof assignedSch.coverage === "string") {
        if (assignedSch.coverage.toLowerCase().includes("partial")) {
          const match = assignedSch.coverage.match(/\$?([0-9,]+)/);
          if (match && match[1])
            totalDisbursed += parseInt(match[1].replace(/,/g, ""), 10);
          else totalDisbursed += 1000;
        } else if (assignedSch.coverage.toLowerCase().includes("full tuition"))
          totalDisbursed += 5000;
      }
    }
  });
  const remainingBalance = totalAvailableFunds - totalDisbursed;
  const fundSourceDetails = fundSources.map((fund) => {
    let disbursedFromThisFund = 0;
    internalScholarships.forEach((sch) => {
      if (sch.fundSource === fund.name) {
        const count = applications.filter(
          (app) => app.assignedScholarshipId === sch.id
        ).length;
        disbursedFromThisFund +=
          count *
          (typeof sch.allocatedAmount === "number" ? sch.allocatedAmount : 0);
      }
    });
    return {
      ...fund,
      disbursed: disbursedFromThisFund,
      balance: (fund.totalAmount || 0) - disbursedFromThisFund,
    };
  });
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-8"
        style={{ color: AU_RED_DARKER }}
      >
        Financial Report
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {" "}
        <ReportStatCard
          title="Total Available Funds"
          value={`$${totalAvailableFunds.toLocaleString()}`}
          icon={Landmark}
          color={AU_RED}
        />{" "}
        <ReportStatCard
          title="Total Disbursed Funds"
          value={`$${totalDisbursed.toLocaleString()}`}
          icon={TrendingUp}
          color="#16a34a"
        />{" "}
        <ReportStatCard
          title="Remaining Balance"
          value={`$${remainingBalance.toLocaleString()}`}
          icon={TrendingDown}
          color="#f59e0b"
        />{" "}
      </div>
      <h4 className="text-xl font-semibold mb-4 text-slate-700">
        Funds Breakdown
      </h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            {" "}
            <tr>
              {" "}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fund Name
              </th>{" "}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Description
              </th>{" "}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Available
              </th>{" "}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Disbursed
              </th>{" "}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Balance
              </th>{" "}
            </tr>{" "}
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {" "}
            {fundSourceDetails.map((fund) => (
              <tr key={fund.id} className="hover:bg-red-50 transition-colors">
                {" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {fund.name}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate">
                  {fund.description}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                  ${(fund.totalAmount || 0).toLocaleString()}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                  ${fund.disbursed.toLocaleString()}
                </td>{" "}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                  ${fund.balance.toLocaleString()}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportStatCard = ({ title, value, icon: Icon, color }) => (
  <div
    className="p-5 rounded-lg shadow-lg text-white"
    style={{ backgroundColor: color }}
  >
    <div className="flex items-center justify-between mb-1">
      {" "}
      <p className="text-sm font-medium opacity-90">{title}</p>{" "}
      <Icon size={24} className="opacity-70" />{" "}
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ScholarshipPerformanceReport = ({
  internalScholarships,
  applications,
  fetchAPI,
}) => {
  const [selectedScholarshipForReport, setSelectedScholarshipForReport] =
    useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  useEffect(() => {
    if (selectedScholarshipForReport) {
      setLoadingPerformance(true);
      fetchAPI(`/scholarships/performance/${selectedScholarshipForReport.id}`)
        .then((data) => setPerformanceData(data?.performance || null))
        .catch((error) => {
          setPerformanceData(null); /* Error already handled by fetchAPI */
        })
        .finally(() => setLoadingPerformance(false));
    } else setPerformanceData(null);
  }, [selectedScholarshipForReport, fetchAPI]);

  const filteredScholarshipsForList = internalScholarships.filter(
    (sch) =>
      ((statusFilter === "active" && sch.isActive) ||
        (statusFilter === "inactive" && !sch.isActive) ||
        statusFilter === "all") &&
      (sch.internalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-6"
        style={{ color: AU_RED_DARKER }}
      >
        Scholarship Performance Report
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          {" "}
          <label
            htmlFor="statusFilterReport"
            className="text-sm font-medium text-slate-700 mr-2"
          >
            Filter by Status:
          </label>{" "}
          <select
            id="statusFilterReport"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-md bg-white focus:ring-red-500 focus:border-red-500 w-full md:w-auto"
          >
            {" "}
            <option value="all">All</option>{" "}
            <option value="active">Active</option>{" "}
            <option value="inactive">Inactive</option>{" "}
          </select>{" "}
        </div>
        <div>
          {" "}
          <label
            htmlFor="searchScholarshipReport"
            className="text-sm font-medium text-slate-700 mr-2"
          >
            Search Scholarship:
          </label>{" "}
          <input
            type="text"
            id="searchScholarshipReport"
            placeholder="Name or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-slate-300 rounded-md w-full md:w-auto"
          />{" "}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <h4 className="text-lg font-semibold text-slate-700 mb-2">
            Select Scholarship:
          </h4>
          {filteredScholarshipsForList.length > 0 ? (
            filteredScholarshipsForList.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedScholarshipForReport(s)}
                className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                  selectedScholarshipForReport?.id === s.id
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 hover:border-red-300"
                }`}
                style={
                  selectedScholarshipForReport?.id === s.id
                    ? { borderColor: AU_RED, backgroundColor: AU_RED_LIGHTER }
                    : {}
                }
              >
                {" "}
                <div className="flex justify-between items-center">
                  {" "}
                  <span className="font-medium text-slate-800">
                    {s.internalName}
                  </span>{" "}
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      s.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {" "}
                    {s.isActive ? "Active" : "Inactive"}{" "}
                  </span>{" "}
                </div>{" "}
              </div>
            ))
          ) : (
            <p className="text-slate-500 p-2">No scholarships match filters.</p>
          )}
        </div>
        <div className="lg:w-3/5 p-1">
          {loadingPerformance && (
            <div className="flex justify-center items-center h-40">
              <Loader2
                className="animate-spin h-8 w-8"
                style={{ color: AU_RED }}
              />
            </div>
          )}
          {!loadingPerformance && selectedScholarshipForReport ? (
            <div className="p-4 border border-slate-200 rounded-lg space-y-4">
              <h4
                className="text-xl font-semibold"
                style={{ color: AU_RED_DARKER }}
              >
                {selectedScholarshipForReport.internalName} - Performance
              </h4>
              <p>
                <strong>Status:</strong>{" "}
                {selectedScholarshipForReport.isActive ? "Active" : "Inactive"}
              </p>{" "}
              <p>
                <strong>Type:</strong> {selectedScholarshipForReport.type}
              </p>{" "}
              <p>
                <strong>Coverage:</strong>{" "}
                {selectedScholarshipForReport.coverage}
              </p>{" "}
              <p>
                <strong>Duration:</strong>{" "}
                {selectedScholarshipForReport.duration}
              </p>
              {performanceData ? (
                <>
                  {" "}
                  <p>
                    <strong>Total Disbursed (Lifetime):</strong> $
                    {performanceData.totalDisbursed?.toLocaleString() || "N/A"}
                  </p>{" "}
                  <div>
                    {" "}
                    <strong>Recipients by Year:</strong>{" "}
                    {performanceData.recipientCountByYear &&
                    Object.keys(performanceData.recipientCountByYear).length >
                      0 ? (
                      <ul className="list-disc list-inside pl-4 text-sm">
                        {" "}
                        {Object.entries(
                          performanceData.recipientCountByYear
                        ).map(([year, count]) => (
                          <li key={year}>
                            {year}: {count} recipients
                          </li>
                        ))}{" "}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">
                        No recipient count by year data.
                      </p>
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <strong>Recent Past Recipients (Sample):</strong>{" "}
                    {performanceData.pastRecipients &&
                    performanceData.pastRecipients.length > 0 ? (
                      <ul className="list-disc list-inside pl-4 text-sm space-y-1 mt-1">
                        {" "}
                        {performanceData.pastRecipients
                          .slice(0, 5)
                          .map((rec, idx) => (
                            <li key={rec.studentId || idx}>
                              {rec.name} ({rec.studentId}) - Awarded{" "}
                              {rec.yearAwarded} ({rec.program})
                            </li>
                          ))}{" "}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">
                        No past recipient data available.
                      </p>
                    )}{" "}
                  </div>{" "}
                </>
              ) : (
                <p className="text-slate-500 italic">
                  No detailed performance data available for this scholarship.
                </p>
              )}
              <div className="mt-4 text-sm text-slate-400 italic">
                {" "}
                (Conceptual: Charts for disbursement trends & recipient numbers
                per year would go here){" "}
              </div>
            </div>
          ) : (
            !loadingPerformance && (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-10 rounded-lg text-center">
                {" "}
                <Activity size={48} className="text-slate-400 mb-4" />{" "}
                <p className="text-slate-600">
                  Select a scholarship from the list to view its performance
                  details.
                </p>{" "}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const ScholarshipAssignmentReport = ({
  applications,
  internalScholarships,
}) => {
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  useEffect(() => {
    setLoadingReport(true);
    const assignedApps = applications.filter(
      (app) => app.assignedScholarshipId && app.status === "Decision Made"
    );
    const totalAssigned = assignedApps.length;
    const byGender = assignedApps.reduce((acc, app) => {
      acc[app.gender] = (acc[app.gender] || 0) + 1;
      return acc;
    }, {});
    const byYear = assignedApps.reduce((acc, app) => {
      const yearLabel = `Year ${app.yearOfStudy}`;
      acc[yearLabel] = (acc[yearLabel] || 0) + 1;
      return acc;
    }, {});
    const byProgram = assignedApps.reduce((acc, app) => {
      acc[app.program] = (acc[app.program] || 0) + 1;
      return acc;
    }, {});
    const byNationality = assignedApps.reduce((acc, app) => {
      acc[app.nationality] = (acc[app.nationality] || 0) + 1;
      return acc;
    }, {});
    setReportData({
      totalAssigned,
      byGender,
      byYear,
      byProgram,
      byNationality,
    });
    setLoadingReport(false);
  }, [applications]);

  const renderTable = (title, data, icon) => (
    <div className="mb-8 p-4 border border-slate-200 rounded-lg bg-white">
      <h4 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
        {" "}
        {icon &&
          React.createElement(icon, {
            size: 20,
            className: "mr-2",
            style: { color: AU_RED },
          })}{" "}
        {title}{" "}
      </h4>
      {Object.keys(data).length > 0 ? (
        <div className="overflow-x-auto">
          {" "}
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            {" "}
            <thead className="bg-slate-50">
              {" "}
              <tr>
                {" "}
                <th className="px-4 py-2 text-left font-medium text-slate-500">
                  Category
                </th>{" "}
                <th className="px-4 py-2 text-right font-medium text-slate-500">
                  Count
                </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody className="divide-y divide-slate-100">
              {" "}
              {Object.entries(data)
                .sort(([, a], [, b]) => b - a)
                .map(([key, value]) => (
                  <tr key={key} className="hover:bg-red-50">
                    {" "}
                    <td className="px-4 py-2 text-slate-600">{key}</td>{" "}
                    <td className="px-4 py-2 text-slate-600 text-right font-medium">
                      {value}
                    </td>{" "}
                  </tr>
                ))}{" "}
            </tbody>{" "}
          </table>{" "}
        </div>
      ) : (
        <p className="text-slate-500 italic">
          No data available for this breakdown.
        </p>
      )}
    </div>
  );
  if (loadingReport)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-12 w-12" style={{ color: AU_RED }} />
      </div>
    );
  if (!reportData)
    return <p className="text-slate-500">Could not generate report data.</p>;
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
      <h3
        className="text-2xl sm:text-3xl font-bold mb-8"
        style={{ color: AU_RED_DARKER }}
      >
        Scholarship Assignment Report (Overall)
      </h3>
      <div
        className="mb-8 p-6 rounded-lg shadow-md text-center"
        style={{ backgroundColor: AU_RED_LIGHTER }}
      >
        {" "}
        <p className="text-xl font-semibold" style={{ color: AU_RED_DARKER }}>
          Total Scholarships Assigned
        </p>{" "}
        <p className="text-5xl font-bold mt-2" style={{ color: AU_RED }}>
          {reportData.totalAssigned}
        </p>{" "}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {" "}
        {renderTable("By Gender", reportData.byGender, Users2)}{" "}
        {renderTable("By Year of Study", reportData.byYear, BookOpen)}{" "}
        {renderTable("By Program", reportData.byProgram, BookCopy)}{" "}
        {renderTable("By Nationality", reportData.byNationality, MapPin)}{" "}
      </div>
      <div className="mt-8 p-4 bg-slate-50 rounded-md text-sm text-slate-600 italic">
        {" "}
        Future Enhancement: Add filters for specific Academic Year and Semester
        to view historical assignment data.{" "}
      </div>
    </div>
  );
};

const DonorPortalView = () => (
  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl text-center">
    <Gift size={64} className="mx-auto mb-6" style={{ color: AU_RED }} />
    <h2
      className="text-2xl sm:text-3xl font-bold mb-4"
      style={{ color: AU_RED_DARKER }}
    >
      Donor Portal
    </h2>
    <p className="text-slate-600 mb-4">
      {" "}
      Welcome, valued donor representative! This portal is designed to provide
      you with insights into the impact of your contributions.{" "}
    </p>
    <div className="space-y-3 text-left max-w-md mx-auto text-slate-700">
      {" "}
      <p>
        <strong>Conceptual Features:</strong>
      </p>{" "}
      <ul className="list-disc list-inside pl-4 space-y-1">
        {" "}
        <li>
          View personalized impact reports for your specific fund(s).
        </li>{" "}
        <li>See aggregated, anonymized data on the students supported.</li>{" "}
        <li>Access (with consent) curated success stories or testimonials.</li>{" "}
        <li>Manage your communication preferences with the university.</li>{" "}
        <li>
          Explore opportunities for future giving and manage current pledges.
        </li>{" "}
      </ul>{" "}
    </div>
    <p className="text-xs text-slate-400 mt-8">
      {" "}
      (This is a placeholder view for the Donor Portal.){" "}
    </p>
  </div>
);

const PlaceholderView = ({ title, message, icon: Icon }) => (
  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl text-center">
    <h3
      className="text-2xl sm:text-3xl font-bold mb-4"
      style={{ color: AU_RED_DARKER }}
    >
      {title}
    </h3>
    <p className="text-slate-600">{message}</p>
    <div className="mt-6">
      {" "}
      {Icon ? (
        React.createElement(Icon, {
          size: 48,
          className: "mx-auto text-slate-300",
        })
      ) : (
        <Building size={48} className="mx-auto text-slate-300" />
      )}{" "}
    </div>
  </div>
);

const Footer = () => (
  <footer
    className="text-white text-center py-6 mt-auto"
    style={{ backgroundColor: AU_RED_DARKER }}
  >
    <div className="container mx-auto px-4">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Africa University. All rights
        reserved.
      </p>
      <p className="text-xs mt-1 opacity-80">
        SSMS Prototype - Conceptual MySQL Backend Version
      </p>
    </div>
  </footer>
);

export default App;
