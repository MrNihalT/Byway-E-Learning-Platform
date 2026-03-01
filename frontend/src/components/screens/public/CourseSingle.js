import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import styled from "styled-components";
import { Link as ScrollLink } from "react-scroll";
import { UserContext } from "../../includes/UserProvider";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import ReviewForm from "../students/ReviewForm";
import FaceBook from "../../assets/images/facebook.png";
import Twitter from "../../assets/images/twitter.png";
import star from "../../assets/icons/star.svg";
import wstar from "../../assets/icons/white star.svg";
import whatsappIcon from "../../assets/icons/whatsapp.png";
import linkIcon from "../../assets/icons/link.svg";

const calculateRating = (reviews) => {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0, percentages: [0, 0, 0, 0, 0] };
    }
    const totalRating = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const average = totalRating / reviews.length;
    const count = reviews.length;
    const percentages = [0, 0, 0, 0, 0];
    reviews.forEach((rev) => {
        if (rev.rating >= 1 && rev.rating <= 5) {
            percentages[rev.rating - 1] += 1;
        }
    });
    const starPercentages = percentages.map((p) =>
        Math.round((p / count) * 100),
    );
    return { average: average.toFixed(1), count, percentages: starPercentages };
};

const CourseSection = ({ section, index, isEnrolled, courseId }) => {
    const [isOpen, setIsOpen] = useState(index === 0);
    const navigate = useNavigate();

    const handleContentClick = (contentId) => {
        if (isEnrolled) {
            navigate(`/learning/${courseId}?content=${contentId}`);
        }
    };

    return (
        <AccordionContainer>
            <SectionHeader onClick={() => setIsOpen(!isOpen)}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <BookIconContainer>
                        <BookIcon />
                    </BookIconContainer>
                    <SectionTitleText>{section.title}</SectionTitleText>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <LectureCount>
                        {section.contents.length} lectures
                    </LectureCount>
                    <i
                        className={`fa-solid ${
                            isOpen ? "fa-angle-up" : "fa-angle-down"
                        }`}
                        style={{ fontSize: "14px", color: "#64748b" }}
                    />
                </div>
            </SectionHeader>

            {isOpen && (
                <SectionBody>
                    {section.contents.map((content) => (
                        <ContentItem
                            key={content.id}
                            onClick={() => handleContentClick(content.id)}
                            isEnrolled={isEnrolled}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <IconContainer>
                                    {content.youtube_url ? (
                                        <YoutubeIcon />
                                    ) : content.video_file ? (
                                        <VideoIcon />
                                    ) : content.pdf_file ? (
                                        <PdfIcon />
                                    ) : content.content_type === "quiz" ? (
                                        <QuizIcon />
                                    ) : content.content_type ===
                                      "assignment" ? (
                                        <AssignmentIcon />
                                    ) : (
                                        <VideoIcon />
                                    )}
                                </IconContainer>

                                <ContentTitle>{content.title}</ContentTitle>
                            </div>

                            <div>
                                {content.is_completed ? (
                                    <i
                                        className="fa-solid fa-circle-check"
                                        style={{ color: "#16a34a" }}
                                    />
                                ) : (
                                    <ContentTypeLabel>
                                        {content.content_type}
                                    </ContentTypeLabel>
                                )}
                            </div>
                        </ContentItem>
                    ))}
                    {section.contents.length === 0 && (
                        <EmptyContent>No content added yet.</EmptyContent>
                    )}
                </SectionBody>
            )}
        </AccordionContainer>
    );
};

