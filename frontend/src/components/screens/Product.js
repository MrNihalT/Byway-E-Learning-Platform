import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Header from "../includes/Header";
import Footer from "../includes/Footer";
import { UserContext } from "../includes/UserProvider";
import api from "../../api";
import PlatformReview from "./review/PlatformReview.js";
import BecomeSeller from "./instructor/BecomeSeller.js";

import Bg1 from "../assets/images/bg1.jpg";
import Bg2 from "../assets/images/bg2.jpg";
import Bg4 from "../assets/images/bg4.jpg";

export default function Product() {
    const [product, setProduct] = useState([]);
    const [seller, setSeller] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryGroups, setCategoryGroups] = useState([]); // --- NEW: Grouped Courses
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            image: Bg1,
            heading: "Jump into learning for less",
            desc: "If you’re new to Byway, we’ve got good news: For a limited time, courses max price is just ₹500 for new learners! Shop now.",
            btnText: "Start Learning",
            link: "/courses",
        },
        {
            id: 2,
            image: Bg2,
            heading: "Powered by community",
            desc: "Trust ratings and reviews to make a smarter choice. Get started with our top-rated courses.",
            btnText: "Browse Top Rated",
            link: "/courses",
        },
        {
            id: 3,
            image: Bg4,
            heading: "Learning that fits your life",
            desc: "Skills for your present (and your future). Get started with us to shape your career.",
            btnText: "Join for Free",
            link: "/login",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === slides.length - 1 ? 0 : prev + 1,
            );
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const { userData } = useContext(UserContext);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.get("course/courses/"),
            api.get("course/top-sellers/"),
            api.get("course/categories/"),
            api.get("course/public-stats/"),
            api.get("course/home/courses-by-category/"),
        ])
            .then(
                ([
                    response,
                    sellers,
                    categoriesRes,
                    statsRes,
                    catGroupsRes,
                ]) => {
                    const productsData = response.data.results || response.data;
                    const sellersData = sellers.data.results || sellers.data;

                    setProduct(Array.isArray(productsData) ? productsData : []);
                    setSeller(Array.isArray(sellersData) ? sellersData : []);
                    setCategories(categoriesRes.data);
                    setStats(statsRes.data);
                    setCategoryGroups(catGroupsRes.data);
                },
            )
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);
    console.log(categoryGroups);
    if (isLoading) {
        return (
            <>
                <Header />
                <LoadingContainer>Loading content...</LoadingContainer>
            </>
        );
    }

    return (
        <>
            <Header />

            <CarouselContainer>
                {slides.map((slide, index) => (
                    <Slide
                        key={slide.id}
                        $bgImage={slide.image}
                        $active={index === currentSlide}
                    >
                        <Wrapper className="wrapper" style={{ height: "100%" }}>
                            <SpotlightContent>
                                <SpotlightHeading>
                                    {slide.heading}
                                </SpotlightHeading>
                                <SpotlightDescription>
                                    {slide.desc}
                                </SpotlightDescription>
                                <SpotlightButton
                                    to={userData ? slide.link : "/login"}
                                >
                                    {slide.btnText}
                                </SpotlightButton>
                            </SpotlightContent>
                        </Wrapper>
                    </Slide>
                ))}

                <NavBtn direction="left" onClick={prevSlide}>
                    ❮
                </NavBtn>
                <NavBtn direction="right" onClick={nextSlide}>
                    ❯
                </NavBtn>
            </CarouselContainer>

            <CourseDetails>
                <Wrapper className="wrapper">
                    <CourseUl>
                        {stats ? (
                            <>
                                <CourseLi>
                                    <CourseHeading>
                                        {stats.total_courses}+
                                    </CourseHeading>
                                    <CourseDetail>Online Courses</CourseDetail>
                                </CourseLi>
                                <CourseLi>
                                    <CourseHeading>
                                        {stats.total_instructors}+
                                    </CourseHeading>
                                    <CourseDetail>Expert Mentors</CourseDetail>
                                </CourseLi>
                                <CourseLi>
                                    <CourseHeading>
                                        {stats.total_students}+
                                    </CourseHeading>
                                    <CourseDetail>
                                        Students Enrolled
                                    </CourseDetail>
                                </CourseLi>
                                <CourseLi>
                                    <CourseHeading>
                                        {stats.total_enrollments}+
                                    </CourseHeading>
                                    <CourseDetail>
                                        Course Enrollments
                                    </CourseDetail>
                                </CourseLi>
                            </>
                        ) : (
                            <p>Loading stats...</p>
                        )}
                    </CourseUl>
                </Wrapper>
            </CourseDetails>

            <CourseCategories>
                <Wrapper className="wrapper">
                    <CategorieTop>
                        <CatogeryHeading>Top Categories</CatogeryHeading>
                        <CategorySeeAll as={Link} to="/categories">
                            See All
                        </CategorySeeAll>
                    </CategorieTop>
                    <CategorieBottom>
                        <CatogoryUl>
                            {categories.slice(0, 4).map((category) => (
                                <CategoryLi key={category.id}>
                                    <Link
                                        to={`/category/${category.id}`}
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            width: "100%",
                                            height: "100%",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CatogoryImgDiv>
                                            <CatogoryImg
                                                src={category.category_img}
                                                alt={category.name}
                                            />
                                        </CatogoryImgDiv>
                                        <CategoryHeading>
                                            {category.name}
                                        </CategoryHeading>
                                        <CategoryDetail>
                                            {category.total_course} Courses
                                        </CategoryDetail>
                                    </Link>
                                </CategoryLi>
                            ))}
                        </CatogoryUl>
                    </CategorieBottom>
                </Wrapper>
            </CourseCategories>
            <TopProductContainer id="products">
                <Wrapper className="wrapper">
                    <CategorieTop>
                        <CatogeryHeading>Most Popular</CatogeryHeading>
                        <CategorySeeAll as={Link} to="/courses">
                            See All
                        </CategorySeeAll>
                    </CategorieTop>
                    <ProductBottom>
                        <ProductUl>
                            {product &&
                                product.slice(0, 4).map((prdt) => (
                                    <ProductLi key={prdt.id}>
                                        <Link to={`/course/${prdt.id}`}>
                                            <ProdcutImageDiv>
                                                <ProductImage
                                                    src={prdt.course_image}
                                                    alt={prdt.title}
                                                />
                                            </ProdcutImageDiv>
                                            <ProductName>
                                                {prdt.title}
                                            </ProductName>
                                            <ProductCatogery>
                                                {prdt.category?.name ||
                                                    "Uncategorized"}
                                            </ProductCatogery>
                                            <ProductRatingWrapper>
                                                <img
                                                    src={
                                                        require("../assets/icons/star.svg")
                                                            .default
                                                    }
                                                    alt="star"
                                                    width="14"
                                                />
                                                <span>
                                                    {prdt.rating} (
                                                    {prdt.total_review}){" | "}
                                                    {prdt.total_enrolled}{" "}
                                                    students
                                                </span>
                                            </ProductRatingWrapper>
                                            <ProductPriceBox>
                                                {prdt.offer_percentage > 0 ? (
                                                    <>
                                                        <ProductPrice
                                                            discounted
                                                        >
                                                            $
                                                            {(
                                                                parseFloat(
                                                                    prdt.price,
                                                                ) *
                                                                (1 -
                                                                    prdt.offer_percentage /
                                                                        100)
                                                            ).toFixed(2)}
                                                        </ProductPrice>
                                                        <ProductOrigPrice>
                                                            $
                                                            {parseFloat(
                                                                prdt.price,
                                                            ).toFixed(2)}
                                                        </ProductOrigPrice>
                                                    </>
                                                ) : (
                                                    <ProductPrice>
                                                        $
                                                        {parseFloat(
                                                            prdt.price,
                                                        ).toFixed(2)}
                                                    </ProductPrice>
                                                )}
                                            </ProductPriceBox>
                                        </Link>
                                    </ProductLi>
                                ))}
                        </ProductUl>
                    </ProductBottom>
                </Wrapper>
            </TopProductContainer>

            {categoryGroups.map(
                (group) =>
                    group.courses.length > 0 && (
                        <TopProductContainer key={group.id}>
                            <Wrapper className="wrapper">
                                <CategorieTop>
                                    <CatogeryHeading>
                                        Top courses in {group.name}
                                    </CatogeryHeading>
                                    <CategorySeeAll
                                        as={Link}
                                        to={`/category/${group.id}`}
                                    >
                                        See All
                                    </CategorySeeAll>
                                </CategorieTop>
                                <ProductBottom>
                                    <ProductUl>
                                        {group.courses.map((prdt) => (
                                            <ProductLi key={prdt.id}>
                                                <Link to={`/course/${prdt.id}`}>
                                                    <ProdcutImageDiv>
                                                        <ProductImage
                                                            src={
                                                                prdt.course_image
                                                            }
                                                            alt={prdt.title}
                                                        />
                                                    </ProdcutImageDiv>
                                                    <ProductName>
                                                        {prdt.title}
                                                    </ProductName>
                                                    <ProductCatogery>
                                                        {
                                                            prdt.instructor
                                                                ?.username
                                                        }
                                                    </ProductCatogery>
                                                    <ProductRatingWrapper>
                                                        <img
                                                            src={
                                                                require("../assets/icons/star.svg")
                                                                    .default
                                                            }
                                                            alt="star"
                                                            width="14"
                                                        />
                                                        <span>
                                                            {prdt.rating} (
                                                            {prdt.total_review})
                                                            {" | "}
                                                            {
                                                                prdt.total_enrolled
                                                            }
                                                            {""}
                                                            students
                                                        </span>
                                                    </ProductRatingWrapper>
                                                    <ProductPriceBox>
                                                        {prdt.offer_percentage >
                                                        0 ? (
                                                            <>
                                                                <ProductPrice
                                                                    discounted
                                                                >
                                                                    $
                                                                    {(
                                                                        parseFloat(
                                                                            prdt.price,
                                                                        ) *
                                                                        (1 -
                                                                            prdt.offer_percentage /
                                                                                100)
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </ProductPrice>
                                                                <ProductOrigPrice>
                                                                    $
                                                                    {parseFloat(
                                                                        prdt.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </ProductOrigPrice>
                                                            </>
                                                        ) : (
                                                            <ProductPrice>
                                                                $
                                                                {parseFloat(
                                                                    prdt.price,
                                                                ).toFixed(2)}
                                                            </ProductPrice>
                                                        )}
                                                    </ProductPriceBox>
                                                </Link>
                                            </ProductLi>
                                        ))}
                                    </ProductUl>
                                </ProductBottom>
                            </Wrapper>
                        </TopProductContainer>
                    ),
            )}

            <TopSellerContainer>
                <Wrapper className="wrapper">
                    <CategorieTop>
                        <CatogeryHeading>Top Instructors</CatogeryHeading>
                        <CategorySeeAll as={Link} to="/instructors">
                            See All
                        </CategorySeeAll>
                    </CategorieTop>
                    <TopSellerBottom>
                        <SellerUlContainer>
                            {seller &&
                                seller.slice(0, 5).map((sell) => (
                                    <SellerLiContainer key={sell.id}>
                                        <SellerLink
                                            to={`/instructor/${sell.id}`}
                                        >
                                            <SellerImg
                                                src={sell.profile_picture}
                                                alt={sell.username}
                                            />
                                            <SellerName>
                                                {sell.username}
                                            </SellerName>
                                            <SellerCategoryL>
                                                {sell.qualification ||
                                                    sell.about_me ||
                                                    "Instructor"}
                                            </SellerCategoryL>
                                            <SellerDetails>
                                                <SellerRating>
                                                    <StarIconSeller
                                                        src={
                                                            require("../assets/icons/star.svg")
                                                                .default
                                                        }
                                                        alt="star"
                                                    />
                                                    {sell.total_rating || 0}
                                                </SellerRating>
                                                <SellerProducts>
                                                    {sell.total_customers || 0}{" "}
                                                    Students
                                                </SellerProducts>
                                            </SellerDetails>
                                        </SellerLink>
                                    </SellerLiContainer>
                                ))}
                        </SellerUlContainer>
                    </TopSellerBottom>
                </Wrapper>
            </TopSellerContainer>

            <PlatformReview />
            <BecomeSeller />
            <Footer />
        </>
    );
}

// Styled Components

const LoadingContainer = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: #555;
`;

const Wrapper = styled.div`
    /* Add global wrapper styles if needed, or rely on class 'wrapper' */
`;

const CarouselContainer = styled.section`
    position: relative;
    height: 480px;
    width: 100%;
    overflow: hidden;
    margin-bottom: 20px;

    @media all and (max-width: 768px) {
        height: 400px;
    }
`;

const Slide = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(${(props) => props.$bgImage});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    align-items: center;
    opacity: ${(props) => (props.$active ? 1 : 0)};
    transition: opacity 0.5s ease-in-out;
    visibility: ${(props) => (props.$active ? "visible" : "hidden")};
`;

const SpotlightContent = styled.div`
    background: white;
    padding: 30px;
    max-width: 450px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    margin-top: 50px;
    margin-left: 20px;

    @media all and (max-width: 768px) {
        margin: 0;
        max-width: 90%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        align-items: center;
    }
`;

const SpotlightHeading = styled.h3`
    font-weight: 700;
    font-size: 36px;
    color: #0f172a;
    margin-bottom: 15px;
    line-height: 1.2;

    @media all and (max-width: 980px) {
        font-size: 28px;
    }
`;

const SpotlightDescription = styled.p`
    font-size: 16px;
    color: #334155;
    line-height: 1.5;
    margin-bottom: 25px;

    @media all and (max-width: 980px) {
        font-size: 14px;
    }
`;

const NavBtn = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${(props) => (props.direction === "left" ? "left: 20px;" : "right: 20px;")}
    width: 45px;
    height: 45px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    opacity: 0;
    transition: opacity 0.3s;

    ${CarouselContainer}:hover & {
        opacity: 0.8;
    }

    &:hover {
        opacity: 1 !important;
        background: #3b82f6;
    }

    @media all and (max-width: 768px) {
        width: 35px;
        height: 35px;
        font-size: 16px;
        ${(props) =>
            props.direction === "left" ? "left: 10px;" : "right: 10px;"}
        opacity: 0.6; /* Always visible on mobile */
    }
`;

const SpotlightButton = styled(Link)`
    padding: 15px 20px;
    background: #3b82f6;
    max-width: 240px;
    text-align: center;
    border-radius: 8px;
    color: #ffffff;
    font-weight: 500;
    font-family: "Inter", sans-serif;
    font-size: 14px;
    text-decoration: none;

    @media all and (max-width: 980px) {
        padding: 14px 15px;
    }
`;

const CourseDetails = styled.div`
    background: #f8fafc;
    padding: 40px 0;
    width: 100%;
    margin-bottom: 70px;

    @media all and (max-width: 680px) {
        padding: 30px 0;
    }
`;

const CourseUl = styled.ul`
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;

    @media all and (max-width: 980px) {
        gap: 20px;
    }
    @media all and (max-width: 680px) {
        flex-wrap: wrap;
    }
    @media all and (max-width: 360px) {
        justify-content: center;
        row-gap: 30px;
    }
`;

const CourseLi = styled.li`
    flex: 1;
    text-align: center;
    border-right: 4px solid #e2e8f0;
    &:last-child {
        border: 0;
    }

    @media all and (max-width: 680px) {
        border: 0;
        flex: 1 0 45%;
        margin-bottom: 20px;
    }
    @media all and (max-width: 360px) {
        flex: 1 0 100%;
    }
`;

const CourseHeading = styled.h1`
    font-size: 32px;
    font-weight: 600;
    line-height: 130%;
    color: #0f172a;
    margin: 0 0 5px 0;

    @media all and (max-width: 1080px) {
        font-size: 30px;
    }
    @media all and (max-width: 980px) {
        font-size: 28px;
    }
`;

const CourseDetail = styled.p`
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    color: #0f172a;
    margin: 0;

    @media all and (max-width: 980px) {
        font-size: 12px;
    }
`;

const CourseCategories = styled.div`
    margin: 0 0 60px 0;
`;

const CategorieTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
`;

const CategorieBottom = styled.div``;

const CatogeryHeading = styled.h3`
    font-weight: 600;
    font-size: 24px;
    line-height: 140%;
    color: #0f172a;
`;

const CategorySeeAll = styled.span`
    font-family: Inter;
    font-weight: 500;
    font-size: 14px;
    line-height: 160%;
    color: #3b82f6;
    cursor: pointer;
    text-decoration: none;
`;

const CatogoryUl = styled.ul`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    row-gap: 30px;
    list-style: none;
    padding: 0;

    @media all and (max-width: 360px) {
        justify-content: center;
    }
`;

const CategoryLi = styled.li`
    width: 23%;
    min-width: 200px;
    height: 224px;
    border: 1px solid #e2e8f0;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background: white;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }

    @media all and (max-width: 980px) {
        width: 48%;
    }
    @media all and (max-width: 480px) {
        width: 100%;
    }
`;

const CatogoryImgDiv = styled.div`
    width: 100px;
    height: 100px;
    background: #e0f2fe;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
`;

const CatogoryImg = styled.img`
    width: 50px;
    height: 50px;
    object-fit: cover; /* Changed to cover for images, contain for icons */
`;

const CategoryHeading = styled.h3`
    margin-bottom: 5px;
    font-size: 1.1rem;
    color: #0f172a;
`;

const CategoryDetail = styled.p`
    color: #64748b;
    font-size: 0.9rem;
`;

const TopProductContainer = styled.div`
    margin-bottom: 60px;
`;

const ProductBottom = styled.div``;

const ProductUl = styled.ul`
    display: flex;
    justify-content: space-between;
    row-gap: 30px;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;

    @media all and (max-width: 480px) {
        justify-content: center;
    }
`;

const ProductLi = styled.li`
    width: 23%;
    min-width: 250px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 10px 10px 8px 0px #0001021f;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    background: white;

    a {
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 18px 25px;
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0px 5px 15px 0px #3b82f633;
    }

    @media all and (max-width: 980px) {
        width: 48%;
    }
    @media all and (max-width: 580px) {
        width: 100%;
    }
`;

const ProdcutImageDiv = styled.div`
    width: 100%;
    height: 180px;
    margin-bottom: 15px;
    border-radius: 8px;
    overflow: hidden;
`;

const ProductImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const ProductName = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 18px;
    line-height: 1.4;
    margin-bottom: 5px;
    color: #0f172a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ProductCatogery = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 10px;
    color: #64748b;
`;

const ProductRatingWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #0f172a;
    font-weight: 600;
    margin-bottom: 10px;
`;

const ProductPrice = styled.p`
    font-family: Inter;
    font-weight: 700;
    font-size: 20px;
    color: #0f172a;
    margin-top: auto;
`;

const TopSellerContainer = styled.div`
    margin-top: 50px;
    margin-bottom: 50px;
`;

const TopSellerBottom = styled.div``;

const SellerUlContainer = styled.ul`
    display: flex;
    row-gap: 30px;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    padding: 0;

    @media all and (max-width: 480px) {
        justify-content: center;
    }
`;

const SellerLiContainer = styled.li`
    width: 18%;
    min-width: 200px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    padding: 16px;
    text-align: center;
    background: white;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }

    @media all and (max-width: 1280px) {
        width: 23%;
    }
    @media all and (max-width: 980px) {
        width: 31%;
    }
    @media all and (max-width: 680px) {
        width: 48%;
    }
    @media all and (max-width: 480px) {
        width: 100%;
    }
`;

const SellerLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const SellerImg = styled.img`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin: 0 auto 15px;
`;

const SellerName = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 18px;
    color: #0f172a;
    margin-bottom: 5px;
`;

const SellerCategoryL = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 15px;
`;

const SellerDetails = styled.div`
    display: flex;
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
`;

const SellerRating = styled.span`
    font-family: Inter;
    font-weight: 600;
    font-size: 14px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 5px;
`;

const StarIconSeller = styled.img`
    width: 16px;
    height: 16px;
`;

const SellerProducts = styled.span`
    font-family: Inter;
    font-weight: 600;
    font-size: 12px;
    color: #64748b;
`;

const ProductPriceBox = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
`;

const ProductOrigPrice = styled.span`
    font-size: 0.8rem;
    color: #94a3b8;
    text-decoration: line-through;
`;
