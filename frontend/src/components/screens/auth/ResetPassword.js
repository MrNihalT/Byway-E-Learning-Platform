import React, { useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";

export default function ResetPassword() {
    const { uid, token } = useParams(); 
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPass) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            await api.patch("auth/password-reset-complete/", {
                password: password,
                token: token,
                uidb64: uid,
            });
            setMessage("Success! Password reset. Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError("Invalid or expired link. Please request a new one.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormBox>
                <Title>Set New Password</Title>
                {message && <Alert success>{message}</Alert>}
                {error && <Alert>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </Form>
            </FormBox>
        </Container>
    );
}


const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f8fafc;
`;
const FormBox = styled.div`
    background: white;
    padding: 40px;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
`;
const Title = styled.h2`
    margin-bottom: 20px;
    color: #0f172a;
`;
const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;
const Input = styled.input`
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
`;
const Button = styled.button`
    padding: 12px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    &:disabled {
        background: #94a3b8;
    }
`;
const Alert = styled.div`
    background: ${(props) => (props.success ? "#dcfce7" : "#fee2e2")};
    color: ${(props) => (props.success ? "#166534" : "#991b1b")};
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 15px;
`;
