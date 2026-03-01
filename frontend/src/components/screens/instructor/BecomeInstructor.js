import React, { useState, useContext } from "react";
import styled from "styled-components";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { useNavigate } from "react-router-dom";

export default function BecomeInstructor() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        gender: "Male",
        dob: "",
        qualification: "",
        experience_years: "",
        domain_expertise: "",
        bio: "",
        linkedin_profile: "",
        bank_account_no: "",
        bank_ifsc_code: "",
    });

    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Handle Text Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle File Input Change
    const handleFileChange = (e) => {
        setCvFile(e.target.files[0]);
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Create FormData object for file upload
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        if (cvFile) {
            data.append("cv_file", cvFile);
        }

        try {
            await api.post("auth/instructor/apply/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage({
                type: "success",
                text: "Application submitted successfully! We will review it shortly.",
            });
            setTimeout(() => navigate("/profile"), 3000); // Redirect after success
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.error ||
                "Failed to submit application. Please check your inputs.";
            setMessage({ type: "error", text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    if (userData?.role === "instructor") {
        return (
            <PageWrapper>
                <Header />
                <HeroSection>
                    <div className="wrapper">
                        <HeroContent>
                            <StatusBadge>Instructor Account Active</StatusBadge>
                            <HeroTitle>
                                Welcome Back to your Instructor Hub
                            </HeroTitle>
                            <HeroSubtitle>
                                You're already part of our elite teaching
                                community. Ready to inspire the next generation
                                of learners?
                            </HeroSubtitle>
                            <ButtonGroup>
                                <PrimaryBtn
                                    onClick={() =>
                                        navigate("/instructor/dashboard")
                                    }
                                >
                                    Go to Dashboard
                                </PrimaryBtn>
                                <SecondaryBtn
                                    onClick={() => navigate("/create_post")}
                                >
                                    Create New Course
                                </SecondaryBtn>
                            </ButtonGroup>
                        </HeroContent>
                    </div>
                </HeroSection>
                <Footer />
            </PageWrapper>
        );
    }

    return (
        <>
            <Header />
            <Container>
                <FormCard>
                    <Title>Become an Instructor</Title>
                    <Subtitle>
                        Join our team and start teaching the world.
                    </Subtitle>

                    {message && (
                        <AlertBox type={message.type}>{message.text}</AlertBox>
                    )}

                    <Form onSubmit={handleSubmit}>
                        {/* 1. Personal Info */}
                        <SectionTitle>1. Personal Information</SectionTitle>
                        <Row>
                            <InputGroup>
                                <Label>Full Name</Label>
                                <Input
                                    required
                                    name="full_name"
                                    placeholder="John Doe"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Phone Number</Label>
                                <Input
                                    required
                                    name="phone_number"
                                    placeholder="+91 9876543210"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                        </Row>
                        <Row>
                            <InputGroup>
                                <Label>Date of Birth</Label>
                                <Input
                                    required
                                    type="date"
                                    name="dob"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Gender</Label>
                                <Select name="gender" onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Select>
                            </InputGroup>
                        </Row>

                        {/* 2. Professional Info */}
                        <SectionTitle>2. Professional Details</SectionTitle>
                        <Row>
                            <InputGroup>
                                <Label>Qualification</Label>
                                <Input
                                    required
                                    name="qualification"
                                    placeholder="e.g. Masters in CS"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>Years of Experience</Label>
                                <Input
                                    required
                                    type="number"
                                    name="experience_years"
                                    placeholder="e.g. 5"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                        </Row>
                        <InputGroup>
                            <Label>Domain Expertise</Label>
                            <Input
                                required
                                name="domain_expertise"
                                placeholder="e.g. Web Development, AI, Music"
                                onChange={handleChange}
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label>Upload CV / Resume (PDF)</Label>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label>Bio / About You</Label>
                            <TextArea
                                required
                                name="bio"
                                rows="4"
                                placeholder="Tell us why you want to teach..."
                                onChange={handleChange}
                            />
                        </InputGroup>

                        {/* 3. Social & Payout */}
                        <SectionTitle>3. Social & Payout Info</SectionTitle>
                        <InputGroup>
                            <Label>LinkedIn Profile URL</Label>
                            <Input
                                type="url"
                                name="linkedin_profile"
                                placeholder="https://linkedin.com/in/..."
                                onChange={handleChange}
                            />
                        </InputGroup>
                        <Row>
                            <InputGroup>
                                <Label>Bank Account Number</Label>
                                <Input
                                    required
                                    name="bank_account_no"
                                    placeholder="Account No"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label>IFSC / Sort Code</Label>
                                <Input
                                    required
                                    name="bank_ifsc_code"
                                    placeholder="IFSC Code"
                                    onChange={handleChange}
                                />
                            </InputGroup>
                        </Row>

                        <SubmitBtn type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Application"}
                        </SubmitBtn>
                    </Form>
                </FormCard>
            </Container>
        </>
    );
}

// --- STYLED COMPONENTS ---

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f8fafc;
`;

const HeroSection = styled.section`
    flex: 1;
    display: flex;
    align-items: center;
    padding: 100px 0;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: white;
    text-align: center;
`;

const HeroContent = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const StatusBadge = styled.span`
    display: inline-block;
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 24px;
    border: 1px solid rgba(59, 130, 246, 0.3);
`;

const HeroTitle = styled.h1`
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 20px;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
        font-size: 36px;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 20px;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 40px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 20px;
    justify-content: center;

    @media (max-width: 480px) {
        flex-direction: column;
    }
`;

const PrimaryBtn = styled.button`
    padding: 16px 32px;
    background-color: #3b82f6;
    color: white;
    font-size: 16px;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);

    &:hover {
        background-color: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.23);
    }
`;

const SecondaryBtn = styled.button`
    padding: 16px 32px;
    background-color: transparent;
    color: white;
    font-size: 16px;
    font-weight: 700;
    border: 2px solid #334155;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: #334155;
        border-color: #475569;
        transform: translateY(-2px);
    }
`;

const Container = styled.div`
    background-color: #f8f9fa;
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
`;

const FormCard = styled.div`
    background: white;
    width: 100%;
    max-width: 800px;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
    text-align: center;
    color: #1e293b;
    margin-bottom: 10px;
`;

const Subtitle = styled.p`
    text-align: center;
    color: #64748b;
    margin-bottom: 30px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    color: #0f172a;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 10px;
    margin-top: 20px;
`;

const Row = styled.div`
    display: flex;
    gap: 20px;
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 15px;
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Label = styled.label`
    font-weight: 500;
    margin-bottom: 8px;
    color: #334155;
    font-size: 14px;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 15px;
    &:focus {
        outline: 2px solid #3b82f6;
        border-color: transparent;
    }
`;

const Select = styled.select`
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 15px;
    background: white;
`;

const TextArea = styled.textarea`
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 15px;
    resize: vertical;
    &:focus {
        outline: 2px solid #3b82f6;
        border-color: transparent;
    }
`;

const SubmitBtn = styled.button`
    background-color: #0f172a;
    color: white;
    padding: 15px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: 0.2s;
    &:hover {
        background-color: #1e293b;
    }
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const AlertBox = styled.div`
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: center;
    background-color: ${(p) => (p.type === "error" ? "#fee2e2" : "#dcfce7")};
    color: ${(p) => (p.type === "error" ? "#991b1b" : "#166534")};
    border: 1px solid ${(p) => (p.type === "error" ? "#fecaca" : "#bbf7d0")};
`;
