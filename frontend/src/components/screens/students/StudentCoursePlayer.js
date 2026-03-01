import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import { toast } from "react-toastify";

import QuizPlayer from "./QuizPlayer";
import AssignmentPlayer from "./AssignmentPlayer";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Icons
import playIcon from "../../assets/icons/play.svg";
import checkIcon from "../../assets/icons/checkmark.svg";
import lockIcon from "../../assets/icons/lock.svg";
import downloadIcon from "../../assets/icons/download.svg";

export default function StudentCoursePlayer() {
    const { courseId } = useParams();
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const [course, setCourse] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState(new Set());
    const videoRef = useRef(null);

    const getFileUrl = (filePath) => {
        if (!filePath) return "";
        if (filePath.startsWith("http")) return filePath;
        return `http://127.0.0.1:8000${filePath}`;
    };
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return "";
        try {
            let videoId = "";
            if (url.includes("youtu.be")) {
                videoId = url.split("/").pop().split("?")[0];
            } else if (url.includes("v=")) {
                videoId = url.split("v=")[1].split("&")[0];
            } else if (url.includes("/embed/")) {
                return url;
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (!userData) return navigate("/login");
        api.get(`course/courses/${courseId}/`)
            .then((res) => {
                setCourse(res.data);
                const completed = new Set();
                const initialExpanded = new Set();
                let nextLectureToWatch = null;
                let targetLecture = null;

                const queryParams = new URLSearchParams(location.search);
                const contentIdFromUrl = queryParams.get("content");

                if (res.data.sections) {
                    res.data.sections.forEach((section, index) => {
                        if (index === 0) initialExpanded.add(section.id);
                        if (section.contents) {
                            section.contents.forEach((lecture) => {
                                if (lecture.is_completed) {
                                    completed.add(lecture.id);
                                } else if (!nextLectureToWatch) {
                                    nextLectureToWatch = lecture;
                                    initialExpanded.add(section.id);
                                }

                                if (
                                    contentIdFromUrl &&
                                    lecture.id === parseInt(contentIdFromUrl)
                                ) {
                                    targetLecture = lecture;
                                    initialExpanded.add(section.id);
                                }
                            });
                        }
                    });
                }
                setCompletedLectures(completed);
                setExpandedSections(initialExpanded);

                if (targetLecture) {
                    setActiveLecture(targetLecture);
                } else if (!activeLecture) {
                    if (nextLectureToWatch)
                        setActiveLecture(nextLectureToWatch);
                    else if (
                        res.data.sections.length > 0 &&
                        res.data.sections[0].contents.length > 0
                    ) {
                        setActiveLecture(res.data.sections[0].contents[0]);
                    }
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, [courseId, userData, navigate, location.search, activeLecture]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.load();
    }, [activeLecture]);

    const handleMarkComplete = async () => {
        if (!activeLecture) return;
        try {
            await api.post(`course/lectures/${activeLecture.id}/complete/`);
            setCompletedLectures((prev) => new Set(prev).add(activeLecture.id));
        } catch (err) {
            console.error("Error updating progress", err);
        }
    };

    const handleNextLesson = () => {
        if (!course || !activeLecture) return;
        const isCurrentCompleted = completedLectures.has(activeLecture.id);
        const isBypass =
            userData.role === "instructor" || userData.is_superuser;

        if (!isCurrentCompleted && !isBypass) {
            toast.error("Please complete the current lesson first.");
            return;
        }

        let foundCurrent = false;
        for (const section of course.sections) {
            for (const lecture of section.contents) {
                if (foundCurrent) {
                    setActiveLecture(lecture);
                    if (!expandedSections.has(section.id))
                        setExpandedSections((prev) =>
                            new Set(prev).add(section.id),
                        );
                    return;
                }
                if (lecture.id === activeLecture.id) foundCurrent = true;
            }
        }
        toast.info("You have reached the end of the course!");
    };

    const toggleSection = (sectionId) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) newExpanded.delete(sectionId);
        else newExpanded.add(sectionId);
        setExpandedSections(newExpanded);
    };

    const handleDownloadCertificate = async () => {
        try {
            const response = await api.get(
                `course/courses/${courseId}/certificate/`,
                {
                    responseType: "blob",
                },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Certificate_${course.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success(
                "Certificate Downloaded! It has also been saved to your profile.",
            );
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                toast.error("Error: " + err.response.data.error);
            } else {
                toast.error("Download failed.");
            }
        }
    };

    if (isLoading) return <LoadingScreen>Loading Class...</LoadingScreen>;
    if (!course) return <LoadingScreen>Course not found</LoadingScreen>;

    const videoFileUrl = activeLecture
        ? getFileUrl(activeLecture.video_file)
        : "";
    const pdfFileUrl = activeLecture ? getFileUrl(activeLecture.pdf_file) : "";
    const isCompleted =
        activeLecture && completedLectures.has(activeLecture.id);
    let isNextLectureLocked = false;
    const isBypassUser =
        userData && (userData.role === "instructor" || userData.is_superuser);

    const totalLectures = course.sections.reduce(
        (acc, sec) => acc + sec.contents.length,
        0,
    );
    const progressPercentage =
        totalLectures === 0
            ? 0
            : Math.round((completedLectures.size / totalLectures) * 100);

    return (
        <PageContainer>
            <TopBar>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <BackButton onClick={() => navigate("/my-learning")}>
                        ← Dashboard
                    </BackButton>
                    <CourseHeader>{course.title}</CourseHeader>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <ProgressIndicator>
                        {completedLectures.size} / {totalLectures} Completed
                    </ProgressIndicator>
                    <SidebarToggle
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                    </SidebarToggle>
                </div>
            </TopBar>

            <MainContent>
                <PlayerStage>
                    <VideoContainer>
                        {activeLecture ? (
                            <div
                                className="player-wrapper"
                                key={activeLecture.id}
                            >
                                {activeLecture.content_type === "quiz" ? (
                                    <ScrollableContent>
                                        <QuizPlayer
                                            content={activeLecture}
                                            onQuizPassed={() =>
                                                setCompletedLectures((prev) =>
                                                    new Set(prev).add(
                                                        activeLecture.id,
                                                    ),
                                                )
                                            }
                                        />
                                    </ScrollableContent>
                                ) : activeLecture.content_type ===
                                  "assignment" ? (
                                    <ScrollableContent>
                                        <AssignmentPlayer
                                            content={activeLecture}
                                        />
                                    </ScrollableContent>
                                ) : activeLecture.youtube_url ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={getYouTubeEmbedUrl(
                                            activeLecture.youtube_url,
                                        )}
                                        title={activeLecture.title}
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                ) : activeLecture.video_file ? (
                                    <ReactPlayer
                                        src={videoFileUrl}
                                        controls={true}
                                        width="100%"
                                        height="100%"
                                        playsinline={true}
                                        config={{
                                            file: {
                                                attributes: {
                                                    controlsList: "nodownload",
                                                    style: {
                                                        backgroundColor:
                                                            "black",
                                                        maxHeight: "70vh",
                                                        width: "100%",
                                                        height: "100%",
                                                    },
                                                },
                                            },
                                        }}
                                        onEnded={handleMarkComplete}
                                    />
                                ) : activeLecture.pdf_file ? (
                                    <PdfWrapper>
                                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                            <Viewer
                                                fileUrl={pdfFileUrl}
                                                plugins={[
                                                    defaultLayoutPluginInstance,
                                                ]}
                                            />
                                        </Worker>
                                    </PdfWrapper>
                                ) : (
                                    <Placeholder>
                                        No content available.
                                    </Placeholder>
                                )}
                            </div>
                        ) : (
                            <Placeholder>Select a lecture to start</Placeholder>
                        )}
                    </VideoContainer>

                    <ControlsBar>
                        <div style={{ display: "flex", gap: "15px" }}>
                            {isCompleted ? (
                                <CompletedButton disabled>
                                    ✓ Completed
                                </CompletedButton>
                            ) : activeLecture?.content_type === "quiz" ? (
                                <LockedButton disabled>
                                    Score 75%+ to Complete
                                </LockedButton>
                            ) : (
                                <MarkCompleteButton
                                    onClick={handleMarkComplete}
                                >
                                    Mark as Complete
                                </MarkCompleteButton>
                            )}
                        </div>

                        {progressPercentage === 100 ? (
                            <CertButton onClick={handleDownloadCertificate}>
                                🎓 Get Certificate
                            </CertButton>
                        ) : (
                            <NextButton onClick={handleNextLesson}>
                                Next Lesson →
                            </NextButton>
                        )}
                    </ControlsBar>

                    {activeLecture && (
                        <LectureInfo>
                            <LectureSubtitle>
                                {activeLecture.content_type === "lecture"
                                    ? "Lecture"
                                    : activeLecture.content_type}{" "}
                                {activeLecture.order}
                            </LectureSubtitle>
                            <LectureTitle>{activeLecture.title}</LectureTitle>
                            {activeLecture.pdf_file &&
                                activeLecture.content_type === "lecture" &&
                                !activeLecture.video_file && (
                                    <p style={{ marginTop: 10, color: "#666" }}>
                                        Reading material. Mark as complete when
                                        finished.
                                    </p>
                                )}
                        </LectureInfo>
                    )}
                </PlayerStage>

                <AnimatePresence>
                    {isSidebarOpen && (
                        <Sidebar
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 350, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                        >
                            <SidebarHeader>Course Content</SidebarHeader>
                            <ScrollableList>
                                {course.sections &&
                                    course.sections.map((section) => (
                                        <SectionBlock key={section.id}>
                                            <SectionHeader
                                                onClick={() =>
                                                    toggleSection(section.id)
                                                }
                                            >
                                                <SectionTitle>
                                                    {section.title}
                                                </SectionTitle>
                                                <Chevron
                                                    $isOpen={expandedSections.has(
                                                        section.id,
                                                    )}
                                                >
                                                    ▼
                                                </Chevron>
                                            </SectionHeader>
                                            <AnimatePresence>
                                                {expandedSections.has(
                                                    section.id,
                                                ) && (
                                                    <SectionContent
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: "auto",
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                    >
                                                        {section.contents &&
                                                            section.contents.map(
                                                                (lecture) => {
                                                                    const isDone =
                                                                        completedLectures.has(
                                                                            lecture.id,
                                                                        );
                                                                    const isActive =
                                                                        activeLecture?.id ===
                                                                        lecture.id;
                                                                    const isLocked =
                                                                        isNextLectureLocked &&
                                                                        !isBypassUser;
                                                                    if (!isDone)
                                                                        isNextLectureLocked = true;
                                                                    return (
                                                                        <LectureItem
                                                                            key={
                                                                                lecture.id
                                                                            }
                                                                            $isActive={
                                                                                isActive
                                                                            }
                                                                            $isLocked={
                                                                                isLocked
                                                                            }
                                                                            onClick={() => {
                                                                                if (
                                                                                    !isLocked
                                                                                )
                                                                                    setActiveLecture(
                                                                                        lecture,
                                                                                    );
                                                                            }}
                                                                        >
                                                                            <StatusIcon>
                                                                                {isDone ? (
                                                                                    <Icon
                                                                                        src={
                                                                                            checkIcon
                                                                                        }
                                                                                        style={{
                                                                                            filter: "invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)",
                                                                                        }}
                                                                                    />
                                                                                ) : isLocked ? (
                                                                                    <Icon
                                                                                        src={
                                                                                            lockIcon
                                                                                        }
                                                                                        size="12px"
                                                                                        style={{
                                                                                            opacity: 0.4,
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <Icon
                                                                                        src={
                                                                                            playIcon
                                                                                        }
                                                                                        size="12px"
                                                                                    />
                                                                                )}
                                                                            </StatusIcon>
                                                                            <ItemText
                                                                                $isActive={
                                                                                    isActive
                                                                                }
                                                                            >
                                                                                {
                                                                                    lecture.title
                                                                                }
                                                                            </ItemText>
                                                                        </LectureItem>
                                                                    );
                                                                },
                                                            )}
                                                    </SectionContent>
                                                )}
                                            </AnimatePresence>
                                        </SectionBlock>
                                    ))}
                            </ScrollableList>
                            <SidebarFooter>
                                <ProgressText>
                                    {progressPercentage}% Completed
                                </ProgressText>
                                <ProgressBarContainer>
                                    <ProgressBarFill
                                        width={`${progressPercentage}%`}
                                    />
                                </ProgressBarContainer>
                            </SidebarFooter>
                        </Sidebar>
                    )}
                </AnimatePresence>
            </MainContent>
        </PageContainer>
    );
}

const CertButton = styled.button`
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background-color: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
    }
`;

const PageContainer = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8fafc;
    color: #334155;
    font-family: "Inter", sans-serif;
    overflow: hidden;
`;
const TopBar = styled.div`
    height: 64px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    padding: 0 24px;
    justify-content: space-between;
    z-index: 10;
`;
const BackButton = styled.button`
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    &:hover {
        background: #f1f5f9;
        color: #0f172a;
    }
`;
const CourseHeader = styled.h2`
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
`;
const ProgressIndicator = styled.div`
    font-size: 0.85rem;
    color: #15803d;
    font-weight: 600;
    background: #dcfce7;
    padding: 6px 12px;
    border-radius: 20px;
`;
const SidebarToggle = styled.button`
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    &:hover {
        color: #0f172a;
    }
`;
const MainContent = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
`;
const PlayerStage = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #f1f5f9;
    overflow-y: auto;
`;
const VideoContainer = styled.div`
    width: 100%;
    flex-shrink: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 450px;
    .player-wrapper {
        width: 100%;
        height: 100%;
    }
`;
const ScrollableContent = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: white;
    padding: 20px;
`;
const ControlsBar = styled.div`
    background-color: #ffffff;
    padding: 15px 32px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const MarkCompleteButton = styled.button`
    background-color: #22c55e;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background-color: #16a34a;
    }
`;
const CompletedButton = styled.button`
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: default;
`;
const NextButton = styled.button`
    background-color: #fff;
    color: #334155;
    border: 1px solid #cbd5e1;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        background-color: #f8fafc;
        color: #0f172a;
    }
`;
const LectureInfo = styled.div`
    padding: 32px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    flex: 1;
`;
const LectureSubtitle = styled.span`
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
`;
const LectureTitle = styled.h1`
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
    color: #0f172a;
`;
const Sidebar = styled(motion.div)`
    width: 350px;
    background-color: #ffffff;
    border-left: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.03);
