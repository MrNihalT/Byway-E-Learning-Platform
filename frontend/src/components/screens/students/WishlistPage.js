import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function WishlistPage() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        api.get("course/wishlist/")
            .then((response) => {
                setWishlistItems(response.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching wishlist:", err);
                setError("Could not load your wishlist.");
                setIsLoading(false);
            });
    }, [userData, navigate]);

    const handleRemove = async (courseId) => {
        const result = await MySwal.fire({
            title: "Remove from Wishlist?",
            text: "This course will be removed from your wishlist.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`course/wishlist/${courseId}/remove/`);
            setWishlistItems((prevItems) =>
                prevItems.filter((item) => item.course.id !== courseId),
            );
        } catch (err) {
            console.error("Error removing item:", err);
            toast.error("Failed to remove item.");
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <LoadingWrapper>Loading Wishlist...</LoadingWrapper>
            </>
        );
    }

    return (
        <>
            <Header />
            <WishlistContainer>
                <Title>My Wishlist</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}

                {wishlistItems.length > 0 ? (
                    <ItemList>
                        {wishlistItems.map((item) => (
                            <WishlistItem key={item.id}>
                                <CourseImage
                                    src={item.course.course_image}
                                    alt={item.course.title}
                                />
                                <ItemDetails>
                                    <CourseTitle
                                        to={`/course/${item.course.id}`}
                                    >
                                        {item.course.title}
                                    </CourseTitle>
                                    <InstructorName>
                                        By {item.course.instructor.username}
                                    </InstructorName>
                                    <RemoveButton
                                        onClick={() =>
                                            handleRemove(item.course.id)
                                        }
                                    >
                                        Remove
                                    </RemoveButton>
                                </ItemDetails>
                                <ItemPrice>${item.course.price}</ItemPrice>
                            </WishlistItem>
                        ))}
                    </ItemList>
                ) : (
                    <EmptyMessage>
                        Your wishlist is empty.{" "}
                        <Link to="/">Explore courses</Link>.
                    </EmptyMessage>
                )}
            </WishlistContainer>
        </>
    );
}

const WishlistContainer = styled.div`
    max-width: 900px; /* Centered, but wider than cart */
    margin: 30px auto;
    padding: 20px;
`;
const Title = styled.h2`
    text-align: center;
    margin-bottom: 30px;
`;
const LoadingWrapper = styled.div`
    text-align: center;
    font-size: 1.5rem;
    padding: 50px;
`;
const ErrorMessage = styled.p`
    color: #dc3545;
    text-align: center;
`;
const EmptyMessage = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #555;
    a {
        color: #007bff;
        text-decoration: none;
    }
`;
const ItemList = styled.div`
    display: flex;
    flex-direction: column;
`;
const WishlistItem = styled.div`
    display: flex;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 15px;
    background: #fff;
`;
const CourseImage = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 15px;
`;
const ItemDetails = styled.div`
    flex-grow: 1;
`;
const CourseTitle = styled(Link)`
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;
const InstructorName = styled.p`
    font-size: 0.9rem;
    color: #777;
    margin: 5px 0;
`;
const RemoveButton = styled.button`
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    padding: 0;
    font-size: 0.9rem;
    &:hover {
        text-decoration: underline;
    }
`;
const ItemPrice = styled.div`
    font-size: 1.2rem;
    font-weight: 600;
`;
