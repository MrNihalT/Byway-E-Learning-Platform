import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../includes/UserProvider";

export default function AllCourseAdmin() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get("course/admin/all-courses/");
            const allCourses = response.data;
            setCourses(allCourses);

            // Calculate stats
            const published = allCourses.filter((c) => !c.is_draft).length;
            const drafts = allCourses.filter((c) => c.is_draft).length;
            setStats({
                total: allCourses.length,
                published,
                drafts,
            });
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData && !userData.is_superuser) {
            navigate("/");
            return;
        }
        fetchCourses();
    }, [userData, navigate]);

    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.instructor_name || course.instructor?.username || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    return (
        <PageContainer>
            <Header />
            <ContentWrapper>
                <div className="wrapper">
                    <HeaderSection>
                        <div>
                            <Title>Course Management</Title>
                            <Subtitle>
                                Monitor and manage all educational content on
                                the platform.
                            </Subtitle>
                        </div>
                        <SearchContainer>
                            <SearchInput
                                type="text"
                                placeholder="Search by title or instructor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </SearchContainer>
                    </HeaderSection>

                    <StatsGrid>
                        <StatCard bg="#eff6ff" border="#3b82f6">
                            <StatLabel color="#1e40af">Total Courses</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                        </StatCard>
                        <StatCard bg="#dcfce7" border="#22c55e">
                            <StatLabel color="#166534">Published</StatLabel>
                            <StatValue>{stats.published}</StatValue>
                        </StatCard>
                        <StatCard bg="#fff7ed" border="#f97316">
                            <StatLabel color="#9a3412">Drafts</StatLabel>
                            <StatValue>{stats.drafts}</StatValue>
                        </StatCard>
                    </StatsGrid>

                    {loading ? (
                        <LoadingState>
                            <Spinner />
                            <p>Loading course content...</p>
                        </LoadingState>
                    ) : filteredCourses.length === 0 ? (
                        <EmptyState>
                            <h3>No courses found</h3>
                            <p>
                                Try adjusting your search or check back later.
                            </p>
                        </EmptyState>
                    ) : (
                        <TableContainer>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Instructor</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map((course) => (
                                        <tr key={course.id}>
                                            <td>
                                                <CourseInfo>
                                                    <CourseThumbnail
                                                        src={
                                                            course.course_image ||
                                                            require("../../assets/icons/logo.svg")
                                                                .default
                                                        }
                                                        alt=""
                                                    />
                                                    <div>
                                                        <CourseTitle>
                                                            {course.title}
                                                        </CourseTitle>
                                                        <CourseId>
                                                            ID: #{course.id}
                                                        </CourseId>
                                                    </div>
                                                </CourseInfo>
                                            </td>
                                            <td>
                                                <InstructorName>
                                                    {course.instructor_name ||
                                                        course.instructor
                                                            ?.username ||
                                                        "N/A"}
                                                </InstructorName>
                                            </td>
                                            <td>
                                                <CategoryBadge>
                                                    {course.category_name ||
                                                        (typeof course.category ===
                                                        "object"
                                                            ? course.category
                                                                  ?.name
                                                            : course.category) ||
                                                        "General"}
                                                </CategoryBadge>
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    isDraft={course.is_draft}
                                                >
                                                    {course.is_draft
                                                        ? "Draft"
                                                        : "Published"}
                                                </StatusBadge>
                                            </td>
                                            <td>
                                                <Price>${course.price}</Price>
                                            </td>
                                            <td>
                                                <ActionGroup>
                                                    <ActionButton
                                                        as={Link}
                                                        to={`/course/${course.id}`}
                                                        className="view"
                                                    >
                                                        Preview
                                                    </ActionButton>
                                                    <ActionButton
                                                        as={Link}
                                                        to={`/instructor/edit-course/${course.id}`}
                                                        className="edit"
                                                    >
                                                        Edit
                                                    </ActionButton>
                                                </ActionGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            </ContentWrapper>
            <Footer />
        </PageContainer>
    );
}

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f1f5f9;
`;

const ContentWrapper = styled.div`
    flex: 1;
    padding: 50px 0;
`;

const HeaderSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
    gap: 20px;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const Title = styled.h1`
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: #64748b;
`;

const SearchContainer = styled.div`
    width: 100%;
    max-width: 400px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 12px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    font-size: 14px;
    transition: all 0.2s;
    outline: none;

    &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: ${(p) => p.bg};
    padding: 24px;
    border-radius: 16px;
    border: 1px solid ${(p) => p.border};
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StatLabel = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: ${(p) => p.color};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const StatValue = styled.span`
    font-size: 36px;
    font-weight: 800;
    color: #0f172a;
`;

const TableContainer = styled.div`
    background: white;
    border-radius: 20px;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid #e2e8f0;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    thead {
        background: #f8fafc;
        th {
            padding: 20px 24px;
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #f1f5f9;
        }
    }

    tbody {
        tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.2s;
            &:hover {
                background: #f8fafc;
            }
            &:last-child {
                border-bottom: none;
            }
        }
        td {
            padding: 20px 24px;
            font-size: 14px;
            color: #1e293b;
        }
    }
`;

const CourseInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const CourseThumbnail = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 8px;
    object-fit: cover;
    background: #f1f5f9;
`;

const CourseTitle = styled.div`
    font-weight: 700;
    color: #0f172a;
    font-size: 15px;
    margin-bottom: 4px;
`;

const CourseId = styled.div`
    font-size: 12px;
    color: #94a3b8;
    font-family: monospace;
`;

const InstructorName = styled.div`
    font-weight: 500;
    color: #334155;
`;

const CategoryBadge = styled.span`
    padding: 6px 12px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
`;

const StatusBadge = styled.span`
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    background: ${(p) => (p.isDraft ? "#fff7ed" : "#dcfce7")};
    color: ${(p) => (p.isDraft ? "#9a3412" : "#166534")};
`;

const Price = styled.div`
    font-weight: 800;
    color: #0f172a;
    font-size: 16px;
`;

const ActionGroup = styled.div`
    display: flex;
    gap: 10px;
`;

const ActionButton = styled.button`
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
    border: none;

    &.view {
        background: #0f172a;
        color: white;
        &:hover {
            background: #1e293b;
            transform: translateY(-1px);
        }
    }

    &.edit {
        background: transparent;
        color: #3b82f6;
        border: 1px solid #e2e8f0;
        &:hover {
            background: #eff6ff;
            border-color: #3b82f6;
        }
    }
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    color: #64748b;
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 80px;
    background: white;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    h3 {
        color: #0f172a;
        margin-bottom: 8px;
    }
    p {
        color: #64748b;
    }
`;
