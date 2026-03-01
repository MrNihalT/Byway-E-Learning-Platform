import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { UserContext } from "../../includes/UserProvider";
import { toast } from "react-toastify";

export default function MyCertificates() {
    const { userData } = useContext(UserContext);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("course/student/certificates/")
            .then((res) => {
                setCertificates(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching certificates:", err);
                setLoading(false);
            });
    }, []);

    const handleDownload = async (courseId, courseTitle) => {
        try {
            const response = await api.get(
                `course/courses/${courseId}/certificate/`,
                {
                    responseType: "blob",
                },
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Certificate_${courseTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            toast.error("Download failed. Please try again.");
        }
    };

    if (!userData) return <p>Please log in.</p>;

    return (
        <>
            <Header />
            <Container>
                <Wrapper>
                    <Title>My Certificates</Title>

                    {loading ? (
                        <LoadingText>Loading your achievements...</LoadingText>
                    ) : certificates.length > 0 ? (
                        <Grid>
                            {certificates.map((cert) => (
                                <CertCard key={cert.id}>
                                    <CourseImageContainer
                                        to={`/course/${cert.course}`}
                                    >
                                        <CourseImg
                                            src={
                                                cert.course_image ||
                                                "https://via.placeholder.com/300x200"
                                            }
                                            alt={cert.course_title}
                                        />
                                        <Overlay>
                                            <span>View Course</span>
                                        </Overlay>
                                    </CourseImageContainer>

                                    <Content>
                                        <IssueDate>
                                            Issued:{" "}
                                            {new Date(
                                                cert.issue_date,
                                            ).toLocaleDateString()}
                                        </IssueDate>
                                        <CourseTitle>
                                            {cert.course_title}
                                        </CourseTitle>
                                        <Instructor>
                                            Instructor: {cert.instructor}
                                        </Instructor>
                                        <CertID>
                                            ID: {cert.certificate_id}
                                        </CertID>

                                        <DownloadButton
                                            onClick={() =>
                                                handleDownload(
                                                    cert.course,
                                                    cert.course_title,
                                                )
                                            }
                                        >
                                            <Icon
                                                src={
                                                    require("../../assets/icons/download.svg")
                                                        .default
                                                }
                                                alt=""
                                            />
                                            Download PDF
                                        </DownloadButton>
                                    </Content>
                                </CertCard>
                            ))}
                        </Grid>
                    ) : (
                        <EmptyState>
                            <h3>No Certificates Yet</h3>
                            <p>
                                Complete a course to earn your first
                                certificate!
                            </p>
                            <LinkButton to="/my-learning">
                                Go to My Learning
                            </LinkButton>
                        </EmptyState>
                    )}
                </Wrapper>
            </Container>
            <Footer />
        </>
    );
}

// --- Styled Components ---

const Container = styled.div`
    background-color: #f8fafc;
    min-height: 80vh;
    padding: 60px 0;
`;

const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #0f172a;
    margin-bottom: 40px;
    font-weight: 700;
`;

const LoadingText = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #64748b;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
`;

const CertCard = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    transition:
        transform 0.2s,
        box-shadow 0.2s;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
`;

const CourseImageContainer = styled(Link)`
    position: relative;
    display: block;
    height: 160px;
    overflow: hidden;

    &:hover div {
        opacity: 1;
    }
`;

const CourseImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const Overlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;

    span {
        color: white;
        background: rgba(0, 0, 0, 0.6);
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
    }
`;

const Content = styled.div`
    padding: 20px;
`;

const IssueDate = styled.p`
    font-size: 12px;
    color: #64748b;
    margin-bottom: 5px;
`;

const CourseTitle = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 5px;
    line-height: 1.4;
`;

const Instructor = styled.p`
    font-size: 14px;
    color: #334155;
    margin-bottom: 10px;
`;

const CertID = styled.p`
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 20px;
    font-family: monospace;
    background: #f1f5f9;
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
`;

const DownloadButton = styled.button`
    width: 100%;
    padding: 12px;
    background-color: #0f172a;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s;

    &:hover {
        background-color: #334155;
    }
`;

const Icon = styled.img`
    width: 16px;
    height: 16px;
    filter: invert(1); /* Makes black icons white */
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 0;
    h3 {
        font-size: 1.5rem;
        color: #0f172a;
        margin-bottom: 10px;
    }
    p {
        color: #64748b;
        margin-bottom: 20px;
    }
`;

const LinkButton = styled(Link)`
    background-color: #2563eb;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    &:hover {
        background-color: #1d4ed8;
    }
`;
