import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

// Assets
import starIcon from "../../assets/icons/star.svg";

export default function AllInstructorsPage() {
    const [instructors, setInstructors] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const isFetching = useRef(false);

    const limit = 5;
    let fff = 0;
    const fetchInstructors = () => {
        fff += 1;
        console.log("fetch worked", fff);

        setIsLoading(true);
        // Assuming backend endpoint: course/top-sellers/?page=X&limit=Y
        api.get(`course/top-sellers/?page=${page}&limit=${limit}`)
            .then((res) => {
                const newInstructors = res.data.results || res.data;
                if (newInstructors.length < limit) setHasMore(false);

                setInstructors((prev) => {
                    const existingIds = new Set(prev.map((c) => c.id));
                    console.log(existingIds);
                    const uniqueNewINstructors = newInstructors.filter(
                        (c) => !existingIds.has(c.id)
                    );
                    return [...prev, ...uniqueNewINstructors];
                });

                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                setHasMore(false);
            });
    };

    useEffect(() => {
        fetchInstructors();
    }, [page]);

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                    <Title>Our Expert Instructors</Title>
                    <Grid>
                        {instructors.map((instructor) => (
                            <InstructorCard
                                key={instructor.id}
                                to={`/instructor/${instructor.id}`}
                            >
                                <ProfileImg
                                    src={instructor.profile_picture}
                                    alt={instructor.username}
                                />
                                <Name>{instructor.username}</Name>
                                <Role>
                                    {instructor.qualification || "Instructor"}
                                </Role>
                                <Stats>
                                    <span>
                                        <img
                                            src={starIcon}
                                            width="12px"
                                            alt=""
                                        />{" "}
                                        {instructor.total_rating || 0}
                                    </span>
                                    <span>
                                        {instructor.total_customers || 0}{" "}
                                        Students
                                    </span>
                                </Stats>
                            </InstructorCard>
                        ))}
                    </Grid>
                    {isLoading && <LoadingText>Loading...</LoadingText>}
                    {!isLoading && hasMore && (
                        <LoadMoreButton
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            Load More
                        </LoadMoreButton>
                    )}
                </Wrapper>
            </PageContainer>
            <Footer />
        </>
    );
}

// --- Styled Components ---
const PageContainer = styled.div`
    padding: 50px 0;
    background: #fff;
    min-height: 80vh;
`;
const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    text-align: center;
`;
const Title = styled.h1`
    margin-bottom: 40px;
    color: #333;
`;
const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
`;
const InstructorCard = styled(Link)`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 25px;
    border: 1px solid #eee;
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        border-color: #bdf;
    }
`;
const ProfileImg = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
`;
const Name = styled.h3`
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: #0f172a;
`;
const Role = styled.p`
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 15px;
`;
const Stats = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-top: 15px;
    border-top: 1px solid #f1f5f9;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
`;
const LoadMoreButton = styled.button`
    background-color: #3b82f6;
    color: white;
    padding: 12px 30px;
    border-radius: 30px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    &:hover {
        background-color: #2563eb;
    }
`;
const LoadingText = styled.p`
    color: #666;
    margin: 20px 0;
`;