export default function CourseSingle() {
    const { id } = useParams();
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [ratingInfo, setRatingInfo] = useState({
        average: 0,
        count: 0,
        percentages: [0, 0, 0, 0, 0],
    });
    const [completedLectures, setCompletedLectures] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [activeButton, setActiveButton] = useState("description");

    const [isCopied, setIsCopied] = useState(false);
    const currentUrl = window.location.href;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const courseRes = await api.get(`course/courses/${id}/`);
                const courseData = courseRes.data;
                setCourse(courseData);
                api.get("course/courses/")
                    .then((res) => {
                        const realted = res.data.results || res.data;
                        if (Array.isArray(realted)) {
                            setRelatedCourses(
                                realted.filter((c) => c.id !== parseInt(id)),
                            );
                        }
                    })
                    .catch(console.warn);

                api.get(`course/courses/${id}/reviews/`)
                    .then((res) => {
                        setReviews(res.data);
                        setRatingInfo(calculateRating(res.data));
                    })
                    .catch(() => setReviews([]));

                if (courseData.sections) {
                    const completedIds = new Set();
                    courseData.sections.forEach((section) => {
                        section.contents.forEach((lecture) => {
                            if (lecture.is_completed) {
                                completedIds.add(lecture.id);
                            }
                        });
                    });
                    setCompletedLectures(completedIds);
                }
            } catch (err) {
                console.error("Critical Error:", err);
                setError("Could not load course. It may not exist.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddToCart = async () => {
        if (!userData) {
            toast.error("Please log in to add items to your cart.");
            navigate("/login");
            return;
        }
        try {
            await api.post("course/cart/", { course_id: id });
            toast.success("Course added to cart!");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to add to cart.",
            );
        }
    };

    const handleAddToWishlist = async () => {
        if (!userData) {
            toast.error("Please log in to add items to your wishlist.");
            navigate("/login");
            return;
        }
        try {
            await api.post("course/wishlist/", { course_id: id });
            toast.success("Course added to wishlist!");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to add to wishlist.",
            );
        }
    };

    const handleBuyNow = async () => {
        if (!userData) {
            toast.error("Please log in to purchase a course.");
            navigate("/login");
            return;
        }
        try {
            const response = await api.post("course/create-razorpay-order/", {
                course_id: id,
            });
            const { order_id, key_id, amount, course_title } = response.data;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Byway Learning",
                description: course_title,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        await api.post("course/verify-razorpay-payment/", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success("Payment successful! Course Enrolled.");
                        window.location.reload();
                    } catch (verifyErr) {
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: userData.username,
                    email: userData.email,
                },
                theme: { color: "#3399cc" },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(
                err.response?.data?.error || "Could not start payment.",
            );
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            const response = await api.get(
                `course/courses/${id}/certificate/`,
                { responseType: "blob" },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Certificate_${course.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            toast.error(
                err.response?.data?.error || "Could not download certificate.",
            );
        }
    };

    if (isLoading)
        return (
            <>
                <Header />
                <LoadingWrapper>Loading...</LoadingWrapper>
                <Footer />
            </>
        );
    if (error)
        return (
            <>
                <Header />
                <LoadingWrapper>{error}</LoadingWrapper>
                <Footer />
            </>
        );
    if (!course)
        return (
            <>
                <Header />
                <LoadingWrapper>Course not found.</LoadingWrapper>
                <Footer />
            </>
        );

    const originalPrice = parseFloat(course.price);
    const offer = course.offer_percentage / 100;
    const discountedPrice = (originalPrice * (1 - offer)).toFixed(2);

    const totalLectures = course.sections
        ? course.sections.reduce((acc, sec) => acc + sec.contents.length, 0)
        : 0;
    const progressPercent =
        totalLectures > 0
            ? Math.round((completedLectures.size / totalLectures) * 100)
            : 0;

    const refreshReviews = () => {
        api.get(`course/courses/${id}/reviews/`)
            .then((res) => {
                setReviews(res.data);
                setRatingInfo(calculateRating(res.data));
            })
            .catch(console.error);
    };

    return (
        <>
            <Header />

            <SectionProduct>
                <Wrapper className="wrapper">
                    <ProductLeft>
                        <ProductPath>
                            <PathUl>
                                <PathLi>
                                    <LiLink to="/">
                                        <Path>Home</Path>
                                        <RightIcon
                                            src={
                                                require("../../assets/icons/Vector.svg")
                                                    .default
                                            }
                                        />
                                    </LiLink>
                                </PathLi>
                                <PathLi>
                                    <LiLink to="/">
                                        <Path>
                                            {course.category?.name || "Courses"}
                                        </Path>
                                        <RightIcon
                                            src={
                                                require("../../assets/icons/Vector.svg")
                                                    .default
                                            }
                                        />
                                    </LiLink>
                                </PathLi>
                                <PathLi>
                                    <LiLink to={`/course/${course.id}`}>
                                        <Path>{course.title}</Path>
                                    </LiLink>
                                </PathLi>
                            </PathUl>
                        </ProductPath>
                        <ProductDetals>
                            <ProductNamee>{course.title}</ProductNamee>
                            <ProductDesc>
                                {course.short_description}
                            </ProductDesc>

                            <ProductRating>
                                <ProductRate>{ratingInfo.average}</ProductRate>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <ProductRateImg
                                        key={i}
                                        src={
                                            i < Math.round(ratingInfo.average)
                                                ? star
                                                : wstar
                                        }
                                    />
                                ))}
                                <ProductRateCount>
                                    ({ratingInfo.count} ratings)
                                </ProductRateCount>
                            </ProductRating>

                            <ProductSeller>
                                <ProductSellerImg
                                    src={course.instructor.profile_picture}
                                    alt={course.instructor.username}
                                />
                                <ProductSellerName>
                                    Created by {course.instructor.username}
                                </ProductSellerName>
                            </ProductSeller>
                        </ProductDetals>
                    </ProductLeft>

                    <ProductRight>
                        <ProductCard>
                            <ProductImg
                                src={course.course_image}
                                alt={course.title}
                            />
                            <ProductPriceSection>
                                <ProductPricee>
                                    ${discountedPrice}
                                </ProductPricee>
                                <ProductOriginalPrice>
                                    ${originalPrice.toFixed(2)}
                                </ProductOriginalPrice>
                                <ProductOffer>
                                    {course.offer_percentage}% Off
                                </ProductOffer>
                            </ProductPriceSection>

                            {course.is_enrolled ? (
                                <>
                                    <PurchasedButton
                                        as={Link}
                                        to={`/learning/${course.id}`}
                                    >
                                        Go to My Learning
                                    </PurchasedButton>
                                    {progressPercent === 100 && (
                                        <CertificateBox
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <p
                                                style={{
                                                    marginBottom: "10px",
                                                    fontSize: "14px",
                                                    color: "#155724",
                                                }}
                                            >
                                                🎉 Course Completed!
                                            </p>
                                            <DownloadCertBtn
                                                onClick={
                                                    handleDownloadCertificate
                                                }
                                            >
                                                Download Certificate
                                            </DownloadCertBtn>
                                        </CertificateBox>
                                    )}
                                    <DisabledMessage>
                                        You have already purchased this course
                                    </DisabledMessage>
                                </>
                            ) : (
                                <>
                                    <AddtoCartButton onClick={handleAddToCart}>
                                        Add To Cart
                                    </AddtoCartButton>
                                    <BuyNowButtton onClick={handleBuyNow}>
                                        Buy Now
                                    </BuyNowButtton>
                                </>
                            )}
                            <WishlistButton onClick={handleAddToWishlist}>
                                Add To Wishlist
                            </WishlistButton>

                            <CardBottom>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Share onClick={handleCopyLink}>
                                        Share Course{" "}
                                        <i
                                            className="fa-regular fa-copy"
                                            style={{ fontSize: "14px" }}
                                        ></i>
                                    </Share>
                                    {isCopied && (
                                        <span
                                            style={{
                                                color: "#16a34a",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                background: "#dcfce7",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            ✓ Link Copied!
                                        </span>
                                    )}
                                </div>

                                <SocialMedia>
                                    <SocialMediaLink
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                            currentUrl,
                                        )}`}
                                        target="_blank"
                                    >
                                        <SocialMediaImg
                                            src={FaceBook}
                                            alt="Facebook"
                                        />
                                    </SocialMediaLink>
                                    <SocialMediaLink
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                            currentUrl,
                                        )}`}
                                        target="_blank"
                                    >
                                        <SocialMediaImg
                                            src={Twitter}
                                            alt="Twitter"
                                        />
                                    </SocialMediaLink>
                                    <SocialMediaLink
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                            currentUrl,
                                        )}`}
                                        target="_blank"
                                    >
                                        <SocialMediaImg
                                            src={whatsappIcon}
                                            alt="WhatsApp"
                                        />
                                    </SocialMediaLink>
                                    <SocialMediaButton
                                        onClick={handleCopyLink}
                                        title="Copy Link"
                                    >
                                        <SocialMediaImg
                                            src={linkIcon}
                                            alt="Copy Link"
                                        />
                                    </SocialMediaButton>
                                </SocialMedia>
                            </CardBottom>
                        </ProductCard>
                    </ProductRight>
                </Wrapper>
            </SectionProduct>

            <ProductDescription>
                <Wrapperrr>
                    <ProductDescriptionTop>
                        <ProductTopUl>
                            {[
                                "description",
                                "content",
                                "seller",
                                "reviews",
                            ].map((tab) => (
                                <ProductTopLi key={tab}>
                                    <ButtonDescription
                                        onClick={() => setActiveButton(tab)}
                                        active={activeButton === tab}
                                        to={
                                            tab === "seller"
                                                ? "sell"
                                                : tab === "reviews"
                                                  ? "rev"
                                                  : tab === "description"
                                                    ? "desc"
                                                    : tab
                                        }
                                        spy={true}
                                        smooth={true}
                                        offset={-70}
                                        duration={500}
                                    >
                                        {tab === "seller"
                                            ? "Instructor"
                                            : tab === "content"
                                              ? "Course Content"
                                              : tab.charAt(0).toUpperCase() +
                                                tab.slice(1)}
                                    </ButtonDescription>
                                </ProductTopLi>
                            ))}
                        </ProductTopUl>
                    </ProductDescriptionTop>

                    <ProductDescriptionBottom>
                        <ProductDescriptionArea id="desc">
                            <DescriptinHeading>
                                Course Description
                            </DescriptinHeading>
                            <ProductDescriptionText
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {course.description}
                            </ProductDescriptionText>
                        </ProductDescriptionArea>

                        <ProductDescriptionArea id="content">
                            <DescriptinHeading>
                                Course Content
                            </DescriptinHeading>
                            <ContentWrapper>
                                {course.sections &&
                                course.sections.length > 0 ? (
                                    course.sections.map((section, index) => (
                                        <CourseSection
                                            key={section.id}
                                            section={section}
                                            index={index}
                                            isEnrolled={course.is_enrolled}
                                            courseId={course.id}
                                        />
                                    ))
                                ) : (
                                    <p>No content available.</p>
                                )}
                            </ContentWrapper>
                        </ProductDescriptionArea>

                        <ProductSellerArea id="sell">
                            <SellerHeading>Instructor</SellerHeading>
                            <SellerType>
                                <SellerName>
                                    {course.instructor.username}
                                </SellerName>
                                <SellerCategory>
                                    {course.instructor.qualification ||
                                        "Expert"}
                                </SellerCategory>
                            </SellerType>
                            <SellerDetails>
                                <SellerImg
                                    src={course.instructor.profile_picture}
                                />
                                <SellerDetailsRight>
                                    <SellerDetailSpan>
                                        <SImg src={star} />
                                        <SText>
                                            {course.instructor.total_rating}{" "}
                                            Rating
                                        </SText>
                                    </SellerDetailSpan>
                                    <SellerDetailSpan>
                                        <SImg
                                            src={
                                                require("../../assets/icons/badge.svg")
                                                    .default
                                            }
                                        />
                                        <SText>
                                            {ratingInfo.count} Reviews
                                        </SText>
                                    </SellerDetailSpan>
                                    <SellerDetailSpan>
                                        <SImg
                                            src={
                                                require("../../assets/icons/play.svg")
                                                    .default
                                            }
                                        />
                                        <SText>
                                            {course.instructor.total_customers}{" "}
                                            Students
                                        </SText>
                                    </SellerDetailSpan>
                                </SellerDetailsRight>
                            </SellerDetails>
                            <SellerQuote>
                                {course.instructor.about_me}
                            </SellerQuote>
                        </ProductSellerArea>
                    </ProductDescriptionBottom>
                </Wrapperrr>
            </ProductDescription>

            <ReviewContainer id="rev">
                <Wrapperr className="wrapper">
                    <ReviewTop>
                        <ReviewHeading>Learner Reviews</ReviewHeading>
                    </ReviewTop>
                    <ReviewBottom>
                        <ReviewBottomLeft>
                            <RatingTop>
                                <RatingImg src={star} />
                                <TotalRating>{ratingInfo.average}</TotalRating>
                                <TotalReviews>
                                    {ratingInfo.count} reviews
                                </TotalReviews>
                            </RatingTop>
                            <RatingBottom>
                                {ratingInfo.percentages
                                    .map((percent, index) => (
                                        <RatingSection key={index}>
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <StartImg
                                                        key={i}
                                                        src={
                                                            i < 5 - index
                                                                ? star
                                                                : wstar
                                                        }
                                                    />
                                                ),
                                            )}
                                            <StartPercentage>
                                                {percent}%
                                            </StartPercentage>
                                        </RatingSection>
                                    ))
                                    .reverse()}
                            </RatingBottom>
                        </ReviewBottomLeft>
                        <ReviewBottomRight>
                            <ReviewsSection>
                                {reviews.length > 0 ? (
                                    reviews
                                        .slice(
                                            0,
                                            showAllReviews ? reviews.length : 2,
                                        )
                                        .map((rev) => (
                                            <ReviewCard key={rev.id}>
                                                <ReviewCardLeft>
                                                    <Link
                                                        to={`/student/${rev.student.id}`}
                                                        style={{
                                                            textDecoration:
                                                                "none",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "12px",
                                                        }}
                                                    >
                                                        <ReviewerImg
                                                            src={
                                                                rev.student
                                                                    .profile_picture ||
                                                                "https://via.placeholder.com/60"
                                                            }
                                                            alt={
                                                                rev.student
                                                                    .username
                                                            }
                                                        />
                                                        <ReviewerName>
                                                            {
                                                                rev.student
                                                                    .username
                                                            }
                                                        </ReviewerName>
                                                    </Link>
                                                </ReviewCardLeft>
                                                <ReviewCardRight>
                                                    <ReviewCardRightTop>
                                                        {Array.from({
                                                            length: 5,
                                                        }).map((_, i) => (
                                                            <ReviewerStarImg
                                                                key={i}
                                                                src={
                                                                    i <
                                                                    rev.rating
                                                                        ? star
                                                                        : wstar
                                                                }
                                                            />
                                                        ))}
                                                        <ReviewerRating>
                                                            {rev.rating}
                                                        </ReviewerRating>
                                                        <ReviewedDate>
                                                            {new Date(
                                                                rev.created_at,
                                                            ).toLocaleDateString()}
                                                        </ReviewedDate>
                                                    </ReviewCardRightTop>
                                                    <ReviewCardRightBottom>
                                                        <ReviewDescription>
                                                            {rev.comment}
                                                        </ReviewDescription>
                                                    </ReviewCardRightBottom>
                                                </ReviewCardRight>
                                            </ReviewCard>
                                        ))
                                ) : (
                                    <p>No reviews yet.</p>
                                )}
                                {reviews.length > 2 && (
                                    <ViewMoreButton
                                        onClick={() =>
                                            setShowAllReviews(!showAllReviews)
                                        }
                                    >
                                        {showAllReviews
                                            ? "View less Reviews"
                                            : "View more Reviews"}
                                    </ViewMoreButton>
                                )}
                            </ReviewsSection>
                        </ReviewBottomRight>
                    </ReviewBottom>
                </Wrapperr>
            </ReviewContainer>
            <ReviewForm onReviewAdded={refreshReviews} courseId={id} />
            <TopProductContainer id="products">
                <Wrapperr className="wrapper">
                    <CategorieTop>
                        <CatogeryHeading>
                            More Courses Like This
                        </CatogeryHeading>
                    </CategorieTop>
                    <ProductBottom>
                        <ProductUl>
                            {relatedCourses.slice(0, 4).map((prdt) => (
                                <ProductLi key={prdt.id}>
                                    <Link to={`/course/${prdt.id}`}>
                                        <ProdcutImageDiv>
                                            <ProductImage
                                                src={prdt.course_image}
                                                alt={prdt.title}
                                            />
                                        </ProdcutImageDiv>
                                        <ProductName>{prdt.title}</ProductName>
                                        <ProductCatogery>
                                            {prdt.category.name}
                                        </ProductCatogery>
                                        <ProductPrice>
                                            ${prdt.price}
                                        </ProductPrice>
                                    </Link>
                                </ProductLi>
                            ))}
                        </ProductUl>
                    </ProductBottom>
                </Wrapperr>
            </TopProductContainer>

            <Footer />
        </>
    );
}

const ContentWrapper = styled.div`
    margin-top: 20px;
