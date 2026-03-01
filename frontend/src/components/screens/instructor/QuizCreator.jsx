import React, { useState, useEffect } from "react";
import styled from "styled-components";

const QuizCreator = ({ onDataChange }) => {
    // Initial State: 1 Question with 2 empty options
    const [questions, setQuestions] = useState([
        {
            text: "",
            answers: [
                { text: "", is_correct: false },
                { text: "", is_correct: false },
            ],
        },
    ]);

    // Helper to update local state AND parent state simultaneously
    const updateState = (newQuestions) => {
        setQuestions(newQuestions);
        onDataChange(newQuestions);
    };

    // --- Question Logic ---
    const addQuestion = () => {
        updateState([
            ...questions,
            {
                text: "",
                answers: [
                    { text: "", is_correct: false },
                    { text: "", is_correct: false },
                ],
            },
        ]);
    };

    const removeQuestion = (index) => {
        const updated = [...questions];
        updated.splice(index, 1);
        updateState(updated);
    };

    const updateQuestionText = (index, text) => {
        const updated = [...questions];
        updated[index].text = text;
        updateState(updated);
    };

    // --- Answer Logic ---
    const addAnswer = (qIndex) => {
        const updated = [...questions];
        updated[qIndex].answers.push({ text: "", is_correct: false });
        updateState(updated);
    };

    const removeAnswer = (qIndex, aIndex) => {
        const updated = [...questions];
        updated[qIndex].answers.splice(aIndex, 1);
        updateState(updated);
    };

    const updateAnswerText = (qIndex, aIndex, text) => {
        const updated = [...questions];
        updated[qIndex].answers[aIndex].text = text;
        updateState(updated);
    };

    // This sets the PREDEFINED correct answer
    const setCorrectAnswer = (qIndex, aIndex) => {
        const updated = [...questions];

        // 1. Loop through answers for this question and reset them
        updated[qIndex].answers = updated[qIndex].answers.map((ans, idx) => ({
            ...ans,
            is_correct: idx === aIndex, // Only true if index matches
        }));

        updateState(updated);
    };

    return (
        <Container>
            {questions.map((q, qIndex) => (
                <QuestionBlock key={qIndex}>
                    <HeaderRow>
                        <h4>Question {qIndex + 1}</h4>
                        {questions.length > 1 && (
                            <DeleteBtn
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                            >
                                Remove Question
                            </DeleteBtn>
                        )}
                    </HeaderRow>

                    <Input
                        placeholder="e.g. What is the capital of France?"
                        value={q.text}
                        onChange={(e) =>
                            updateQuestionText(qIndex, e.target.value)
                        }
                        autoFocus
                    />

                    <OptionsLabel>
                        Answers (Select the correct one):
                    </OptionsLabel>

                    <AnswerList>
                        {q.answers.map((ans, aIndex) => (
                            <AnswerRow key={aIndex} $isCorrect={ans.is_correct}>
                                <RadioWrapper>
                                    <RadioInput
                                        type="radio"
                                        name={`question_group_${qIndex}`} // Groups radios by question
                                        checked={ans.is_correct}
                                        onChange={() =>
                                            setCorrectAnswer(qIndex, aIndex)
                                        }
                                    />
                                </RadioWrapper>

                                <AnswerInput
                                    placeholder={`Option ${aIndex + 1}`}
                                    value={ans.text}
                                    onChange={(e) =>
                                        updateAnswerText(
                                            qIndex,
                                            aIndex,
                                            e.target.value
                                        )
                                    }
                                />

                                {q.answers.length > 2 && (
                                    <RemoveOptionBtn
                                        type="button"
                                        onClick={() =>
                                            removeAnswer(qIndex, aIndex)
                                        }
                                        title="Remove this option"
                                    >
                                        ✕
                                    </RemoveOptionBtn>
                                )}
                            </AnswerRow>
                        ))}
                    </AnswerList>

                    <AddOptionBtn
                        type="button"
                        onClick={() => addAnswer(qIndex)}
                    >
                        + Add Another Option
                    </AddOptionBtn>
                </QuestionBlock>
            ))}

            <MainAddBtn type="button" onClick={addQuestion}>
                + Add New Question
            </MainAddBtn>
        </Container>
    );
};

export default QuizCreator;

// --- STYLED COMPONENTS ---

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
`;

const QuestionBlock = styled.div`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 20px;
    border-radius: 8px;
`;

const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    h4 {
        margin: 0;
        color: #334155;
        font-weight: 600;
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 1rem;
    &:focus {
        outline: none;
        border-color: #3b82f6;
    }
`;

const OptionsLabel = styled.div`
    font-weight: 600;
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 10px;
`;

const AnswerList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const AnswerRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${(props) =>
        props.$isCorrect
            ? "#dcfce7"
            : "#ffffff"}; // Green background if correct
    padding: 8px;
    border: 1px solid ${(props) => (props.$isCorrect ? "#86efac" : "#e2e8f0")};
    border-radius: 6px;
    transition: background 0.2s;
`;

const RadioWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
`;

// --- FIX FOR VISIBILITY ---
const RadioInput = styled.input`
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #22c55e; /* Forces green color */
    opacity: 1; /* Ensures visibility */
    appearance: auto; /* Ensures browser default styling applies */
`;

const AnswerInput = styled.input`
    flex: 1;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.9rem;
    background: transparent;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        background: white;
    }
`;

const RemoveOptionBtn = styled.button`
    background: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-weight: bold;
    padding: 5px 10px;
    font-size: 1.1rem;
    &:hover {
        color: #b91c1c;
        background-color: #fee2e2;
        border-radius: 4px;
    }
`;

const AddOptionBtn = styled.button`
    background: white;
    color: #3b82f6;
    border: 1px dashed #3b82f6;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-top: 15px;
    width: 100%;
    &:hover {
        background: #eff6ff;
    }
`;

const DeleteBtn = styled.button`
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    text-decoration: underline;
    &:hover {
        color: #b91c1c;
    }
`;

const MainAddBtn = styled.button`
    background: #0f172a;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        background: #1e293b;
    }
`;
