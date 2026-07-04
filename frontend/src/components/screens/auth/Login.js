import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../includes/UserProvider";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { BASE_URL } from "../../../api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { updateUserData, userData } = useContext(UserContext);

    const navigate = useNavigate();

    // If user is already logged in, redirect immediately to home page
    useEffect(() => {
        if (userData?.access) {
            navigate("/");
        }
    }, [userData, navigate]);

    if (userData?.access) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        axios
            .post(`${BASE_URL}auth/token/`, {
                username,
                password,
            })
            .then((response) => {
                const { access, refresh } = response.data.data;
                const { email, role, is_superuser, profile_picture, about_me } =
                    response.data.data.user;

                if (access && refresh) {
                    const data = {
                        access,
                        refresh,
                        username,
                        email,
                        role,
                        is_superuser,
                        profile_picture,
                        about_me,
                    };
                    localStorage.setItem("user_data", JSON.stringify(data));
                    updateUserData({ type: "LOGIN", payload: data });
                    navigate("/");
                } else {
                    setMessage(message || "Invalid login credentials.");
                }
            })
            .catch((error) => {
                if (error.response) {
                    console.log("Response Error Data:", error.response.data);
                    console.log("Response Status:", error.response.status);

                    const serverMessage =
                        error.response.data.data || error.response.data.message;

                    if (serverMessage) {
                        setMessage(
                            Array.isArray(serverMessage)
                                ? serverMessage.join(" ")
                                : serverMessage,
                        );
                    } else {
                        setMessage(
                            `Error: ${error.response.status} - ${error.response.statusText}`,
                        );
                    }
                } else if (error.request) {
                    console.log("No Response:", error.request);
                    setMessage(
                        "The server is not responding. Please try again later.",
                    );
                } else {
                    console.log("Axios Setup Error:", error.message);
                    setMessage(
                        "An error occurred. Please check your network connection.",
                    );
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Container>
            <RightContainer>
                <LoginContainer>
                    <LoginHeading>Login an Account</LoginHeading>
                    <LoginInfo>
                        Access all features by login an account
                    </LoginInfo>
                    <Form method="POST" onSubmit={handleSubmit}>
                        <InputContainer>
                            <TextInput
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                type="text"
                                placeholder="Username"
                                required
                            />
                        </InputContainer>

                        <InputContainer>
                            <TextInput
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                required
                            />
                            <EyeIcon
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
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
                        </InputContainer>

                        <ForgotLinkContainer>
                            <ForgotLink to="/forgot-password">
                                Forgot Password?
                            </ForgotLink>
                        </ForgotLinkContainer>

                        {message && <ErrorMessage>{message}</ErrorMessage>}

                        <ButtonContainer>
                            <SubmitButton type="submit" disabled={isLoading}>
                                {isLoading ? "Loading..." : "Login"}
                            </SubmitButton>
                        </ButtonContainer>

                        <RedirectLinkContainer>
                            Don't have an account?{" "}
                            <LoginLink to="/signup">Register Now</LoginLink>
                        </RedirectLinkContainer>
                    </Form>
                </LoginContainer>
            </RightContainer>
        </Container>
    );
}

export default Login;

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    padding: 15px;
    justify-content: center; /* Center the content */
    align-items: center; /* Vertically center */
    background-color: #f0f2f5; /* Add a light background */
`;

const RightContainer = styled.div`
    background: #ffffff;
    width: 100%;
    max-width: 450px; /* Set a max-width for better appearance */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    padding: 40px 50px; /* Adjust padding */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
`;

const LoginContainer = styled.div`
    width: 100%;
`;

const LoginHeading = styled.h3`
    font-size: 28px; /* Slightly smaller for balance */
    font-weight: 600; /* Use semibold */
    margin-bottom: 10px;
    text-align: center;
    color: #1c1e21;
`;

const LoginInfo = styled.p`
    font-size: 16px;
    margin-bottom: 30px;
    text-align: center;
    color: #606770;
`;

const Form = styled.form`
    width: 100%;
    display: block;
`;

const InputContainer = styled.div`
    margin-bottom: 15px;
    position: relative;
`;

const TextInput = styled.input`
    padding: 16px 50px 16px 20px;
    width: 100%;
    display: block;
    border: 1px solid #dddfe2;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: #046bf6;
    }
    &::-ms-reveal,
    &::-ms-clear {
        display: none;
    }
    &::-webkit-credentials-auto-fill-button,
    &::-webkit-textfield-decoration-container {
        display: none !important;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 10px;
`;

const SubmitButton = styled.button`
    background: #046bf6;
    border: 0;
    outline: 0;
    color: #fff;
    width: 100%;
    padding: 16px 20px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background: #0359d1;
    }

    &:disabled {
        background: #a0c3ff;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    color: #d93025; /* A standard error red color */
    margin-bottom: 15px;
    text-align: center;
    font-weight: 500;
`;

const RedirectLinkContainer = styled.div`
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #606770;
`;

const LoginLink = styled(Link)`
    color: #046bf6;
    font-weight: 500;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;
const ForgotLinkContainer = styled.div`
    text-align: right;
    margin-bottom: 20px;
`;

const ForgotLink = styled(Link)`
    font-size: 14px;
    color: #606770;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
        color: #046bf6;
    }
`;

const EyeIcon = styled.div`
    position: absolute;
    right: 20px;
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
