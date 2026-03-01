import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { UserContext } from "../../includes/UserProvider";
import { toast } from "react-toastify";

// Icons
import starIcon from "../../assets/icons/star.svg";

const StatusBadge = styled.span`
    font-size: 0.75rem;
    color: #9a3412;
    background: #fff7ed;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
    border: 1px solid #ffedd5;
`;

export default function InstructorCourses() {
    const { instructorId } = useParams();
    const { userData } = useContext(UserContext);
    const [courses, setCourses] = useState([]);
    const [instructor, setInstructor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Local state for instant UI updates
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);

    // 2. Initialize Hook
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`course/courses/instructor/${instructorId}/`)
            .then((res) => {
                setCourses(res.data);

                if (res.data.length > 0) {
                    const instr = res.data[0].instructor;
                    setInstructor(instr);
                    setIsFollowing(instr.is_following);
                    setFollowerCount(instr.followers_count || 0);
                }
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching instructor courses:", err);
                setIsLoading(false);
            });
    }, [instructorId]);

    const handleFollowToggle = async () => {
        if (!userData) {
            toast.error("Please log in to follow instructors.");
            return;
        }

        const previousState = isFollowing;
        const previousCount = followerCount;

        setIsFollowing(!isFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));

        try {
            const res = await api.post(
                `auth/instructor/follow/${instructorId}/`,
            );
            setIsFollowing(res.data.is_following);
            setFollowerCount(res.data.new_follower_count);
        } catch (err) {
            setIsFollowing(previousState);
            setFollowerCount(previousCount);
            toast.error("Something went wrong. Could not follow.");
        }
    };

    // 3. New Message Handler
    const handleMessage = async () => {
        if (!userData) {
            toast.error("Please log in to message the instructor.");
            return;
        }
        try {
            // Call the API endpoint we created in the Chat App step
            await api.post("chat/start/", { user_id: instructor.id });
            // Redirect to the chat page
            navigate("/chat");
        } catch (err) {
            console.error(err);
            toast.error("Could not initiate chat.");
        }
    };

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                    {isLoading ? (
                        <LoadingText>
                            Loading Instructor Portfolio...
                        </LoadingText>
                    ) : (
                        <>
                            {instructor ? (
                                <InstructorHeader>
                                    <ProfileImage
                                        src={instructor.profile_picture}
                                        alt={instructor.username}
                                    />
                                    <InstructorInfo>
                                        <TopRow>
                                            <Name>
                                                {instructor.first_name}{" "}
                                                {instructor.last_name}
                                            </Name>

                                            {/* Button Group */}
                                            {userData?.id !== instructor.id && (
                                                <ButtonGroup>
                                                    <FollowButton
                                                        $isFollowing={
                                                            isFollowing
                                                        }
                                                        onClick={
                                                            handleFollowToggle
                                                        }
                                                    >
                                                        {isFollowing
                                                            ? "Unfollow"
                                                            : "Follow"}
                                                    </FollowButton>

                                                    {/* 4. New Message Button */}
                                                    <MessageButton
                                                        onClick={handleMessage}
                                                    >
                                                        Message
                                                    </MessageButton>
                                                </ButtonGroup>
                                            )}
                                        </TopRow>
                                        <Username>
                                            @{instructor.username}
                                        </Username>
                                        <Role>
                                            {instructor.qualification ||
                                                "Instructor"}
                                        </Role>
                                        <Bio>{instructor.about_me}</Bio>
                                        <Stats>
                                            <StatItem>
                                                <strong>
                                                    {courses.length}
                                                </strong>{" "}
                                                Courses
                                            </StatItem>
                                            <StatItem>
                                                <strong>
                                                    {instructor.total_customers ||
                                                        0}
                                                </strong>{" "}
                                                Students
                                            </StatItem>
                                            <StatItem>
                                                <strong>{followerCount}</strong>{" "}
                                                Followers
                                            </StatItem>
                                            <StatItem>
                                                <img
                                                    src={starIcon}
                                                    alt="star"
                                                    width="14px"
                                                />
                                                <strong>
                                                    {instructor.total_rating ||
                                                        "0.0"}
                                                </strong>{" "}
                                                Rating
                                            </StatItem>
                                        </Stats>
                                    </InstructorInfo>
                                </InstructorHeader>
                            ) : (
                                <NoDataHeader>
                                    <Name>Instructor Portfolio</Name>
                                    <p>
                                        This instructor has no public courses
                                        yet.
                                    </p>
                                </NoDataHeader>
                            )}

                            <Divider />

                            <SectionTitle>
                                Courses by{" "}
                                {instructor?.username || "Instructor"}
                            </SectionTitle>

                            {courses.length > 0 ? (
                                <CourseGrid>
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            to={`/course/${course.id}`}
                                        >
                                            <CourseImgContainer>
                                                <CourseImg
                                                    src={course.course_image}
                                                    alt={course.title}
                                                />
                                            </CourseImgContainer>
                                            <CourseContent>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "flex-start",
                                                    }}
                                                >
                                                    <CourseTitle>
                                                        {course.title}
                                                    </CourseTitle>
                                                    {course.is_draft && (
                                                        <StatusBadge>
                                                            Draft
                                                        </StatusBadge>
                                                    )}
                                                </div>
                                                <CategoryTag>
                                                    {course.category?.name}
                                                </CategoryTag>
                                                <PriceRow>
                                                    <CurrentPrice>
                                                        ${course.price}
                                                    </CurrentPrice>
                                                    {course.offer_percentage >
                                                        0 && (
                                                        <OfferBadge>
                                                            {
                                                                course.offer_percentage
                                                            }
                                                            % Off
                                                        </OfferBadge>
                                                    )}
                                                </PriceRow>
                                            </CourseContent>
                                        </CourseCard>
                                    ))}
                                </CourseGrid>
                            ) : (
                                <EmptyState>No courses found.</EmptyState>
                            )}
                        </>
                    )}
                </Wrapper>
            </PageContainer>
            <Footer />
        </>
    );
}

