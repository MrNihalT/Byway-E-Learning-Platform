import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function CategoryPage() {
    const { categoryId } = useParams();
    const [courses, setCourses] = useState([]);
    const [category, setCategory] = useState(null);


    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const isFetching = useRef(false);

  
    useEffect(() => {
        if (categoryId) {
            api.get(`course/categories/${categoryId}/`)
                .then((res) => setCategory(res.data))
                .catch(console.error);
        }
    }, [categoryId]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (isFetching.current) return;
            isFetching.current = true;
            setIsLoading(true);

            try {
                
                let query = `course/courses/?category_id=${categoryId}`;

                if (selectedDifficulty)
                    query += `&difficulty=${selectedDifficulty}`;
                if (selectedPrice) query += `&price_type=${selectedPrice}`;
                if (searchQuery) query += `&search=${searchQuery}`;

                const res = await api.get(query);
                setCourses(res.data.results || res.data);
            } catch (err) {
                console.error("Error fetching category courses:", err);
            } finally {
                setIsLoading(false);
                isFetching.current = false;
            }
        };

        if (categoryId) {
            fetchCourses();
        }
    }, [categoryId, selectedDifficulty, selectedPrice, searchQuery]);

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                 
                    <Breadcrumb>
                        <Link to="/">Home</Link>
                        <Arrow>&gt;</Arrow>
                        <Link to="/categories">Categories</Link>
                        <Arrow>&gt;</Arrow>
                        <CurrentPage>
                            {category?.name || "Category"}
                        </CurrentPage>
                    </Breadcrumb>

                    <PageLayout>
                      
                        <Sidebar>
                            <FilterSection>
                                <h3>Search</h3>
                                <SearchInput
                                    type="text"
                                    placeholder={`Search in ${
                                        category?.name || "..."
                                    }`}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </FilterSection>

                            <FilterSection>
                                <h3>Difficulty</h3>
                                <Select
                                    value={selectedDifficulty}
                                    onChange={(e) =>
                                        setSelectedDifficulty(e.target.value)
                                    }
                                >
                                    <option value="">All Difficulties</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">
                                        Intermediate
                                    </option>
                                    <option value="Advanced">Advanced</option>
                                </Select>
                            </FilterSection>

                            <FilterSection>
                                <h3>Price</h3>
                                <Select
                                    value={selectedPrice}
                                    onChange={(e) =>
                                        setSelectedPrice(e.target.value)
                                    }
                                >
                                    <option value="">All Prices</option>
                                    <option value="free">Free</option>
                                    <option value="paid">Paid</option>
                                </Select>
                            </FilterSection>
                        </Sidebar>

                
                        <MainContent>
                            <PageHeader>
                                <Title>
                                    {category?.name || "Category"} Courses
                                </Title>
                                <Subtitle>
                                    {courses.length} courses found
                                </Subtitle>
                            </PageHeader>

                            {isLoading ? (
                                <LoadingView>Loading courses...</LoadingView>
                            ) : courses.length > 0 ? (
                                <CourseGrid>
                                    {courses.map((course) => (
                                        <CourseCard
                                            key={course.id}
                                            to={`/course/${course.id}`}
                                        >
                                            <ImageContainer>
                                                <CourseImage
                                                    src={course.course_image}
                                                    alt={course.title}
                                                />
                                            </ImageContainer>
                                            <CardContent>
                                                <CourseTitle>
                                                    {course.title}
                                                </CourseTitle>
                                                <InstructorName>
                                                    By{" "}
                                                    {
                                                        course.instructor
                                                            ?.username
                                                    }
                                                </InstructorName>
                                                <RatingRow>
                                                    <StarIcon
                                                        src={
                                                            require("../../assets/icons/star.svg")
                                                                .default
                                                        }
                                                    />
                                                    <RatingVal>
                                                        {course.rating} (
                                                        {course.total_review})
                                                    </RatingVal>
                                                </RatingRow>
                                                <Price>${course.price}</Price>
                                            </CardContent>
                                        </CourseCard>
                                    ))}
                                </CourseGrid>
                            ) : (
                                <EmptyState>
                                    <h3>No courses found</h3>
                                    <p>Try adjusting your filters.</p>
                                </EmptyState>
                            )}
                        </MainContent>
                    </PageLayout>
                </Wrapper>
            </PageContainer>
            <Footer />
        </>
    );
}



const PageContainer = styled.div`
    background-color: #f8fafc;
    min-height: 80vh;
    padding: 40px 0;
`;

const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;

const PageLayout = styled.div`
    display: flex;
    gap: 40px;
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

// Sidebar Styles
const Sidebar = styled.aside`
    width: 250px;
    flex-shrink: 0;
    @media (max-width: 768px) {
        width: 100%;
    }
`;
const FilterSection = styled.div`
    margin-bottom: 30px;
    h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #0f172a;
    }
`;
const SearchInput = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
`;
const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: white;
`;
const RadioGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    label {
        font-size: 14px;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
    }
`;

// Main Content Styles
const MainContent = styled.div`
    flex: 1;
`;

const Breadcrumb = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 30px;
    a {
        text-decoration: none;
        color: #64748b;
        &:hover {
            color: #0f172a;
        }
    }
`;
const Arrow = styled.span`
    font-size: 12px;
`;
const CurrentPage = styled.span`
    color: #0f172a;
    font-weight: 500;
`;

const PageHeader = styled.div`
    margin-bottom: 30px;
`;
const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 5px;
`;
const Subtitle = styled.p`
    color: #64748b;
    font-size: 1rem;
`;

const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 30px;
`;

const LoadingView = styled.div`
    height: 50vh;
    display: flex;
    justify-content: center;
    alignitems: center;
    font-size: 1.2rem;
    color: #64748b;
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
    }
`;

// Card Styles (Reused)
const CourseCard = styled(Link)`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
`;
const ImageContainer = styled.div`
    height: 160px;
    width: 100%;
    overflow: hidden;
`;
const CourseImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;
const CardContent = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
`;
const CourseTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;
const InstructorName = styled.p`
    font-size: 13px;
    color: #64748b;
    margin-bottom: 12px;
`;
const RatingRow = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
`;
const StarIcon = styled.img`
    width: 14px;
    height: 14px;
`;
const RatingVal = styled.span`
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
`;
const Price = styled.p`
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin-top: auto;
`;
