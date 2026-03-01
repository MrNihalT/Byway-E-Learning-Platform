import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../../../api";
import { toast } from "react-toastify";

// 1. Accept 'onQuizPassed' prop here
const QuizPlayer = ({ content, onQuizPassed }) => {
    const quiz = content.quiz_details;

    const [userAnswers, setUserAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer;
        if (showRetryModal && countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        } else if (showRetryModal && countdown === 0) {
            handleRetryReset();
        }
        return () => clearInterval(timer);
    }, [showRetryModal, countdown]);

    const handleSelect = (qId, aId) => {
        setUserAnswers({ ...userAnswers, [qId]: aId });
    };

    const handleRetryReset = () => {
        setShowRetryModal(false);
        setResult(null);
        setUserAnswers({});
        setCountdown(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submitQuiz = async () => {
        setLoading(true);
        try {
            const res = await api.post(`course/quizzes/${quiz.id}/submit/`, {
                answers: userAnswers,
            });

            const data = res.data;
            setResult(data);

            if (!data.passed) {
                setShowRetryModal(true);
                setCountdown(5);
            } else {
                if (onQuizPassed) {
                    onQuizPassed();
                }
            }
        } catch (err) {
            console.error("Quiz Submission Error:", err);
            const errMsg =
                err.response?.data?.error || err.message || "Failed to submit";
            toast.error(`Error: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (result && result.passed) {
        return (
            <ResultBox passed={true}>
                <h2>🎉 Congratulations!</h2>
                <Score>{result.score.toFixed(0)}%</Score>
                <p>
                    You got {result.correct} out of {result.total} correct.
                </p>
                <SuccessMsg>This lesson is now marked as complete.</SuccessMsg>
            </ResultBox>
        );
    }

    if (showRetryModal) {
        return (
            <Container>
                <BlurOverlay />
                <Modal>
                    <Icon>❌</Icon>
                    <h2>Quiz Failed</h2>
                    <Score failed>{result?.score.toFixed(0)}%</Score>
                    <p>
                        You need <strong>75%</strong> to pass.
                    </p>
                    <Divider />
                    <TimerText>
                        Retrying in <span>{countdown}</span> seconds...
                    </TimerText>
                </Modal>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <h2>{content.title}</h2>
                <PassMarkBadge>Pass Mark: 75%</PassMarkBadge>
            </Header>

            {quiz.questions.map((q, index) => (
                <QuestionCard key={q.id}>
                    <h4>
                        {index + 1}. {q.text}
                    </h4>
                    {q.answers.map((ans) => (
                        <Option
                            key={ans.id}
                            onClick={() => handleSelect(q.id, ans.id)}
                            selected={userAnswers[q.id] === ans.id}
                        >
                            <div className="circle"></div>
                            {ans.text}
                        </Option>
                    ))}
                </QuestionCard>
            ))}

            <SubmitButton onClick={submitQuiz} disabled={loading}>
                {loading ? "Submitting..." : "Submit Quiz"}
            </SubmitButton>
        </Container>
    );
};

export default QuizPlayer;

const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    min-height: 400px;
`;
const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }
`;
const PassMarkBadge = styled.span`
    background: #f1f5f9;
    color: #64748b;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
`;
const QuestionCard = styled.div`
    background: #fff;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #1e293b;
    }
`;
const Option = styled.div`
    padding: 12px;
    border: 2px solid ${(p) => (p.selected ? "#2563eb" : "#f1f5f9")};
    background-color: ${(p) => (p.selected ? "#eff6ff" : "white")};
    margin: 8px 0;
    cursor: pointer;
    display: flex;
    gap: 12px;
    align-items: center;
    border-radius: 6px;
    transition: all 0.2s;
    &:hover {
        border-color: #2563eb;
        background-color: #f8fafc;
    }
    .circle {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid ${(p) => (p.selected ? "#2563eb" : "#cbd5e1")};
        background: ${(p) => (p.selected ? "#2563eb" : "transparent")};
        flex-shrink: 0;
    }
`;
const SubmitButton = styled.button`
    background: #0f172a;
    color: white;
    padding: 14px 28px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    &:hover {
        background: #334155;
    }
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
const ResultBox = styled.div`
    text-align: center;
    padding: 60px 20px;
    background: #dcfce7;
    color: #166534;
    border-radius: 12px;
    margin: 20px;
    border: 1px solid #bbf7d0;
    h2 {
        margin: 0 0 10px 0;
        font-size: 2rem;
    }
`;
const Score = styled.div`
    font-size: 3.5rem;
    font-weight: 800;
    margin: 15px 0;
    color: ${(p) => (p.failed ? "#dc2626" : "#15803d")};
`;
const SuccessMsg = styled.p`
    font-weight: 600;
    background: rgba(255, 255, 255, 0.5);
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
    margin-top: 15px;
`;
const BlurOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
    z-index: 10;
    border-radius: 8px;
`;
const Modal = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 40px;
    width: 320px;
    border-radius: 16px;
    text-align: center;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e2e8f0;
    z-index: 20;
    h2 {
        margin: 10px 0;
        color: #1e293b;
    }
`;
const Icon = styled.div`
    font-size: 40px;
    margin-bottom: 10px;
`;
const Divider = styled.hr`
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 20px 0;
`;
const TimerText = styled.p`
    font-size: 1.1rem;
    color: #334155;
    span {
        font-weight: bold;
        color: #2563eb;
        font-size: 1.3rem;
    }
`;
