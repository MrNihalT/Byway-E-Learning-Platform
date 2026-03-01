import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../api";
import styled from "styled-components";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { toast } from "react-toastify";

import ReactPlayer from "react-player";

export default function LecturePage() {
    const { lectureId } = useParams();
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [lecture, setLecture] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        setError("");

        api.get(`course/lectures/${lectureId}/`)
            .then((response) => {
                setLecture(response.data);
                setIsCompleted(response.data.is_completed);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching lecture:", err);
                setError(
                    err.response?.data?.error || "Could not load this lecture.",
                );
                setIsLoading(false);
            });
    }, [lectureId, userData, navigate]);

    const handleMarkComplete = async () => {
        try {
            await api.post(`course/lectures/${lectureId}/complete/`);
            setIsCompleted(true);
        } catch (err) {
            console.error("Failed to mark as complete", err);
            toast.error(
                "An error occurred. You may not be enrolled in this course.",
            );
        }
    };

    const renderContent = () => {
        if (!lecture) return null;

        let contentUrl = null;
        if (lecture.youtube_url) {
            contentUrl = lecture.youtube_url;
        } else if (lecture.video_file) {
            contentUrl = lecture.video_file;
        }

        if (contentUrl) {
            return (
                <VideoWrapper>
                    <ReactPlayer
                        className="react-player"
                        src={contentUrl}
                        controls={true}
                        width="100%"
                        height="100%"
                        stopOnUnmount={true}
                    />
                </VideoWrapper>
            );
        }

        if (lecture.pdf_file) {
            return (
                <PdfWrapper>
                    <embed
                        src={lecture.pdf_file}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                    />
                    <p>
                        Your browser may not support embedding PDFs.
                        <a
                            href={lecture.pdf_file}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Download PDF
                        </a>
                    </p>
                </PdfWrapper>
            );
        }

        return <p>This lecture has no content yet.</p>;
    };

    return (
        <>
            <Header />
            <LectureContainer>
                {isLoading && (
                    <LoadingWrapper>Loading Lecture...</LoadingWrapper>
                )}
                {error && <LoadingWrapper>{error}</LoadingWrapper>}

                {lecture && (
                    <>
                        <LectureHeader>
                            <CourseLink to={`/course/${lecture.course_id}`}>
                                Back to Course
                            </CourseLink>
                            <LectureTitle>{lecture.title}</LectureTitle>
                            {isCompleted ? (
                                <CompleteMessage>Completed!</CompleteMessage>
                            ) : (
                                <CompleteButton onClick={handleMarkComplete}>
                                    Mark as Complete
                                </CompleteButton>
                            )}
                        </LectureHeader>

                        <ContentWrapper>{renderContent()}</ContentWrapper>
                    </>
                )}
            </LectureContainer>
            <Footer />
        </>
    );
}

const LectureContainer = styled.div`
    max-width: 1000px;
    margin: 30px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const LectureHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 15px;
    margin-bottom: 20px;
`;

const LectureTitle = styled.h2`
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    text-align: center;
`;

const CourseLink = styled(Link)`
    font-size: 0.9rem;
    color: #007bff;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

const CompleteButton = styled.button`
    padding: 8px 15px;
    font-size: 0.9rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    &:hover {
        background: #218838;
    }
`;

const CompleteMessage = styled.p`
    font-size: 0.9rem;
    font-weight: 600;
    color: #28a745;
    margin: 0;
`;

const ContentWrapper = styled.div`
    margin-top: 20px;
`;

const VideoWrapper = styled.div`
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    background: #000; /* Black background for player loading */
    border-radius: 8px; /* Rounded corners */

    .react-player {
        position: absolute;
        top: 0;
        left: 0;
    }
`;

const PdfWrapper = styled.div`
    width: 100%;
    height: 800px; /* Set a fixed height for the PDF embed */
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden; /* Hide scrollbars if embed works */

    embed {
        width: 100%;
        height: 100%;
    }

    p {
        padding: 10px;
        text-align: center;
    }
`;

const LoadingWrapper = styled.div`
    text-align: center;
    padding: 50px;
    font-size: 1.5rem;
`;
