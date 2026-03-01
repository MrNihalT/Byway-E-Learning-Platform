import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import { toast } from "react-toastify";

// Assets
import starIcon from "../../assets/icons/star.svg";
import starEmptyIcon from "../../assets/icons/white star.svg";

export default function ReviewForm({ courseId, onReviewAdded }) {
    const { userData } = useContext(UserContext);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (userData && courseId) {
            api.get(`course/courses/${courseId}/reviews/`)
                .then((res) => {
                    const myReview = res.data.find(
                        (r) => r.student.username === userData.username,
                    );
                    if (myReview) {
                        setRating(myReview.rating);
                        setComment(myReview.comment);
                        setIsEditing(true);
                    }
                })
                .catch((err) => console.error("Error fetching reviews:", err));
        }
    }, [userData, courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData) {
            setError("Please log in to write a review.");
            return;
        }
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setMessage("");

        try {
            const url = `course/courses/reviews/create/${courseId}/`;

            if (isEditing) {
                await api.put(url, { rating, comment });
                setMessage("Review updated successfully!");
                toast.success("Review updated!");
            } else {
                await api.post(url, { rating, comment });
                setMessage("Review submitted successfully!");
                toast.success("Review submitted!");
                setIsEditing(true);
            }

            if (onReviewAdded) {
                onReviewAdded();
            }
        } catch (err) {
            console.error("Review Error:", err);
            const errorMsg =
                err.response?.data?.error || "Failed to submit review.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <FormHeader>
                <HeaderTitle>
                    {isEditing ? "Update Your Review" : "Share Your Experience"}
                </HeaderTitle>
                <HeaderSubtitle>
                    Your feedback helps us improve and guides other students.
                </HeaderSubtitle>
            </FormHeader>

            <AnimatePresence mode="wait">
                {error && (
                    <StatusMessage
                        key="error"
                        type="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <i className="fa-solid fa-circle-exclamation" /> {error}
                    </StatusMessage>
                )}
                {message && (
                    <StatusMessage
                        key="success"
                        type="success"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <i className="fa-solid fa-circle-check" /> {message}
                    </StatusMessage>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
                <Label>Rating</Label>
                <StarContainer>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarWrapper
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <StarIcon
                                src={
                                    (hoverRating || rating) >= star
                                        ? starIcon
                                        : starEmptyIcon
                                }
                                active={(hoverRating || rating) >= star}
                                alt={`${star} Star`}
                            />
                        </StarWrapper>
                    ))}
                    <RatingValue rating={rating}>
                        {rating > 0 ? `${rating}.0` : "—"}
                    </RatingValue>
                </StarContainer>

                <Label htmlFor="comment">Your Review</Label>
                <TextAreaWrapper
                    animate={{ borderColor: comment ? "#3b82f6" : "#e2e8f0" }}
                >
                    <TextArea
                        id="comment"
                        placeholder="What did you think of the course content, instructor, and overall value?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows="4"
                    />
                </TextAreaWrapper>

                <SubmitButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSubmitting ? (
                        <>
                            <Spinner /> Submitting...
                        </>
                    ) : (
                        <>{isEditing ? "Update Review" : "Publish Review"}</>
                    )}
                </SubmitButton>
            </form>
        </FormCard>
    );
}

// --- Premium Styled Components ---

const FormCard = styled(motion.div)`
    background: #ffffff;
    padding: 32px;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    margin: 40px 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    max-width: 100%;
`;

const FormHeader = styled.div`
    margin-bottom: 30px;
`;

const HeaderTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
`;

const HeaderSubtitle = styled.p`
    font-size: 0.95rem;
    color: #64748b;
`;

const Label = styled.label`
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 12px;
`;

const StarContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
`;

const StarWrapper = styled(motion.div)`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StarIcon = styled.img`
    width: 32px;
    height: 32px;
    transition: filter 0.2s;
    filter: ${(props) =>
        props.active ? "none" : "grayscale(100%) opacity(0.3)"};
`;

const RatingValue = styled.span`
    margin-left: 10px;
    font-size: 1.2rem;
    font-weight: 800;
    color: ${(props) => (props.rating > 0 ? "#3b82f6" : "#cbd5e1")};
    font-variant-numeric: tabular-nums;
`;

const TextAreaWrapper = styled(motion.div)`
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 24px;
    transition: box-shadow 0.2s;

    &:focus-within {
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    color: #1e293b;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;

    &:focus {
        outline: none;
    }

    &::placeholder {
        color: #94a3b8;
    }
`;

const SubmitButton = styled(motion.button)`
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);

    &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const StatusMessage = styled(motion.div)`
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 24px;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;

    ${(props) =>
        props.type === "error"
            ? `
        background: #fff1f2;
        color: #e11d48;
        border: 1px solid #fecdd3;
    `
            : `
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #dcfce7;
    `}
`;

const Spinner = styled.div`
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;