`;

const Wrapperrr = styled.div`
    width: 90%;
    margin: 0 auto;
`;

const LoadingWrapper = styled.div`
    padding: 100px;
    text-align: center;
    font-size: 24px;
`;

const AccordionContainer = styled.div`
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    margin-bottom: 15px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
    background: #f8fafc;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #e2e8f0;

    &:hover {
        background: #f1f5f9;
    }
`;

const SectionTitleText = styled.span`
    font-weight: 600;
    color: #1e293b;
    font-size: 1rem;
`;

const LectureCount = styled.span`
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
`;

const SectionBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const ContentItem = styled.div`
    padding: 12px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
    cursor: ${(props) => (props.isEnrolled ? "pointer" : "default")};

    &:hover {
        background-color: ${(props) =>
            props.isEnrolled ? "#f8fafc" : "transparent"};
        transform: ${(props) =>
            props.isEnrolled ? "translateX(4px)" : "none"};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const ContentTitle = styled.span`
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
`;

const ContentTypeLabel = styled.span`
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: capitalize;
    font-weight: 500;
`;

const EmptyContent = styled.div`
    padding: 20px;
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
`;

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    width: 20px;
    height: 20px;

    svg {
        width: 18px;
        height: 18px;
    }
`;

const BookIconContainer = styled.div`
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;

    svg {
        width: 18px;
        height: 18px;
    }
`;

// Icons (SVG)
const VideoIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
    </svg>
);

const YoutubeIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
);

const PdfIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
    </svg>
);

const QuizIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const AssignmentIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    </svg>
);

const BookIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
    </svg>
);
const SectionProduct = styled.section`
    background: #f8fafc;
    padding: 40px 0;
    @media all and (max-width: 1280px) {
        height: auto;
    }
`;
const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    @media all and (max-width: 980px) {
        flex-direction: column-reverse;
        align-items: center;
    }
`;
const ProductLeft = styled.div`
    flex: 2;
    padding-right: 30px;
    @media all and (max-width: 980px) {
        width: 100%;
        padding-right: 0;
    }
`;
const ProductPath = styled.div`
    height: 24px;
    margin-bottom: 40px;
    @media all and (max-width: 680px) {
        margin-top: 20px;
    }
`;
const PathUl = styled.ul`
    display: flex;
    gap: 8px;
    align-items: center;
    list-style: none;
    padding: 0;
`;
const PathLi = styled.li``;
const LiLink = styled(Link)`
    display: flex;
    align-items: center;
    text-decoration: none;
`;
const Path = styled.span`
    margin-right: 15px;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    color: #334155;
`;
const RightIcon = styled.img`
    margin-right: 15px;
    width: 4px;
    height: 8px;
`;
const ProductDetals = styled.div`
    @media all and (max-width: 680px) {
        margin-top: 20px;
    }
`;
const ProductNamee = styled.h3`
    font-weight: 700;
    font-size: 40px;
    line-height: 140%;
    color: #0f172a;
    margin-bottom: 10px;
    @media all and (max-width: 980px) {
        font-size: 36px;
    }
    @media all and (max-width: 680px) {
        font-size: 34px;
    }
`;
const ProductDesc = styled.p`
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    color: #334155;
    max-width: 700px;
    margin-bottom: 15px;
`;
const ProductRating = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
    margin-bottom: 20px;
`;
const ProductRate = styled.p`
    font-weight: 500;
    font-size: 16px;
    line-height: 120%;
    color: #fec84b;
    align-self: end;
`;
const ProductRateImg = styled.img`
    width: 15px;
    height: 15px;
`;
const ProductRateCount = styled.p`
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    color: #334155;
`;
const ProductSeller = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;
const ProductSellerImg = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
`;
const ProductSellerName = styled.p`
    font-weight: 500;
`;
const ProductRight = styled.div`
    flex: 1;
    max-width: 400px;
    @media all and (max-width: 980px) {
        width: 100%;
        max-width: 400px;
        margin-bottom: 30px;
    }
`;
const ProductCard = styled.div`
    padding: 24px 22px;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    width: 100%;
    @media all and (max-width: 980px) {
        position: relative;
        right: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 350px;
        margin: 0 auto;
    }
`;
const ProductImg = styled.img`
    width: 100%;
    height: 200px;
    border-radius: 8px;
    object-fit: cover;
`;
const ProductPriceSection = styled.div`
    display: flex;
    margin-top: 20px;
    gap: 15px;
    align-items: center;
`;
const ProductPricee = styled.h3`
    font-weight: 600;
    font-size: 24px;
    line-height: 140%;
    color: #0f172a;
`;
const ProductOriginalPrice = styled.h4`
    font-weight: 600;
    font-size: 18px;
    line-height: 160%;
    color: #94a3b8;
    text-decoration: line-through;
`;
const ProductOffer = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    color: #16a34a;
`;
const AddtoCartButton = styled.button`
    margin-top: 20px;
    display: block;
    width: 100%;
    height: 48px;
    border-radius: 8px;
    gap: 6px;
    padding: 10px 24px;
    background: #020617;
    color: #ffffff;
    font-weight: 500;
    font-size: 14px;
    line-height: 160%;
    margin-bottom: 20px;
    cursor: pointer;
    border: none;
`;
const BuyNowButtton = styled.button`
    width: 100%;
    height: 48px;
    border-radius: 8px;
    border-width: 1px;
    gap: 6px;
    padding: 10px 24px;
    background: #ffffff;
    color: #0f172a;
    font-family: Inter;
    font-weight: 500;
    border: 1px solid #020617;
    font-size: 14px;
    line-height: 160%;
    margin-bottom: 10px;
    cursor: pointer;
`;
const WishlistButton = styled(BuyNowButtton)`
    margin-bottom: 20px;
`;
const CardBottom = styled.div`
    border-top: 1px solid #e2e8f0;
    padding: 24px;
    @media all and (max-width: 420px) {
        width: 100%;
    }
`;
const Share = styled.h3`
    font-weight: 600;
    font-size: 16px;
    line-height: 160%;
    color: #0f172a;
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
        color: #2563eb;
    }