// --- Styled Components ---

const PageContainer = styled.div`
    background-color: #f8fafc;
    min-height: 80vh;
    padding: 50px 0;
`;
const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;
const LoadingText = styled.div`
    text-align: center;
    font-size: 1.5rem;
    color: #64748b;
    margin-top: 50px;
`;

const InstructorHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 40px;
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }
`;
const ProfileImage = styled.img`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #e2e8f0;
`;
const InstructorInfo = styled.div`
    flex: 1;
    width: 100%;
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between; /* Changed to push name and buttons apart */
    gap: 20px;
    @media (max-width: 768px) {
        justify-content: center;
        flex-direction: column;
        gap: 10px;
    }
`;

// New Container for Buttons
const ButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const FollowButton = styled.button`
    padding: 8px 24px;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #3b82f6;
    transition: all 0.2s;
    background-color: ${(props) => (props.$isFollowing ? "white" : "#3b82f6")};
    color: ${(props) => (props.$isFollowing ? "#3b82f6" : "white")};

    &:hover {
        background-color: ${(props) =>
            props.$isFollowing ? "#f1f5f9" : "#2563eb"};
    }
`;

// 5. New Style for Message Button
const MessageButton = styled.button`
    padding: 8px 24px;
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    background-color: white;
    color: #0f172a;
    transition: all 0.2s;

    &:hover {
        background-color: #f1f5f9;
        border-color: #94a3b8;
    }
`;

const Name = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
`;
const Username = styled.span`
    color: #64748b;
    font-size: 1rem;
`;
const Role = styled.p`
    font-weight: 600;
    color: #3b82f6;
    margin: 5px 0 15px 0;
`;
const Bio = styled.p`
    color: #334155;
    line-height: 1.6;
    max-width: 700px;
    margin-bottom: 20px;
    @media (max-width: 768px) {
        margin-left: auto;
        margin-right: auto;
    }
`;
const Stats = styled.div`
    display: flex;
    gap: 30px;
    @media (max-width: 768px) {
        justify-content: center;
    }
`;
const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: #475569;
    font-size: 0.95rem;
    strong {
        color: #0f172a;
        font-size: 1.1rem;
    }
`;
const NoDataHeader = styled.div`
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 16px;
    margin-bottom: 40px;
`;
const Divider = styled.hr`
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin-bottom: 40px;
`;
const SectionTitle = styled.h3`
    font-size: 1.5rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 25px;
`;
const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
`;
const CourseCard = styled(Link)`
    background: white;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    border: 1px solid #e2e8f0;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
`;
const CourseImgContainer = styled.div`
    height: 180px;
    overflow: hidden;
`;
const CourseImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;
const CourseContent = styled.div`
    padding: 20px;
`;
const CourseTitle = styled.h4`
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 10px 0;
    line-height: 1.4;
    color: #0f172a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;
const CategoryTag = styled.span`
    font-size: 0.85rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 4px;
`;
const PriceRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 15px;
`;
const CurrentPrice = styled.span`
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f172a;
`;
const OfferBadge = styled.span`
    font-size: 0.8rem;
    color: #16a34a;
    font-weight: 600;
    background: #dcfce7;
    padding: 2px 8px;
    border-radius: 4px;
`;

const EmptyState = styled.div`
    text-align: center;
    color: #94a3b8;
    font-size: 1.1rem;
    padding: 40px;
`;
