import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function StudentAssignments() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        api.get("course/student/assignments/")
            .then((res) => {
                setAssignments(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [userData, navigate]);

    if (loading)
        return (
            <>
                <Header />
                <Container>Loading...</Container>
            </>
        );

    return (
        <>
            <Header />
            <Container>
                <Title>My Assignments</Title>

                {assignments.length === 0 ? (
                    <EmptyState>
                        <p>You haven't submitted any assignments yet.</p>
                        <LinkButton to="/my-learning">Go to Courses</LinkButton>
                    </EmptyState>
                ) : (
                    <Grid>
                        {assignments.map((item) => (
                            <Card key={item.id} $status={item.status}>
                                <CardHeader>
                                    <div>
                                        <CourseName>
                                            {item.course_title}
                                        </CourseName>
                                        <TaskName>
                                            {item.assignment_title}
                                        </TaskName>
                                    </div>
                                    <StatusBadge $status={item.status}>
                                        {item.status === "graded"
                                            ? "Graded"
                                            : "Pending Review"}
                                    </StatusBadge>
                                </CardHeader>

                                <Divider />

                                <SubmissionInfo>
                                    <Label>Your Submission:</Label>
                                    {item.submitted_text && (
                                        <TextPreview>
                                            "{item.submitted_text}"
                                        </TextPreview>
                                    )}
                                    {item.submitted_file && (
                                        <FileLink
                                            href={`http://127.0.0.1:8000${item.submitted_file}`}
                                            target="_blank"
                                        >
                                            View Attached File
                                        </FileLink>
                                    )}
                                    <DateText>
                                        Submitted on:{" "}
                                        {new Date(
                                            item.submitted_at
                                        ).toLocaleDateString()}
                                    </DateText>
                                </SubmissionInfo>

                                {/* --- INSTRUCTOR FEEDBACK SECTION --- */}
                                {item.status === "graded" ? (
                                    <FeedbackSection>
                                        <ScoreBox>
                                            <span>Score:</span>
                                            <Score>
                                                {item.marks_obtained} /{" "}
                                                {item.total_marks}
                                            </Score>
                                        </ScoreBox>
                                        <FeedbackBox>
                                            <Label>Instructor Feedback:</Label>
                                            <p>
                                                {item.feedback ||
                                                    "No written feedback provided."}
                                            </p>
                                        </FeedbackBox>
                                    </FeedbackSection>
                                ) : (
                                    <PendingBox>
                                        The instructor hasn't graded this yet.
                                        Check back later.
                                    </PendingBox>
                                )}
                            </Card>
                        ))}
                    </Grid>
                )}
            </Container>
            <Footer />
        </>
    );
}

// --- Styled Components ---
const Container = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 70vh;
`;
const Title = styled.h1`
    margin-bottom: 30px;
    color: #333;
    text-align: center;
`;
const EmptyState = styled.div`
    text-align: center;
    padding: 50px;
    background: #f9f9f9;
    border-radius: 8px;
    font-size: 1.1rem;
    color: #666;
`;
const LinkButton = styled(Link)`
    display: inline-block;
    margin-top: 15px;
    background: #3b82f6;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
`;
const Grid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Card = styled.div`
    background: white;
    border: 1px solid
        ${(props) => (props.$status === "graded" ? "#22c55e" : "#e0e0e0")};
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;
const CourseName = styled.div`
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
`;
const TaskName = styled.h3`
    font-size: 1.2rem;
    color: #0f172a;
    margin: 5px 0 0 0;
`;

const StatusBadge = styled.span`
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    background: ${(props) =>
        props.$status === "graded" ? "#dcfce7" : "#fff7ed"};
    color: ${(props) => (props.$status === "graded" ? "#166534" : "#c2410c")};
`;

const Divider = styled.hr`
    border: 0;
    border-top: 1px solid #eee;
    margin: 15px 0;
`;

const SubmissionInfo = styled.div`
    margin-bottom: 15px;
`;
const Label = styled.h5`
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    color: #555;
`;
const TextPreview = styled.p`
    font-style: italic;
    color: #666;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 5px;
`;
const FileLink = styled.a`
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`;
const DateText = styled.div`
    font-size: 0.8rem;
    color: #999;
    margin-top: 8px;
`;

const FeedbackSection = styled.div`
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ScoreBox = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;
const Score = styled.span`
    font-size: 1.2rem;
    font-weight: 700;
    color: #15803d;
`;

const FeedbackBox = styled.div`
    p {
        margin: 0;
        color: #333;
    }
`;

const PendingBox = styled.div`
    background: #fff7ed;
    color: #9a3412;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
`;
