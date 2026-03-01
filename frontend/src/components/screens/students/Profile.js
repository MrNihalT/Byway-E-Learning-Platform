import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { toast } from "react-toastify";

function Profile() {
    const { userData, updateUserData } = useContext(UserContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");

    const [isVerified, setIsVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword1, setNewPassword1] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword1, setShowNewPassword1] = useState(false);
    const [showNewPassword2, setShowNewPassword2] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Activity sections
    const [myCourses, setMyCourses] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [myComments, setMyComments] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }
        fetchProfile();
        fetchActivity();
    }, [userData, navigate]);

    const fetchActivity = async () => {
        setActivityLoading(true);
        try {
            const [coursesRes, postsRes, commentsRes] = await Promise.all([
                api.get("course/student/my-learning/"),
                api.get("community/my/posts/"),
                api.get("community/my/comments/"),
            ]);
            setMyCourses(coursesRes.data);
            setMyPosts(postsRes.data.slice(0, 10));
            setMyComments(commentsRes.data.slice(0, 10));
        } catch (err) {
            console.error("Failed to fetch activity", err);
        } finally {
            setActivityLoading(false);
        }
    };
    console.log(myCourses, myPosts, myComments);

    const fetchProfile = () => {
        api.get("auth/profile/")
            .then((res) => {
                const user = res.data;
                setUsername(user.username || "");
                setEmail(user.email || "");
                setFirstName(user.first_name || "");
                setLastName(user.last_name || "");
                setAboutMe(user.about_me || "");
                setExistingImageUrl(user.profile_picture || "");
                setIsVerified(user.is_email_verified);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch profile", err);
                setError("Could not load profile data.");
                setIsLoading(false);
            });
    };

    const handleSendOtp = async () => {
        setOtpLoading(true);
        try {
            await api.post("auth/send-otp/");
            setShowOtpModal(true);
            setSuccess("OTP sent to your email.");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to send OTP.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return toast.error("Please enter OTP");
        setOtpLoading(true);
        try {
            await api.post("auth/verify-profile-otp/", { otp });

            setIsVerified(true);
            setShowOtpModal(false);
            setOtp("");
            setSuccess("Email verified successfully!");

            updateUserData({
                type: "LOGIN",
                payload: { ...userData, is_email_verified: true },
            });
        } catch (err) {
            toast.error(err.response?.data?.error || "Invalid OTP.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("username", username);
        formData.append("email", email);
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("about_me", aboutMe);
        if (profilePicture) {
            formData.append("profile_picture", profilePicture);
        }

        try {
            const response = await api.put("auth/profile/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            updateUserData({
                type: "LOGIN",
                payload: { ...userData, ...response.data },
            });

            setSuccess("Profile updated successfully!");

            setIsVerified(response.data.is_email_verified);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setPasswordError("");
        setPasswordSuccess("");

        try {
            await api.post("auth/change-password/", {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            });
            setPasswordSuccess("Password changed successfully!");
            setOldPassword("");
            setNewPassword1("");
            setNewPassword2("");
        } catch (err) {
            const errors = err.response?.data;
            const messages = errors
                ? Object.values(errors).flat().join(" ")
                : "Failed to change password.";
            setPasswordError(messages);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <LoadingIndicator>Loading...</LoadingIndicator>;

    return (
        <>
            <Header />
            <Container>
                <ProfileCard>
                    <FormHeading>Edit Profile</FormHeading>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    {success && <SuccessMessage>{success}</SuccessMessage>}

                    <StyledForm onSubmit={handleProfileSubmit}>
                        <ImagePreviewContainer>
                            <ImagePreview
                                src={
                                    previewImage ||
                                    existingImageUrl ||
                                    "https://via.placeholder.com/150"
                                }
                                alt="Profile"
                            />
                            <FileInput
                                type="file"
                                id="profile_picture"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <FileLabel htmlFor="profile_picture">
                                Change Photo
                            </FileLabel>
                        </ImagePreviewContainer>

                        <Row>
                            <FormGroup>
                                <Label>Username</Label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </FormGroup>

                            <FormGroup>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Label>Email</Label>
                                    {isVerified ? (
                                        <Badge verified>✓ Verified</Badge>
                                    ) : (
                                        <VerifyLink
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={otpLoading}
                                        >
                                            {otpLoading
                                                ? "Sending..."
                                                : "Verify Now"}
                                        </VerifyLink>
                                    )}
                                </div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormGroup>
                        </Row>

                        <Row>
                            <FormGroup>
                                <Label>First Name</Label>
                                <Input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Last Name</Label>
                                <Input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                />
                            </FormGroup>
                        </Row>

                        <FormGroup>
                            <Label>About Me</Label>
                            <Textarea
                                rows="4"
                                value={aboutMe}
                                onChange={(e) => setAboutMe(e.target.value)}
                            />
                        </FormGroup>

                        <SubmitButton type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Profile"}
                        </SubmitButton>
                    </StyledForm>
                </ProfileCard>

                <PasswordCard>
                    <FormHeading>Change Password</FormHeading>
                    {passwordError && (
                        <ErrorMessage>{passwordError}</ErrorMessage>
                    )}
                    {passwordSuccess && (
                        <SuccessMessage>{passwordSuccess}</SuccessMessage>
                    )}
                    <StyledForm onSubmit={handlePasswordSubmit}>
                        <FormGroup>
                            <Label>Old Password</Label>
                            <PasswordInputWrapper>
                                <Input
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)
                                    }
                                    required
                                />
                                <EyeIcon
                                    onClick={() =>
                                        setShowOldPassword(!showOldPassword)
                                    }
                                >
                                    {showOldPassword ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 5C5.636 5 2 12 2 12C2 12 5.636 19 12 19C18.364 19 22 12 22 12C22 12 18.364 5 12 5Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M2 2L22 22M10.4735 4.88147C10.9702 4.79471 11.4802 4.75 12 4.75C18.364 4.75 22 11.75 22 11.75C22 11.75 20.3703 14.8385 17.5 16.8155M6.60416 6.30722C4.16281 7.96208 2 11.75 2 11.75C2 11.75 5.636 18.75 12 18.75C13.6063 18.75 15.1112 18.3479 16.4443 17.6534M9.87873 9.6288C9.32757 10.218 8.98782 11.0287 8.98782 11.9142C8.98782 13.7381 10.3358 15.2505 12.0911 15.4673"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </EyeIcon>
                            </PasswordInputWrapper>
                        </FormGroup>
                        <FormGroup>
                            <Label>New Password</Label>
                            <PasswordInputWrapper>
                                <Input
                                    type={
                                        showNewPassword1 ? "text" : "password"
                                    }
                                    value={newPassword1}
                                    onChange={(e) =>
                                        setNewPassword1(e.target.value)
                                    }
                                    required
                                />
                                <EyeIcon
                                    onClick={() =>
                                        setShowNewPassword1(!showNewPassword1)
                                    }
                                >
                                    {showNewPassword1 ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 5C5.636 5 2 12 2 12C2 12 5.636 19 12 19C18.364 19 22 12 22 12C22 12 18.364 5 12 5Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M2 2L22 22M10.4735 4.88147C10.9702 4.79471 11.4802 4.75 12 4.75C18.364 4.75 22 11.75 22 11.75C22 11.75 20.3703 14.8385 17.5 16.8155M6.60416 6.30722C4.16281 7.96208 2 11.75 2 11.75C2 11.75 5.636 18.75 12 18.75C13.6063 18.75 15.1112 18.3479 16.4443 17.6534M9.87873 9.6288C9.32757 10.218 8.98782 11.0287 8.98782 11.9142C8.98782 13.7381 10.3358 15.2505 12.0911 15.4673"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </EyeIcon>
                            </PasswordInputWrapper>
                        </FormGroup>
                        <FormGroup>
                            <Label>Confirm Password</Label>
                            <PasswordInputWrapper>
                                <Input
                                    type={
                                        showNewPassword2 ? "text" : "password"
                                    }
                                    value={newPassword2}
                                    onChange={(e) =>
                                        setNewPassword2(e.target.value)
                                    }
                                    required
                                />
                                <EyeIcon
                                    onClick={() =>
                                        setShowNewPassword2(!showNewPassword2)
                                    }
                                >
                                    {showNewPassword2 ? (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 5C5.636 5 2 12 2 12C2 12 5.636 19 12 19C18.364 19 22 12 22 12C22 12 18.364 5 12 5Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M2 2L22 22M10.4735 4.88147C10.9702 4.79471 11.4802 4.75 12 4.75C18.364 4.75 22 11.75 22 11.75C22 11.75 20.3703 14.8385 17.5 16.8155M6.60416 6.30722C4.16281 7.96208 2 11.75 2 11.75C2 11.75 5.636 18.75 12 18.75C13.6063 18.75 15.1112 18.3479 16.4443 17.6534M9.87873 9.6288C9.32757 10.218 8.98782 11.0287 8.98782 11.9142C8.98782 13.7381 10.3358 15.2505 12.0911 15.4673"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </EyeIcon>
                            </PasswordInputWrapper>
                        </FormGroup>
                        <SubmitButton type="submit" disabled={isSubmitting}>
                            Change Password
                        </SubmitButton>
                    </StyledForm>
                </PasswordCard>
            </Container>

            {/* ── Activity Sections ── */}
            <ActivityContainer>
                {/* Purchased / Enrolled Courses */}
                <ActivitySection>
                    <ActivityHeading>🎓 My Enrolled Courses</ActivityHeading>
                    {activityLoading ? (
                        <EmptyActivity>Loading...</EmptyActivity>
                    ) : myCourses.length === 0 ? (
                        <EmptyActivity>No enrolled courses yet.</EmptyActivity>
                    ) : (
                        <CoursesGrid>
                            {myCourses.map((course) => (
                                <CourseThumb
                                    key={course.id}
                                    to={`/learning/${course.id}`}
                                >
                                    <CourseThumbImg
                                        src={
                                            course.course_image ||
                                            "https://via.placeholder.com/220x130"
                                        }
                                        alt={course.title}
                                    />
                                    <CourseThumbTitle>
                                        {course.title}
                                    </CourseThumbTitle>
                                    <CourseThumbBadge>
                                        Continue →
                                    </CourseThumbBadge>
                                </CourseThumb>
                            ))}
                        </CoursesGrid>
                    )}
                </ActivitySection>

                <ActivityRow>
                    {/* Community Posts */}
                    <ActivitySection half>
                        <ActivityHeading>📝 My Community Posts</ActivityHeading>
                        {activityLoading ? (
                            <EmptyActivity>Loading...</EmptyActivity>
                        ) : myPosts.length === 0 ? (
                            <EmptyActivity>No posts yet.</EmptyActivity>
                        ) : (
                            <PostList>
                                {myPosts.map((post) => (
                                    <PostItem key={post.id}>
                                        <PostItemTitle>
                                            {post.title || "(no title)"}
                                        </PostItemTitle>
                                        <PostItemMeta>
                                            <span>❤️ {post.total_likes}</span>
                                            <span>
                                                {new Date(
                                                    post.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </PostItemMeta>
                                    </PostItem>
                                ))}
                            </PostList>
                        )}
                    </ActivitySection>

                    {/* Recent Comments */}
                    <ActivitySection half>
                        <ActivityHeading>💬 My Recent Comments</ActivityHeading>
                        {activityLoading ? (
                            <EmptyActivity>Loading...</EmptyActivity>
                        ) : myComments.length === 0 ? (
                            <EmptyActivity>
                                No comments on your posts yet.
                            </EmptyActivity>
                        ) : (
                            <PostList>
                                {myComments.map((comment) => (
                                    <CommentLink
                                        key={comment.id}
                                        to="/community"
                                        title="Go to Community"
                                    >
                                        <PostItem>
                                            <CommentMeta>
                                                <b>{comment.user_name}</b> on{" "}
                                                <i>{comment.post_title}</i>
                                            </CommentMeta>
                                            <CommentText>
                                                "{comment.text}"
                                            </CommentText>
                                            <PostItemMeta>
                                                <span>
                                                    {new Date(
                                                        comment.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                                <span
                                                    style={{ color: "#2563eb" }}
                                                >
                                                    View post →
                                                </span>
                                            </PostItemMeta>
                                        </PostItem>
                                    </CommentLink>
                                ))}
                            </PostList>
                        )}
                    </ActivitySection>
                </ActivityRow>
            </ActivityContainer>

            {showOtpModal && (
                <ModalOverlay>
                    <ModalContent>
                        <h3>Verify Email</h3>
                        <p>
                            Enter the 6-digit code sent to <b>{email}</b>
                        </p>
                        <Input
                            type="text"
                            placeholder="Enter OTP"
                            maxLength="6"
                            style={{
                                textAlign: "center",
                                letterSpacing: "4px",
                                fontSize: "1.2rem",
                            }}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <ModalButton
                                cancel
                                onClick={() => setShowOtpModal(false)}
                            >
                                Cancel
                            </ModalButton>
                            <ModalButton
                                onClick={handleVerifyOtp}
                                disabled={otpLoading}
                            >
                                {otpLoading ? "Verifying..." : "Verify"}
                            </ModalButton>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
}

export default Profile;

// --- STYLED COMPONENTS ---

const Container = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
    padding: 30px;
    background-color: #f4f7f6;
    min-height: calc(100vh - 80px);
`;

const Card = styled.div`
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 30px;
    @media (max-width: 768px) {
        padding: 20px;
    }
`;

const ProfileCard = styled(Card)`
    flex-basis: 500px;
    flex-grow: 1;
    max-width: 600px;
`;

const PasswordCard = styled(Card)`
    flex-basis: 350px;
    flex-grow: 1;
    max-width: 400px;
    height: fit-content;
`;

const FormHeading = styled.h2`
    text-align: center;
    color: #333;
    margin-top: 0;
    margin-bottom: 30px;
    font-weight: 600;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
const Label = styled.label`
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
`;
const Input = styled.input`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
const Textarea = styled.textarea`
    padding: 12px 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;
const Row = styled.div`
    display: flex;
    gap: 20px;
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 20px;
    }
`;

const ImagePreviewContainer = styled.div`
    text-align: center;
    margin-bottom: 10px;
`;
const ImagePreview = styled.img`
    margin: 0 auto 15px auto;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #eee;
`;
const FileInput = styled.input`
    display: none;
`;
const FileLabel = styled.label`
    display: inline-block;
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    &:hover {
        background-color: #0056b3;
    }
`;

const SubmitButton = styled.button`
    padding: 14px 25px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    margin-top: 15px;
    &:hover {
        background-color: #0056b3;
    }
    &:disabled {
        background-color: #a0c3ff;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
`;
const SuccessMessage = styled.p`
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
`;
const LoadingIndicator = styled.div`
    padding: 20px;
    text-align: center;
    font-size: 1.2em;
    color: #555;
`;

// --- VERIFICATION STYLES ---
const Badge = styled.span`
    font-size: 0.8rem;
    color: ${(p) => (p.verified ? "#15803d" : "#b91c1c")};
    background: ${(p) => (p.verified ? "#dcfce7" : "#fee2e2")};
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
`;
const VerifyLink = styled.button`
    background: none;
    border: none;
    color: #2563eb;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
    &:disabled {
        color: #94a3b8;
        cursor: not-allowed;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;
const ModalContent = styled.div`
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 350px;
    text-align: center;
    h3 {
        margin-top: 0;
        color: #1e293b;
    }
    p {
        color: #64748b;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
`;
const ModalButton = styled.button`
    flex: 1;
    padding: 10px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    background: ${(p) => (p.cancel ? "#f1f5f9" : "#0f172a")};
    color: ${(p) => (p.cancel ? "#475569" : "white")};
    &:hover {
        opacity: 0.9;
    }
`;

const PasswordInputWrapper = styled.div`
    position: relative;
`;

const EyeIcon = styled.div`
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #606770;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
        width: 20px;
        height: 20px;
    }
    &:hover {
        color: #1c1e21;
    }
`;

const ActivityContainer = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 30px 60px;
    width: 100%;
    box-sizing: border-box;
`;

const ActivityRow = styled.div`
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
`;

const ActivitySection = styled.div`
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    padding: 24px 28px;
    margin-bottom: 24px;
    flex: ${(p) => (p.half ? "1 1 320px" : "1 1 100%")};
    min-width: 0;
`;

const ActivityHeading = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 18px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f1f5f9;
`;

const EmptyActivity = styled.p`
    color: #94a3b8;
    font-size: 0.9rem;
    text-align: center;
    padding: 20px 0;
    margin: 0;
`;

const CoursesGrid = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
`;

const CourseThumb = styled(Link)`
    display: flex;
    flex-direction: column;
    width: 200px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    text-decoration: none;
    color: inherit;
    transition:
        transform 0.18s,
        box-shadow 0.18s;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
`;

const CourseThumbImg = styled.img`
    width: 100%;
    height: 110px;
    object-fit: cover;
`;

const CourseThumbTitle = styled.p`
    font-size: 0.82rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    padding: 8px 10px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CourseThumbBadge = styled.span`
    display: block;
    font-size: 0.75rem;
    color: #2563eb;
    font-weight: 600;
    padding: 0 10px 10px;
`;

const PostList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const PostItem = styled.div`
    background: #f8fafc;
    border-radius: 8px;
    padding: 12px 14px;
    border-left: 3px solid #2563eb;
`;

const PostItemTitle = styled.p`
    margin: 0 0 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
`;

const PostItemMeta = styled.div`
    display: flex;
    gap: 12px;
    font-size: 0.75rem;
    color: #64748b;
`;

const CommentMeta = styled.p`
    margin: 0 0 4px;
    font-size: 0.78rem;
    color: #64748b;
`;

const CommentText = styled.p`
    margin: 0 0 6px;
    font-size: 0.88rem;
    color: #334155;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CommentLink = styled(Link)`
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 8px;
    transition:
        transform 0.15s,
        box-shadow 0.15s;
    &:hover > div {
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15);
        border-left-color: #1d4ed8;
    }
`;
