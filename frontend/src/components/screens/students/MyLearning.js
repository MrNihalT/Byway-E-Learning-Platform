import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";

export default function MyLearning() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        api.get("course/student/my-learning/")
            .then((res) => {
                setCourses(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, [userData, navigate]);

    if (isLoading)
        return (
            <>
                <Header />
                <Container>Loading...</Container>
            </>
        );

    return (
        <>
            <Header />
            <Container>
                <Title>My Learning</Title>
                {courses.length === 0 ? (
                    <EmptyMessage>
                        You haven't enrolled in any courses yet.
                        <Link to="/"> Browse Courses</Link>
                    </EmptyMessage>
                ) : (
                    <CourseGrid>
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                to={`/learning/${course.id}`}
                            >
                                <CourseImg
                                    src={course.course_image}
                                    alt={course.title}
                                />
                                <CourseInfo>
                                    <CourseTitle>{course.title}</CourseTitle>
                                    <StartButton>Start Learning</StartButton>
                                </CourseInfo>
                            </CourseCard>
                        ))}
                    </CourseGrid>
                )}
            </Container>
        </>
    );
}


const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
`;
const Title = styled.h1`
    font-size: 28px;
    margin-bottom: 30px;
    color: #333;
`;
const EmptyMessage = styled.p`
    font-size: 18px;
    color: #666;
    a {
        color: #007bff;
        text-decoration: none;
    }
`;
const CourseGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
`;
const CourseCard = styled(Link)`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
`;
const CourseImg = styled.img`
    width: 100%;
    height: 160px;
    object-fit: cover;
`;
const CourseInfo = styled.div`
    padding: 15px;
`;
const CourseTitle = styled.h3`
    font-size: 18px;
    margin-bottom: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const StartButton = styled.button`
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
`;