`;
const SocialMedia = styled.div`
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    @media all and (max-width: 680px) {
        gap: 25px;
    }
    @media all and (max-width: 420px) {
        gap: 10px;
    }
`;
const SocialMediaLink = styled.a`
    background: #ffffff;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    border: 1px solid #e2e8f0;
    @media all and (max-width: 420px) {
        width: 40px;
        height: 40px;
    }
`;
const SocialMediaButton = styled.button`
    background: #ffffff;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    @media all and (max-width: 420px) {
        width: 40px;
        height: 40px;
    }
`;
const SocialMediaImg = styled.img`
    width: 28px;
    height: 28px;
    @media all and (max-width: 420px) {
        width: 25px;
        height: 25px;
    }
`;
const ProductDescription = styled.section`
    background: #ffffff;
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    @media all and (min-width: 981px) {
        width: 65%;
        margin-left: calc((100% - 1200px) / 2 + 20px);
        padding-right: 30px;
    }
    @media (max-width: 980px) {
        width: 100%;
        margin: 0 auto;
    }
`;
const ProductDescriptionTop = styled.div`
    padding: 40px 0 40px 0;
    border-bottom: 1px solid #e2e8f0;
    width: 100%;
`;
const ProductTopUl = styled.ul`
    display: flex;
    gap: 24px;
    list-style: none;
    padding: 0;
    flex-wrap: wrap;
    @media all and (max-width: 680px) {
        gap: 10px;
    }
