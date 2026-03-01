import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { UserProvider } from "./components/includes/UserProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Auth
import Login from "./components/screens/auth/Login";
import Signup from "./components/screens/auth/Signup";

// Public Pages
import Product from "./components/screens/Product"; // Home
import AllCoursesPage from "./components/screens/public/AllCoursesPage";
import AllInstructorsPage from "./components/screens/public/AllInstructorsPage";
import CourseSingle from "./components/screens/public/CourseSingle";
import InstructorCourses from "./components/screens/instructor/InstructorCourses"; // Portfolio

// Student Pages
import CartPage from "./components/screens/students/CartPage";
import WishlistPage from "./components/screens/students/WishlistPage";
import MyLearning from "./components/screens/students/MyLearning";
import StudentCoursePlayer from "./components/screens/students/StudentCoursePlayer"; // New Player
import Profile from "./components/screens/students/Profile";

// Instructor Pages
import CreatePost from "./components/screens/instructor/CreatePost"; // Create Course Step 1
import EditCourse from "./components/screens/instructor/EditCourse"; // Course Editor (Curriculum)
import MyCourses from "./components/screens/students/MyCourses"; // Instructor Dashboard
import InstructorGrading from "./components/screens/instructor/InstructorGrading"; // Grading

// Admin
import AdminDashboard from "./components/screens/admin/AdminDashboard";
import StudentAssignments from "./components/screens/instructor/StudentAssignments";
import BecomeInstructor from "./components/screens/instructor/BecomeInstructor";
import AdminInstructorRequests from "./components/screens/admin/AdminInstructorRequests";
import Community from "./components/screens/community/Community";
import Chat from "./components/screens/chat/Chat";
import StudentPublicProfile from "./components/screens/chat/StudentPublicProfile";
import InstructorDashboard from "./components/screens/instructor/InstructorDashboard";
import AllCategories from "./components/screens/course/AllCategories";
import CategoryPage from "./components/screens/course/CategoryPage";
import MyCertificates from "./components/screens/course/MyCertificates";
import ForgotPassword from "./components/screens/auth/ForgotPassword";
import ResetPassword from "./components/screens/auth/ResetPassword";
import VerifyOtp from "./components/screens/auth/VerifyOtp";
import Report from "./components/screens/admin/Report";
import NotFound from "./components/screens/public/NotFound";
import Support from "./components/screens/public/Support";
import AdminSupport from "./components/screens/admin/AdminSupport";
import AllCourseAdmin from "./components/screens/admin/AllCourseAdmin";
import PrivacyPolicy from "./components/screens/public/PrivacyPolicy";

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    {/* --- Public Routes --- */}
                    <Route path="*" element={<NotFound />} />
                    <Route path="/" element={<Product />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    <Route path="/courses" element={<AllCoursesPage />} />
                    <Route path="/course/:id" element={<CourseSingle />} />

                    <Route
                        path="/instructors"
                        element={<AllInstructorsPage />}
                    />
                    <Route
                        path="/instructor/:instructorId"
                        element={<InstructorCourses />}
                    />

                    {/* --- Student Routes --- */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/profile" element={<Profile />} />

                    <Route path="/my-learning" element={<MyLearning />} />
                    <Route
                        path="/learning/:courseId"
                        element={<StudentCoursePlayer />}
                    />

                    {/* --- Instructor Routes --- */}
                    <Route path="/create_post" element={<CreatePost />} />
                    <Route path="/my_courses" element={<MyCourses />} />
                    <Route
                        path="/instructor/edit-course/:courseId"
                        element={<EditCourse />}
                    />
                    <Route
                        path="/instructor/grading"
                        element={<InstructorGrading />}
                    />
                    <Route
                        path="/instructor/dashboard"
                        element={<InstructorDashboard />}
                    />

                    {/* --- Admin Routes --- */}
                    <Route path="/admin/courses" element={<AllCourseAdmin />} />
                    <Route
                        path="/admin-dashboard"
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="/my-assignments"
                        element={<StudentAssignments />}
                    />
                    <Route path="/report" element={<Report />} />
                    <Route
                        path="/become-instructor"
                        element={<BecomeInstructor />}
                    />
                    <Route
                        path="/admin/instructor-requests"
                        element={<AdminInstructorRequests />}
                    />
                    <Route path="/community" element={<Community />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route
                        path="/student/:studentId"
                        element={<StudentPublicProfile />}
                    />
                    <Route path="/categories" element={<AllCategories />} />
                    <Route
                        path="/category/:categoryId"
                        element={<CategoryPage />}
                    />
                    <Route
                        path="/student/certificates"
                        element={<MyCertificates />}
                    />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/reset-password/:uid/:token"
                        element={<ResetPassword />}
                    />
                    <Route path="/support" element={<Support />} />
                    <Route path="/admin/support" element={<AdminSupport />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} />
        </UserProvider>
    );
}

export default App;
