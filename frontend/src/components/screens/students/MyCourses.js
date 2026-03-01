import React, { useEffect, useState, useContext } from "react";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Header from "../../includes/Header";

function MyCourses() {
    const { userData } = useContext(UserContext);
    const [myCourses, setMyCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (userData && userData.role !== "instructor") {
            navigate("/");
            return;
        }
        if (userData.is_superuser) {
            setIsLoading(true);
            setError("");
            api.get("course/courses/")
                .then((response) => {
                    setMyCourses(response.data);
                })
                .catch((err) => {
                    console.error("Error fetching all courses:", err);
                    setError(
                        "Could not load courses. Please try again later.",
                        JSON.stringify(err),
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (userData && userData.role === "instructor") {
            setIsLoading(true);
            setError("");

            api.get("course/instructor/my-courses/")
                .then((response) => {
                    setMyCourses(response.data);
                })
                .catch((err) => {
                    console.error("Error fetching instructor courses:", err);
                    setError(
                        "Could not load your courses. Please try again later.",
                        JSON.stringify(err),
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (userData === null) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [userData, navigate]);

    if (isLoading) {
        return <LoadingText>Loading your courses...</LoadingText>;
    }

    if (!userData || userData.role !== "instructor") {
        return <LoadingText>Access Denied.</LoadingText>;
    }

    return (
        <>
            <Header />
            <Container>
                <Title>My Created Courses</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {myCourses.length > 0 ? (
                    <CourseList>
                        {myCourses.map((course) => (
                            <CourseItem key={course.id}>
                                <CourseImage
                                    src={course.course_image}
                                    alt={course.title}
                                />
                                <CourseInfo>
                                    <CourseTitle>{course.title}</CourseTitle>
                                    <CourseDescription>
                                        {course.short_description}
                                    </CourseDescription>
                                    <CourseStatus>
                                        Status:{" "}
                                        {course.is_draft
                                            ? "Draft"
                                            : "Published"}{" "}
                                        | Difficulty: {course.difficulty} |
                                        Price: ${course.price}
                                    </CourseStatus>
                                    <ManageLink
                                        to={`/instructor/edit-course/${course.id}`}
                                    >
                                        Manage Course
                                    </ManageLink>
                                </CourseInfo>
                            </CourseItem>
                        ))}
                    </CourseList>
                ) : (
                    <p>You haven't created any courses yet.</p>
                )}
                <CreateLink to="/create_post">Create New Course</CreateLink>
            </Container>
        </>
    );
}

export default MyCourses;

const Container = styled.div`
    padding: 20px;
    max-width: 900px;
    margin: 20px auto;
`;

const Title = styled.h3`
    text-align: center;
    margin-bottom: 30px;
    color: #333;
`;

const LoadingText = styled.p`
    text-align: center;
    padding: 20px;
    color: #555;
`;

const ErrorMessage = styled.p`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px 15px;
    border-radius: 6px;
    margin-bottom: 20px;
    text-align: center;
`;

const CourseList = styled.ul`
    list-style: none;
    padding: 0;
`;

const CourseItem = styled.li`
    display: flex;
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const CourseImage = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 20px;

    @media (max-width: 600px) {
        margin-right: 0;
        margin-bottom: 15px;
        width: 150px; /* Make image larger on mobile stack */
        height: 150px;
    }
`;

const CourseInfo = styled.div`
    flex-grow: 1; /* Takes remaining space */
`;

const CourseTitle = styled.h4`
    margin: 0 0 5px 0;
    color: #007bff;
`;

const CourseDescription = styled.p`
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    color: #555;
`;

const CourseStatus = styled.p`
    font-size: 0.8rem;
    color: #777;
    margin-bottom: 10px;
`;

const ManageLink = styled(Link)`
    display: inline-block;
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.85rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0056b3;
    }
`;

const CreateLink = styled(Link)`
    display: block;
    width: fit-content;
    margin: 30px auto 0;
    padding: 10px 20px;
    background-color: #28a745; /* Green color */
    color: white;
    text-decoration: none;
    border-radius: 5px;
    &:hover {
        background-color: #218838;
    }
`;