`;
const ProductTopLi = styled.li`
    display: flex;
    flex-grow: 1;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    height: 57px;
    text-align: center;
    &:last-child {
        margin-right: 0;
    }
`;
const ButtonDescription = styled(ScrollLink)`
    width: 100%;
    cursor: pointer;
    padding: 18px 21px;
    background-color: ${(props) => (props.active ? "#EFF6FF" : "transparent")};
    color: ${(props) => (props.active ? "#2563EB" : "#334155")};
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    @media all and (max-width: 420px) {
        font-size: 14px;
        padding: 8px 15px;
    }
    @media all and (max-width: 360px) {
        font-size: 12px;
        padding: 5px 10px;
    }
`;
const ProductDescriptionBottom = styled.div`
    padding: 25px 0;
    width: 100%;
`;
const Wrapperr = styled.div`
    width: 100%;
`;
const ProductDescriptionArea = styled.div`
    border-bottom: 1px solid #e2e8f0;
    width: 100%;
    padding: 25px 0;
    &:first-child {
        padding-top: 0;
    }
    &:last-child {
        border-bottom: none;
    }
`;
const DescriptinHeading = styled.h3`
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    color: #0f172a;
    margin-bottom: 15px;
`;
const ProductDescriptionText = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    color: #334155;
`;
const ProductSellerArea = styled.div`
    padding: 25px 0;
    border-bottom: 1px solid #e2e8f0;
`;
const SellerHeading = styled.h3`
    margin-bottom: 25px;
    font-weight: 600;
    font-size: 20px;
`;
const SellerType = styled.div``;
const SellerName = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 20px;
    color: #2563eb;
