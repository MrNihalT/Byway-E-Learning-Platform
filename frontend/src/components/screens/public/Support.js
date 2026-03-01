import React, { useState } from "react";
import styled from "styled-components";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { toast } from "react-toastify";
import api from "../../../api";

export default function Support() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post("course/support/", formData);
            toast.success("Support request sent successfully!");
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            console.error("Error sending support request:", err);
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to send support request. Please try again later.";
            toast.error(errorMsg);
            if (err.response?.data) {
                console.log("Backend error details:", err.response.data);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Header />
            <ContentWrapper>
                <SupportSection>
                    <div className="wrapper">
                        <TitleSection>
                            <MainTitle>Contact Support</MainTitle>
                            <SubTitle>
                                Have a question or need assistance? We're here
                                to help!
                            </SubTitle>
                        </TitleSection>

                        <ContactGrid>
                            <InfoCard>
                                <InfoTitle>Get in Touch</InfoTitle>
                                <InfoText>
                                    Fill out the form and our team will get back
                                    to you as soon as possible.
                                </InfoText>
                                <ContactDetails>
                                    <DetailItem>
                                        <Icon className="fa-solid fa-envelope" />
                                        <DetailText>
                                            nihal.chiyoor@gmail.com
                                        </DetailText>
                                    </DetailItem>
                                    <DetailItem>
                                        <Icon className="fa-solid fa-location-dot" />
                                        <DetailText>
                                            Byway Education HQ
                                        </DetailText>
                                    </DetailItem>
                                </ContactDetails>
                            </InfoCard>

                            <FormCard>
                                <Form onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Label>Full Name</Label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Subject</Label>
                                        <Input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="What can we help you with?"
                                            required
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>Message</Label>
                                        <TextArea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us more about your inquiry..."
                                            required
                                        ></TextArea>
                                    </FormGroup>

                                    <SubmitButton
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? "Sending..."
                                            : "Send Message"}
                                    </SubmitButton>
                                </Form>
                            </FormCard>
                        </ContactGrid>
                    </div>
                </SupportSection>
            </ContentWrapper>
            <Footer />
        </PageContainer>
    );
}

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f8fafc;
`;

const ContentWrapper = styled.div`
    flex: 1;
`;

const SupportSection = styled.section`
    padding: 80px 0;
`;

const TitleSection = styled.div`
    text-align: center;
    margin-bottom: 60px;
`;

const MainTitle = styled.h1`
    font-size: 36px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
`;

const SubTitle = styled.p`
    font-size: 18px;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
`;

const ContactGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 40px;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const InfoCard = styled.div`
    background: #1e293b;
    color: white;
    padding: 40px;
    border-radius: 16px;
    height: fit-content;
`;

const InfoTitle = styled.h2`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #ffffffff;
`;

const InfoText = styled.p`
    font-size: 16px;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 40px;
`;

const ContactDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const DetailItem = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Icon = styled.i`
    font-size: 20px;
    color: #3b82f6;
    width: 24px;
`;

const DetailText = styled.span`
    font-size: 16px;
    color: #f1f5f9;
`;

const FormCard = styled.div`
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #334155;
`;

const Input = styled.input`
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: #3b82f6;
    }
`;

const TextArea = styled.textarea`
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    min-height: 150px;
    resize: vertical;
    transition: border-color 0.2s;

    &:focus {
        border-color: #3b82f6;
    }
`;

const SubmitButton = styled.button`
    padding: 14px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.2s,
        opacity 0.2s;

    &:hover:not(:disabled) {
        background: #2563eb;
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
