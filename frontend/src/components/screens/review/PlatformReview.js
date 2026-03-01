import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import LeftArrowIcon from "../../assets/icons/left.svg";
import RightArrowIcon from "../../assets/icons/right.svg";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import api from "../../../api";

export default function PlatformReview() {
    const [reviews, setReviews] = useState([]);
    const carouselRef = useRef();

    useEffect(() => {
        api.get("course/platform/reviews/")
            .then((res) => {
                setReviews(res.data);
            })
            .catch((err) => console.error("Failed to load reviews", err));
    }, []);

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 4,
            slidesToSlide: 1,
        },
        tablet: {
            breakpoint: { max: 1080, min: 464 },
            items: 2,
            slidesToSlide: 1,
        },
        mobile: {
            breakpoint: { max: 548, min: 0 },
            items: 1,
            slidesToSlide: 1,
        },
    };

    const handlePrev = () => {
        if (carouselRef.current) carouselRef.current.previous();
    };

    const handleNext = () => {
        if (carouselRef.current) carouselRef.current.next();
    };

    if (reviews.length === 0) return null; 

    return (
        <CustomerFeedbackSection>
            <Wrapper>
                <CustomerTop>
                    <Heading>What Our Customers Say About Us</Heading>
                    <ButtonGroupWrapper>
                        <LeftButton onClick={handlePrev}>
                            <LeftArrow src={LeftArrowIcon} alt="Previous" />
                        </LeftButton>
                        <RightButton onClick={handleNext}>
                            <RightArrow src={RightArrowIcon} alt="Next" />
                        </RightButton>
                    </ButtonGroupWrapper>
                </CustomerTop>

                <CustomerBottom>
                    <Carousel
                        ref={carouselRef}
                        swipeable={true}
                        draggable={true}
                        showDots={false}
                        responsive={responsive}
                        arrows={false}
                        infinite={true}
                        autoPlay={true}
                        autoPlaySpeed={4000}
                        customTransition="all .5s"
                        transitionDuration={500}
                    >
                        {reviews.map((r, index) => (
                            <CustomerBottomLi key={index}>
                                <QuoteImg
                                    src={
                                        require("../../assets/icons/double_quots.svg")
                                            .default
                                    }
                                />
                                <CustomerQuote>"{r.comment}"</CustomerQuote>
                                <CustomerQuoteBottom>
                                    <CustomerImg
                                        src={
                                            r.user_image
                                                ? r.user_image
                                                : "https://via.placeholder.com/60"
                                        }
                                        alt={r.user_name}
                                    />
                                    <div>
                                        <CustomerName>
                                            {r.user_name}
                                        </CustomerName>
                                        <CustomerRole>
                                            {r.user_role}
                                        </CustomerRole>
                                        <StarRating>★ {r.rating}/5</StarRating>
                                    </div>
                                </CustomerQuoteBottom>
                            </CustomerBottomLi>
                        ))}
                    </Carousel>
                </CustomerBottom>
            </Wrapper>
        </CustomerFeedbackSection>
    );
}

const CustomerFeedbackSection = styled.section`
    background: #f8fafc;
    padding: 80px 20px;
`;
const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;
const CustomerTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
`;
const Heading = styled.h3`
    font-weight: 700;
    font-size: 28px;
    color: #0f172a;
`;
const ButtonGroupWrapper = styled.div`
    display: flex;
    gap: 15px;
`;
const LeftButton = styled.button`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    border: none;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover {
        background: #cbd5e1;
    }
`;
const RightButton = styled(LeftButton)`
    background: #0f172a;
    &:hover {
        background: #334155;
    }
`;
const LeftArrow = styled.img`
    width: 10px;
`;
const RightArrow = styled.img`
    width: 10px;
    filter: invert(1);
`;

const CustomerBottom = styled.div``;
const CustomerBottomLi = styled.div`
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 30px;
    margin: 0 10px;
    height: 100%;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;
const QuoteImg = styled.img`
    width: 30px;
    margin-bottom: 20px;
`;
const CustomerQuote = styled.p`
    font-size: 16px;
    line-height: 1.6;
    color: #334155;
    flex: 1;
`;
const CustomerQuoteBottom = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
`;
const CustomerImg = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
`;
const CustomerName = styled.h4`
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
`;
const CustomerRole = styled.span`
    font-size: 12px;
    color: #64748b;
    text-transform: capitalize;
    display: block;
`;
const StarRating = styled.span`
    font-size: 12px;
    color: #f59e0b;
    font-weight: 600;
`;