`;
const SellerCategory = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    color: #334155;
`;
const SellerDetails = styled.div`
    display: flex;
    margin-top: 20px;
    gap: 20px;
    align-items: center;
`;
const SellerImg = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
`;
const SellerDetailsRight = styled.div`
    gap: 5px;
    display: flex;
    flex-direction: column;
`;
const SellerDetailSpan = styled.span`
    display: flex;
    align-items: center;
    gap: 5px;
`;
const SImg = styled.img`
    width: 24px;
    height: 24px;
`;
const SText = styled.span`
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    color: #0f172a;
`;
const SellerQuote = styled.p`
    margin-top: 20px;
    font-family: Inter;
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    color: #334155;
`;
const ReviewContainer = styled.section`
    background: #ffffff;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    @media all and (min-width: 981px) {
        width: 65%;
        margin-left: calc((100% - 1200px) / 2 + 20px);
        padding-right: 30px;
    }
    @media (max-width: 980px) {
        width: 100%;
        margin: 0 auto;
    }
`;
const ReviewTop = styled.div`
    margin-bottom: 10px;
`;
const ReviewHeading = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    color: #0f172a;
`;
const ReviewBottom = styled.div`
    display: flex;
    justify-content: flex-start;
    @media all and (max-width: 980px) {
        justify-content: space-between;
    }
    @media all and (max-width: 680px) {
        flex-direction: column;
        gap: 30px;
        align-items: center;
    }
`;
const ReviewBottomLeft = styled.div`
    width: 33%;
    @media all and (max-width: 680px) {
        width: 100%;
    }
`;
const RatingTop = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;
const RatingImg = styled.img`
    width: 20px;
    height: 20px;
`;
const TotalRating = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 20px;
    line-height: 140%;
    color: #0f172a;
    margin-right: 3px;
