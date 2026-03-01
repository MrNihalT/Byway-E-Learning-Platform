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

export default function CartPage() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userData) {
            navigate("/login");
            return;
        }

        setIsLoading(true);
        api.get("course/cart/")
            .then((response) => {
                setCartItems(response.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching cart:", err);
                setError("Could not load your cart.");
                setIsLoading(false);
            });
    }, [userData, navigate]);

    const handleRemove = async (courseId) => {
        const result = await MySwal.fire({
            title: "Remove from Cart?",
            text: "This course will be removed from your cart.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`course/cart/${courseId}/remove/`);
            setCartItems((prevItems) =>
                prevItems.filter((item) => item.course.id !== courseId),
            );
        } catch (err) {
            console.error("Error removing item:", err);
            toast.error("Failed to remove item.");
        }
    };

    const handleClearCart = async () => {
        const result = await MySwal.fire({
            title: "Clear Cart?",
            text: "All courses will be removed from your cart.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, clear it!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete("course/cart/");
            setCartItems([]);
        } catch (err) {
            console.error("Error clearing cart:", err);
            toast.error("Failed to clear cart.");
        }
    };

    const calculateTotal = () => {
        return cartItems
            .reduce((acc, item) => {
                const price = parseFloat(item.course.price);
                return acc + price;
            }, 0)
            .toFixed(2);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        try {
            const response = await api.post("course/cart/checkout/");
            const { order_id, key_id, amount, description } = response.data;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Byway Learning",
                description: description,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        await api.post("course/cart/verify-payment/", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        toast.success(
                            "Payment Successful! You are enrolled in all courses.",
                        );
                        navigate("/my-learning");
                    } catch (err) {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: userData.username,
                    email: userData.email,
                },
                theme: { color: "#007bff" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            toast.error("Checkout failed. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <LoadingWrapper>Loading Cart...</LoadingWrapper>
            </>
        );
    }

    return (
        <>
            <Header />
            <CartContainer>
                <Title>My Shopping Cart</Title>
                {error && <ErrorMessage>{error}</ErrorMessage>}

                {cartItems.length > 0 ? (
                    <CartLayout>
                        <ItemList>
                            {cartItems.map((item) => (
                                <CartItem key={item.id}>
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
                                </CartItem>
                            ))}
                        </ItemList>

                        <Summary>
                            <SummaryTitle>Summary</SummaryTitle>
                            <SummaryRow>
                                <span>Total:</span>
                                <SummaryTotal>${calculateTotal()}</SummaryTotal>
                            </SummaryRow>
                            <CheckoutButton onClick={handleCheckout}>
                                Proceed to Checkout
                            </CheckoutButton>
                            <ClearButton onClick={handleClearCart}>
                                Clear Cart
                            </ClearButton>
                        </Summary>
                    </CartLayout>
                ) : (
                    <EmptyCartMessage>
                        Your cart is empty. <Link to="/">Keep shopping</Link>.
                    </EmptyCartMessage>
                )}
            </CartContainer>
        </>
    );
}

// --- Styled Components ---
const CartContainer = styled.div`
    max-width: 1200px;
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
const EmptyCartMessage = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #555;
    a {
        color: #007bff;
        text-decoration: none;
    }
`;
const CartLayout = styled.div`
    display: flex;
    gap: 30px;
    @media (max-width: 900px) {
        flex-direction: column;
    }
`;
const ItemList = styled.div`
    flex: 3;
`;
const CartItem = styled.div`
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
const Summary = styled.div`
    flex: 1;
    background: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    height: fit-content;
`;
const SummaryTitle = styled.h3`
    margin-top: 0;
    text-align: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
`;
const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    margin-bottom: 20px;
`;
const SummaryTotal = styled.span`
    font-size: 1.3rem;
    font-weight: 700;
`;
const CheckoutButton = styled.button`
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;
const ClearButton = styled(CheckoutButton)`
    background-color: #dc3545;
    margin-top: 10px;
    &:hover {
        background-color: #c82333;
    }
`;