`;
const SidebarHeader = styled.div`
    padding: 20px 24px;
    font-weight: 700;
    font-size: 1rem;
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
    background: #f8fafc;
`;
const ScrollableList = styled.div`
    flex: 1;
    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }
`;
const SectionBlock = styled.div`
    border-bottom: 1px solid #e2e8f0;
`;
const SectionHeader = styled.div`
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    background: #ffffff;
    border-bottom: 1px solid #f1f5f9;
    &:hover {
        background: #f8fafc;
    }
`;
const SectionTitle = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
`;
const Chevron = styled.span`
    font-size: 0.75rem;
    color: #94a3b8;
    transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0)")};
    transition: transform 0.2s;
`;
const SectionContent = styled(motion.div)`
    overflow: hidden;
    background: #f8fafc;
`;
const LectureItem = styled.div`
    padding: 12px 20px 12px 30px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: ${(props) => (props.$isLocked ? "not-allowed" : "pointer")};
    background-color: ${(props) => (props.$isActive ? "#eff6ff" : "#ffffff")};
    border-left: 4px solid
        ${(props) => (props.$isActive ? "#2563eb" : "transparent")};
    transition: background 0.2s;
    opacity: ${(props) => (props.$isLocked ? 0.5 : 1)};
    &:hover {
        background-color: ${(props) =>
            props.$isLocked
                ? "#ffffff"
                : props.$isActive
                  ? "#eff6ff"
                  : "#f8fafc"};
    }
`;
const StatusIcon = styled.div`
    width: 16px;
    display: flex;
    justify-content: center;
`;
const Icon = styled.img`
    width: ${(props) => props.size || "16px"};
    height: ${(props) => props.size || "16px"};
    opacity: 0.8;
`;
const ItemText = styled.span`
    font-size: 0.85rem;
    color: ${(props) => (props.$isActive ? "#1e40af" : "#475569")};
    font-weight: ${(props) => (props.$isActive ? "600" : "400")};
    flex: 1;
`;
const Placeholder = styled.div`
    color: #94a3b8;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #e2e8f0;
`;
const SidebarFooter = styled.div`
    padding: 20px;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
`;
const ProgressBarContainer = styled.div`
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
`;
const ProgressBarFill = styled.div`
    height: 100%;
    background: #22c55e;
    width: ${(props) => props.width};
    transition: width 0.3s;
`;
const ProgressText = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
    text-align: right;
    margin-bottom: 8px;
`;
const LoadingScreen = styled.div`
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    color: #334155;
    font-size: 1.2rem;
`;
const PdfWrapper = styled.div`
    height: 100%;
    width: 100%;
    overflow: auto;
    background-color: #e5e7eb;
`;
const LockedButton = styled.button`
    background-color: #f1f5f9;
    color: #64748b;
    border: 1px solid #cbd5e1;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: not-allowed;
`;