`;
const TotalReviews = styled.p`
    font-family: Inter;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #334155;
`;
const RatingBottom = styled.div`
    margin-top: 12px;
`;
const RatingSection = styled.div`
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
    @media all and (max-width: 680px) {
        gap: 5px;
    }
    &:last-child {
        margin-bottom: 0;
    }
`;
const StartImg = styled.img`
    width: 20px;
    height: 20px;
`;
const StartPercentage = styled.p`
    margin-left: 5px;
`;
const ReviewBottomRight = styled.div`
    width: 67%;
    padding-left: 20px;
    @media all and (max-width: 680px) {
        width: 100%;
        padding-left: 0;
    }
`;
const ReviewsSection = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 20px;
`;
const ReviewCard = styled.div`
    justify-content: flex-start;
    border: 1px solid #e2e8f0;
    padding: 25px;
    border-radius: 16px;
    display: flex;
    gap: 15%;
    @media all and (max-width: 1280px) {
        height: auto;
    }
    @media all and (max-width: 980px) {
        gap: 7%;
    }
    @media all and (max-width: 420px) {
        flex-wrap: wrap;
    }
`;
const ReviewCardLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    align-self: baseline;
`;
const ReviewerImg = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
`;
const ReviewerName = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 18px;
    line-height: 160%;
    color: #0f172a;
