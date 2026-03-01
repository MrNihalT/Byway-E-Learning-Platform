import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function AllCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("course/categories/")
            .then((res) => {
                setCategories(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                    <PageTitle>Explore Categories</PageTitle>

                    {loading ? (
                        <LoadingText>Loading categories...</LoadingText>
                    ) : (
                        <CategoriesGrid>
                            {categories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    to={`/category/${category.id}`}
                                >
                                    <IconWrapper>
                                        <CategoryIcon
                                            src={
                                                category.category_img ||
                                                "https://via.placeholder.com/50"
                                            }
                                            alt={category.name}
                                        />
                                    </IconWrapper>
                                    <CategoryName>{category.name}</CategoryName>
                                    <CourseCount>
                                        {category.total_course} Courses
                                    </CourseCount>
                                </CategoryCard>
                            ))}
                        </CategoriesGrid>
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
    padding: 60px 0;
`;

const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 40px;
    text-align: center;
`;

const LoadingText = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #64748b;
`;

const CategoriesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 30px;
`;

const CategoryCard = styled(Link)`
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    text-decoration: none;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    height: 220px;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        border-color: #3b82f6;
    }
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background-color: #e0f2fe;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
`;

const CategoryIcon = styled.img`
    width: 40px;
    height: 40px;
    object-fit: contain;
`;

const CategoryName = styled.h3`
    font-size: 1.1rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 8px 0;
`;

const CourseCount = styled.span`
    font-size: 0.9rem;
    color: #64748b;
`;
