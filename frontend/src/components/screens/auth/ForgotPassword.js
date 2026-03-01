import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import api from "../../../api"; 

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("auth/request-reset-email/", { email });
            setMessage(
                "If an account exists with this email, a reset link has been sent. Please check your inbox."
            );
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormBox>
                <Title>Forgot Password?</Title>
                <Text>Enter your email to receive a reset link.</Text>

                {message && <Alert>{message}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </Form>
                <BackLink to="/login">Back to Login</BackLink>
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
    margin-bottom: 10px;
    color: #0f172a;
`;
const Text = styled.p`
    color: #64748b;
    margin-bottom: 20px;
    font-size: 14px;
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
    background: #dcfce7;
    color: #166534;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 15px;
    text-align: left;
`;
const BackLink = styled(Link)`
    display: block;
    margin-top: 15px;
    color: #64748b;
    text-decoration: none;
    font-size: 14px;
    &:hover {
        color: #0f172a;
    }
`;
