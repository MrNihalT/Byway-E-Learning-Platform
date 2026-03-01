import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useParams } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function PaymentStatusPage() {
    const { mtId } = useParams();
    const [status, setStatus] = useState("pending");
    const [error, setError] = useState("");
    const [tries, setTries] = useState(0);

    useEffect(() => {
        if (!mtId) {
            setStatus("failed");
            setError("Missing payment id.");
            return;
        }

        let cancelled = false;
        const doCheck = async () => {
            try {
                const res = await api.get(
                    `course/check-payment-status/${mtId}/`
                );
                const d = res.data;
                if (d.status === "success") {
                    if (!cancelled) setStatus("success");
                } else {
                    if (tries < 4) {
                        setTries((t) => t + 1);
                        setTimeout(doCheck, 2000);
                    } else {
                        if (!cancelled) {
                            setStatus("failed");
                            setError(
                                d.raw
                                    ? JSON.stringify(d.raw)
                                    : "Payment pending/failed."
                            );
                        }
                    }
                }
            } catch (err) {
                if (tries < 4) {
                    setTries((t) => t + 1);
                    setTimeout(doCheck, 2000);
                } else {
                    setStatus("failed");
                    setError(
                        err.response?.data?.error ||
                            err.message ||
                            "Could not verify payment."
                    );
                }
            }
        };

        const timer = setTimeout(doCheck, 1200); 
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
     
    }, [mtId, tries]);

    return (
        <>
            <Header />
            <StatusContainer>
                {status === "pending" && (
                    <LoadingWrapper>Verifying payment…</LoadingWrapper>
                )}
                {status === "success" && (
                    <StatusBox success>
                        <Title>Payment Successful</Title>
                        <Message>
                            You are enrolled.{" "}
                            <StyledLink to="/my_courses">
                                Go to My Courses
                            </StyledLink>
                        </Message>
                    </StatusBox>
                )}
                {status === "failed" && (
                    <StatusBox>
                        <Title>Payment Failed or Pending</Title>
                        <ErrorMessage>{error}</ErrorMessage>
                        <StyledLink to="/">Back to Home</StyledLink>
                    </StatusBox>
                )}
            </StatusContainer>
            <Footer />
        </>
    );
}


const StatusContainer = styled.div`...`;
const StatusBox = styled.div`...`;
const Title = styled.h2`...`;
const Message = styled.p`...`;
const ErrorMessage = styled.p`...`;
const StyledLink = styled(Link)`...`;
const LoadingWrapper = styled.div`...`;
