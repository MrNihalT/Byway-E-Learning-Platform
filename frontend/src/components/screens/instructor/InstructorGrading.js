import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function InstructorGrading() {
    const { userData } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);

    // Inputs for grading
    const [marksInput, setMarksInput] = useState({});
    const [feedbackInput, setFeedbackInput] = useState({});

    useEffect(() => {
        fetchPendingWork();
    }, []);

    const fetchPendingWork = async () => {
        try {
            const res = await api.get("course/instructor/pending-work/");
            setAssignments(res.data.pending_assignments || []);
        } catch (err) {
            console.error("Failed to load work", err);
        } finally {
            setLoading(false);
        }
    };
    console.log(assignments);

    const handleGradeAssignment = async (submissionId) => {
        const marks = marksInput[submissionId];
        const feedback = feedbackInput[submissionId] || "";

        if (!marks) return toast.error("Please enter marks");
        if (
            marks >
            assignments.find((item) => item.id === submissionId).total_marks
        )
            return toast.error("Marks cannot be greater than total marks");

        try {
            await api.post(
                `course/instructor/assignment/grade/${submissionId}/`,
                { marks: marks, feedback: feedback },
            );

            setAssignments((prev) =>
                prev.filter((item) => item.id !== submissionId),
            );
            toast.success("Graded Successfully!");
        } catch (err) {
            toast.error("Error grading assignment");
        }
    };

    if (loading)
        return (
            <>
                <Header />
                <Container>
                    <LoadingMsg>Loading...</LoadingMsg>
                </Container>
                <ToastContainer position="top-right" autoClose={3000} />
            </>
        );

    return (
        <>
            <Header />
            <Container>
                <Title>Grading Dashboard</Title>

                <Section>
                    <SectionTitle>
                        Pending Assignments ({assignments.length})
                    </SectionTitle>

                    {assignments.length === 0 ? (
                        <EmptyState>
                            No pending assignments. All caught up!
                        </EmptyState>
                    ) : (
                        <List>
                            {assignments.map((item) => (
                                <Card key={item.id}>
                                    <Meta>
                                        <MetaItem>
                                            <strong>Student:</strong>{" "}
                                            {item.student_name}
                                        </MetaItem>
                                        <MetaItem>
                                            <strong>Course:</strong>{" "}
                                            {item.course_title}
                                        </MetaItem>
                                        <MetaItem>
                                            <strong>Date:</strong>{" "}
                                            {new Date(
                                                item.submitted_at,
                                            ).toLocaleDateString()}
                                        </MetaItem>
                                    </Meta>

                                    {/* --- PART 1: THE TASK (What you gave them) --- */}
                                    <TaskSection>
                                        <TaskLabel>
                                            Assignment Task:{" "}
                                            {item.assignment_title}
                                        </TaskLabel>
                                        <TaskInstructions>
                                            {item.instructions}
                                        </TaskInstructions>

                                        {item.instructor_file && (
                                            <ResourceLink
                                                href={`http://127.0.0.1:8000${item.instructor_file}`}
                                                target="_blank"
                                            >
                                                📄 View Reference Material
                                                (Given by You)
                                            </ResourceLink>
                                        )}
                                    </TaskSection>

                                    {/* --- PART 2: THE SUBMISSION (What they gave you) --- */}
                                    <SubmissionContent>
                                        <Label>Student's Work:</Label>

                                        {item.text_submission ? (
                                            <TextResponse>
                                                {item.text_submission}
                                            </TextResponse>
                                        ) : (
                                            <NoText>No text written.</NoText>
                                        )}

                                        {item.file_url && (
                                            <FileLink
                                                href={`http://127.0.0.1:8000${item.file_url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                📎 Download Student's File
                                            </FileLink>
                                        )}
                                    </SubmissionContent>

                                    {/* --- PART 3: GRADING FORM --- */}
                                    <GradingRow>
                                        <InputGroup style={{ flex: 1 }}>
                                            <InputLabel>
                                                Marks (Max: {item.total_marks})
                                            </InputLabel>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                max={item.total_marks}
                                                onChange={(e) =>
                                                    setMarksInput({
                                                        ...marksInput,
                                                        [item.id]:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </InputGroup>
                                        <InputGroup style={{ flex: 2 }}>
                                            <InputLabel>Feedback</InputLabel>
                                            <Input
                                                type="text"
                                                placeholder="Good job, but..."
                                                onChange={(e) =>
                                                    setFeedbackInput({
                                                        ...feedbackInput,
                                                        [item.id]:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </InputGroup>
                                        <SubmitGradeBtn
                                            onClick={() =>
                                                handleGradeAssignment(item.id)
                                            }
                                        >
                                            Submit Grade
                                        </SubmitGradeBtn>
                                    </GradingRow>
                                </Card>
                            ))}
                        </List>
                    )}
                </Section>
            </Container>
            <Footer />
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

// --- STYLES ---
const Container = styled.div`
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
    min-height: 60vh;
`;
const Title = styled.h1`
    text-align: center;
    color: #333;
    margin-bottom: 40px;
    font-size: 2rem;
`;
const LoadingMsg = styled.h2`
    text-align: center;
    color: #666;
    margin-top: 50px;
`;
const Section = styled.div`
    margin-bottom: 50px;
`;
const SectionTitle = styled.h3`
    border-bottom: 2px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 25px;
    color: #444;
    font-size: 1.4rem;
`;
const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    background: #f9f9f9;
    border-radius: 8px;
    color: #666;
`;
const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;

const Card = styled.div`
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
`;

const Meta = styled.div`
    display: flex;
    gap: 20px;
    background: #f1f5f9;
    padding: 15px 25px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.9rem;
`;
const MetaItem = styled.span`
    color: #475569;
    strong {
        color: #0f172a;
    }
`;

// Task Section (Gray)
const TaskSection = styled.div`
    padding: 20px 25px;
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
`;
const TaskLabel = styled.h4`
    margin: 0 0 8px 0;
    color: #334155;
    font-size: 1rem;
`;
const TaskInstructions = styled.p`
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
    white-space: pre-wrap;
`;
const ResourceLink = styled.a`
    display: inline-block;
    margin-top: 10px;
    font-size: 0.85rem;
    color: #0ea5e9;
    text-decoration: none;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`;

// Submission Section (White)
const SubmissionContent = styled.div`
    padding: 25px;
`;
const Label = styled.h5`
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;
const TextResponse = styled.div`
    background: #fff;
    padding: 15px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    color: #333;
    white-space: pre-wrap;
    font-size: 1rem;
    margin-bottom: 15px;
`;
const NoText = styled.p`
    color: #94a3b8;
    font-style: italic;
    margin-bottom: 15px;
`;
const FileLink = styled.a`
    display: inline-block;
    background-color: #eff6ff;
    color: #2563eb;
    padding: 10px 15px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    border: 1px solid #bfdbfe;
    &:hover {
        background-color: #dbeafe;
    }
`;

// Grading Section
const GradingRow = styled.div`
    display: flex;
    gap: 15px;
    align-items: flex-end;
    background: #fff;
    padding: 20px 25px;
    border-top: 1px solid #e2e8f0;
`;
const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;
const InputLabel = styled.label`
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
`;
const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.95rem;
    &:focus {
        outline: 2px solid #3b82f6;
        border-color: transparent;
    }
`;
const SubmitGradeBtn = styled.button`
    background-color: #0f172a;
    color: white;
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    height: 42px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background-color: #1e293b;
    }
`;
