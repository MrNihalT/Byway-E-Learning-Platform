import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { toast } from "react-toastify";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("auth/verify-user-otp/", { otp });
            toast.success(res.data.message);
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.error || "Verification failed");
        }
    };

    return (
        <Container>
            <FormBox onSubmit={handleSubmit}>
                <h2>Verify Email</h2>
                <p>Enter the 6-digit code sent to your email.</p>
                <Input
                    type="text"
                    maxLength="6"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <Button type="submit">Verify</Button>
            </FormBox>
        </Container>
    );
}

const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f8f9fa;
`;

const FormBox = styled.form`
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 350px;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    margin: 20px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    text-align: center;
    letter-spacing: 2px;
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    background-color: #0f172a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
        background-color: #1e293b;
    }
`;