`;
const ReviewCardRight = styled.div`
    flex: 1;
`;
const ReviewCardRightTop = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    flex-wrap: wrap;
`;
const ReviewerStarImg = styled.img`
    width: 20px;
    height: 20px;
    margin-right: 5px;
`;
const ReviewerRating = styled.p`
    font-family: Inter;
    font-weight: 600;
    font-size: 18px;
    line-height: 160%;
    color: #0f172a;
    margin-right: 30px;
`;
const ReviewedDate = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    text-align: right;
    color: #334155;
    @media all and (max-width: 980px) {
        font-size: 12px;
    }
`;
const ReviewCardRightBottom = styled.div``;
const ReviewDescription = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 16px;
    line-height: 160%;
    color: #334155;
    max-width: 800px;
    @media all and (max-width: 980px) {
        font-size: 14px;
        line-height: 130%;
    }
`;
const ViewMoreButton = styled.button`
    width: 185px;
    height: 48px;
    border-radius: 8px;
    border-width: 1px;
    padding: 10px 24px;
    border: 1px solid #0f172a;
    font-family: Inter;
    font-weight: 500;
    font-size: 14px;
    line-height: 160%;
    color: #0f172a;
    background: #ffffff;
    cursor: pointer;
`;
const CategorieTop = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
`;
const CatogeryHeading = styled.h3`
    font-weight: 600;
    font-size: 24px;
    line-height: 140%;
    color: #0f172a;
`;
const TopProductContainer = styled.div`
    padding: 115px 0;
`;
const ProductBottom = styled.div``;
const ProductUl = styled.ul`
    display: flex;
    justify-content: space-between;
    row-gap: 30px;
    flex-wrap: wrap;
    transition: all 1s ease-in-out;
    opacity: 1;
    transform: translateY(0);
    list-style: none;
    padding: 0;
    @media all and (max-width: 480px) {
        justify-content: center;
    }
`;
const ProductLi = styled.li`
    max-width: 350px;
    width: 23%;
    gap: 8px;
    border-radius: 16px;
    border-width: 1px;
    padding: 18px 25px;
    border: 1px solid #e2e8f0;
    box-shadow: 0px 0px 8px 0px #3b82f61f;
    display: flex;
    flex-direction: column;
    @media all and (max-width: 980px) {
        max-width: 350px;
        width: 40%;
    }
    @media all and (max-width: 680px) {
        max-width: 400px;
        width: 44%;
    }
    @media all and (max-width: 480px) {
        align-items: center;
        text-align: center;
        width: 80%;
    }
`;
const ProdcutImageDiv = styled.div`
    display: flex;
    justify-content: center;
`;
const ProductImage = styled.img`
    width: 110px;
    height: 110px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 20px;
    @media all and (max-width: 680px) {
        width: 130px;
        height: 130px;
    }
`;
const ProductName = styled.h3`
    font-family: Inter;
    font-weight: 600;
    font-size: 18px;
    line-height: 160%;
    margin-bottom: 2px;
    color: #0f172a;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    @media all and (max-width: 680px) {
        font-size: 16px;
    }
`;
const ProductCatogery = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-size: 14px;
    line-height: 150%;
    margin-bottom: 3px;
    color: #334155;
`;
const ProductPrice = styled.p`
    font-family: Inter;
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    color: #0f172a;
`;
const PurchasedButton = styled.button`
    width: 100%;
    height: 48px;
    border-radius: 8px;
    border: none;
    gap: 6px;
    padding: 10px 24px;
    background: #28a745;
    color: #ffffff;
    font-family: Inter;
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 10px;
    margin-top: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    &:hover {
        background: #218838;
    }
`;
const DisabledMessage = styled.p`
    text-align: center;
    color: #6c757d;
    font-size: 14px;
    margin-bottom: 20px;
    font-style: italic;
`;
const CertificateBox = styled(motion.div)`
    background: #f0fdf4;
    border: 1px solid #22c55e;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 20px;
`;
const DownloadCertBtn = styled.button`
    background-color: #15803d;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: #166534;
    }
`;
