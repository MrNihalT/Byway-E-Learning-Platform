import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function AllCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // --- NEW: Filter States ---
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedPrice, setSelectedPrice] = useState(""); // 'free' or 'paid'
    const [searchQuery, setSearchQuery] = useState("");

    const isFetching = useRef(false);
    const limit = 8;

    // 1. Fetch Categories for the Sidebar
    useEffect(() => {
        api.get("course/categories/")
            .then((res) => setCategories(res.data))
            .catch(console.error);
    }, []);

    // 2. Fetch Courses (Reset list when filters change)
    const fetchCourses = async (reset = false) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setIsLoading(true);

        try {
            // Build Query String
            let query = `course/courses/?page=${
                reset ? 1 : page
            }&limit=${limit}`;
            if (selectedCategory) query += `&category_id=${selectedCategory}`;
            if (selectedDifficulty)
                query += `&difficulty=${selectedDifficulty}`;
            if (selectedPrice) query += `&price_type=${selectedPrice}`;
            if (searchQuery) query += `&search=${searchQuery}`;

            const res = await api.get(query);
            const newCourses = res.data.results || res.data;

            if (newCourses.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true); // Reset if we got a full page
            }

            if (reset) {
                setCourses(newCourses);
            } else {
                setCourses((prev) => {
                    const existingIds = new Set(prev.map((c) => c.id));
                    const unique = newCourses.filter(
                        (c) => !existingIds.has(c.id),
                    );
                    return [...prev, ...unique];
                });
            }
        } catch (err) {
            console.error(err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    };

    // 3. Trigger Fetch when Filters Change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchCourses(true);
    }, [selectedCategory, selectedDifficulty, selectedPrice, searchQuery]);

    // 4. Trigger Fetch when Page Changes (Pagination)
    useEffect(() => {
        if (page > 1) {
            fetchCourses(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                    <PageLayout>
                        {/* --- SIDEBAR FILTERS --- */}
                        <Sidebar>
                            <FilterSection>
                                <h3>Search</h3>
                                <SearchInput
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </FilterSection>

                            <FilterSection>
                                <h3>Categories</h3>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Select>
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
                                    <option value="">Sort By Price</option>

                                    <option value="low_to_high">
                                        low to high
                                    </option>
                                    <option value="high_to_low">
                                        high to low
                                    </option>
                                </Select>
                            </FilterSection>
                        </Sidebar>

                        {/* --- MAIN CONTENT --- */}
                        <MainContent>
                            <Title>All Courses</Title>

                            {courses.length === 0 && !isLoading ? (
                                <EmptyState>
                                    No courses match your filters.
                                </EmptyState>
                            ) : (
                                <CourseGrid>
                                    {courses.map((course) => (
                                        <ProductCard key={course.id}>
                                            <Link to={`/course/${course.id}`}>
                                                <ImageContainer>
                                                    <CourseImage
                                                        src={
                                                            course.course_image
                                                        }
                                                        alt={course.title}
                                                    />
                                                </ImageContainer>
                                                <Info>
                                                    <CourseTitle>
                                                        {course.title}
                                                    </CourseTitle>
                                                    <CategoryName>
                                                        {course.category
                                                            ?.name || "General"}
                                                    </CategoryName>
                                                    <ProductRatingWrapper>
                                                        <img
                                                            src={
                                                                require("../../assets/icons/star.svg")
                                                                    .default
                                                            }
                                                            alt="star"
                                                            width="14"
                                                        />
                                                        <span>
                                                            {course.rating} (
                                                            {
                                                                course.total_review
                                                            }
                                                            ){" | "}
                                                            {
                                                                course.total_enrolled
                                                            }{" "}
                                                            students
                                                        </span>
                                                    </ProductRatingWrapper>
                                                    <MetaRow>
                                                        <Badge>
                                                            {course.difficulty}
                                                        </Badge>
                                                        <PriceBox>
                                                            {course.offer_percentage >
                                                            0 ? (
                                                                <>
                                                                    <Price>
                                                                        $
                                                                        {(
                                                                            parseFloat(
                                                                                course.price,
                                                                            ) *
                                                                            (1 -
                                                                                course.offer_percentage /
                                                                                    100)
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                    </Price>
                                                                    <OriginalPrice>
                                                                        $
                                                                        {parseFloat(
                                                                            course.price,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                    </OriginalPrice>
                                                                </>
                                                            ) : (
                                                                <Price>
                                                                    $
                                                                    {parseFloat(
                                                                        course.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </Price>
                                                            )}
                                                        </PriceBox>
                                                    </MetaRow>
                                                </Info>
                                            </Link>
                                        </ProductCard>
                                    ))}
                                </CourseGrid>
                            )}

                            {isLoading && <LoadingText>Loading...</LoadingText>}

                            {!isLoading && hasMore && courses.length > 0 && (
                                <LoadMoreButton
                                    onClick={() => setPage((prev) => prev + 1)}
                                >
                                    Load More
                                </LoadMoreButton>
                            )}
                        </MainContent>
                    </PageLayout>
                </Wrapper>
            </PageContainer>
            <Footer />
        </>
    );
}

// --- Styled Components ---
const StarIcon = styled.span`
    color: #f59e0b;
`;
const ProductRatingWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
    svg {
        width: 14px;
        height: 14px;
        fill: #f59e0b;
    }
`;
const PageContainer = styled.div`
    padding: 50px 0;
    background-color: #f8fafc;
    min-height: 80vh;
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
const Title = styled.h1`
    font-size: 2rem;
    margin-bottom: 30px;
    color: #0f172a;
`;
const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
`;
const ProductCard = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    a {
        text-decoration: none;
        color: inherit;
    }
`;
const ImageContainer = styled.div`
    height: 150px;
    overflow: hidden;
`;
const CourseImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;
const Info = styled.div`
    padding: 15px;
`;
const CourseTitle = styled.h3`
    font-size: 1rem;
    margin-bottom: 5px;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const CategoryName = styled.p`
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 10px;
`;
const MetaRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const Price = styled.div`
    font-weight: 700;
    font-size: 1.1rem;
    color: #0f172a;
`;
const PriceBox = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;
const OriginalPrice = styled.span`
    font-size: 0.8rem;
    color: #94a3b8;
    text-decoration: line-through;
`;
const Badge = styled.span`
    background: #f1f5f9;
    color: #475569;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
`;
const LoadMoreButton = styled.button`
    background-color: #0f172a;
    color: white;
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: block;
    margin: 0 auto;
    &:hover {
        background-color: #1e293b;
    }
`;
const LoadingText = styled.p`
    text-align: center;
    color: #64748b;
    margin: 20px 0;
`;
const EmptyState = styled.p`
    text-align: center;
    color: #64748b;
    font-size: 1.1rem;
    margin-top: 40px;
`;
