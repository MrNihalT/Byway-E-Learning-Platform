import React, { useState } from "react";
import styled from "styled-components";
import api from "../../../api";
import { toast } from "react-toastify";

const AssignmentPlayer = ({ content }) => {
    const assignment = content.assignment_details;
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        if (file) formData.append("submitted_file", file);
        if (text) formData.append("submitted_text", text);
        if (!file && !text) {
            toast.error("Please attach a file or write a response.");
            setLoading(false);
            return;
        }

        try {
            await api.post(
                `course/assignments/${assignment.id}/submit/`,
                formData,
            );

            setSubmitted(true);
            toast.success("Assignment submitted successfully!");
        } catch (err) {
            console.error("Assignment Submit Error:", err);
            const msg =
                err.response?.data?.error ||
                err.response?.data?.detail ||
                "Failed to submit assignment.";
            toast.error(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <h2>{content.title}</h2>
                <Badge>Total Marks: {assignment.total_marks}</Badge>
            </Header>

            <Section>
                <h3>Instructions</h3>
                <Description>{assignment.instructions}</Description>
                {assignment.attachment && (
                    <DownloadLink href={assignment.attachment} target="_blank">
                        📎 Download Resource Material
                    </DownloadLink>
                )}
            </Section>

            <Divider />

            <Section>
                <h3>Your Submission</h3>
                {submitted ? (
                    <SuccessBox>
                        ✅ Assignment Submitted. Waiting for grading.
                    </SuccessBox>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>
                                Text Submission / Link (Github, Drive)
                            </Label>
                            <TextArea
                                rows="3"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste your answer or link here..."
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Or Upload File</Label>
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </FormGroup>

                        <SubmitButton disabled={loading}>
                            {loading ? "Uploading..." : "Submit Assignment"}
                        </SubmitButton>
                    </form>
                )}
            </Section>
        </Container>
    );
};

export default AssignmentPlayer;

const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
`;
const Header = styled.div`
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const Badge = styled.span`
    background: #e0f2fe;
    color: #0369a1;
    padding: 5px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
`;
const Section = styled.div`
    margin-bottom: 30px;
`;
const Description = styled.p`
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
`;
const DownloadLink = styled.a`
    display: inline-block;
    margin-top: 10px;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`;
const Divider = styled.hr`
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 30px 0;
`;
const FormGroup = styled.div`
    margin-bottom: 20px;
`;
const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #475569;
`;
const TextArea = styled.textarea`
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-family: inherit;
`;
const Input = styled.input`
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    width: 100%;
`;
const SubmitButton = styled.button`
    background: #0f172a;
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
const SuccessBox = styled.div`
    background: #dcfce7;
    color: #166534;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
`;
