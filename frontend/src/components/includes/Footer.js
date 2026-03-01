import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import api from "../../api";
import { UserContext } from "./UserProvider";
import { toast } from "react-toastify";

// Assets
import LogoSvg from "../assets/icons/logo.svg";
import FaceBook from "../assets/images/facebook.png";
import GitHub from "../assets/images/github.png";
import Google from "../assets/images/google.png";
import Twitter from "../assets/images/twitter.png";
import Microsoft from "../assets/images/microsoft.png";

export default function Footer() {
    const { userData } = useContext(UserContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!userData) {
            toast.error("Please log in to leave a review.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("course/platform/reviews/create/", {
                rating: parseInt(rating),
                comment: comment,
            });
            toast.success("Thank you for your review!");
            setIsModalOpen(false);
            setComment("");
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.error || "Failed to submit review.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <FooterContainer>
                <Wrapper className="wrapper">
                    <FooterUl>
                        <FooterLi>
                            <LogoLink to="/">
                                <LogoImg src={LogoSvg} />
                                <LogoName>Byway</LogoName>
                            </LogoLink>
                            <BywayDescription>
                                Empowering learners through accessible and
                                engaging online education.
                            </BywayDescription>
                        </FooterLi>

                        <FooterLi>
                            <Heading>Get Help</Heading>
                            <LiItems href="/support">Contact Us</LiItems>
                            <LiItems href="/courses">Latest Course</LiItems>
                            <LiItems href="/become-instructor">
                                Become Instructor
                            </LiItems>
                            <LiItems href="/privacy-policy">
                                Privacy Policy
                            </LiItems>
                        </FooterLi>

                        <FooterLi>
                            <Heading>Community</Heading>
                            <ReviewButton onClick={() => setIsModalOpen(true)}>
                                Leave a Review
                            </ReviewButton>
                            <LiItems href="/instructors">Instructors</LiItems>
                            <LiItems href="/community">Community</LiItems>
                        </FooterLi>

                        <FooterLi>
                            <Heading>Contact Us</Heading>
                            <AddressItem>
                                Address: Q364+GVP, Kappumchal, Kerala 670645,
                                India
                            </AddressItem>
                            <LiItems href="tel:+9104935298028">
                                Tel: +91 04935 298 028
                            </LiItems>
                            <LiItems href="mailto:nihal.chiyoor@gmail.com">
                                Mail: nihal.chiyoor@gmail.com
                            </LiItems>

                            <SocialMedia>
                                <SocialMediaLink href="https://www.facebook.com/nihal.t.127">
                                    <SocialMediaImg src={FaceBook} />
                                </SocialMediaLink>
                                <SocialMediaLink href="https://github.com/MrNihalT">
                                    <SocialMediaImg src={GitHub} />
                                </SocialMediaLink>
                                <SocialMediaLink href="https://www.google.com/search?q=nihal+t+webkul">
                                    <SocialMediaImg src={Google} />
                                </SocialMediaLink>
                            </SocialMedia>
                        </FooterLi>
                    </FooterUl>
                </Wrapper>
            </FooterContainer>

            {isModalOpen && (
                <ModalOverlay>
                    <ModalBox>
                        <CloseButton onClick={() => setIsModalOpen(false)}>
                            ×
                        </CloseButton>
                        <ModalTitle>Rate Your Experience</ModalTitle>
                        <form onSubmit={handleReviewSubmit}>
                            <FormGroup>
                                <Label>Rating</Label>
                                <Select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </Select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Comment</Label>
                                <TextArea
                                    rows="4"
                                    placeholder="Tell us what you think..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <SubmitButton disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Review"}
                            </SubmitButton>
                        </form>
                    </ModalBox>
                </ModalOverlay>
            )}
        </>
    );
}

const FooterContainer = styled.footer`
    background: #1e293b;
    padding: 60px 0;
`;
const Wrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
`;
const FooterUl = styled.ul`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 30px;
    padding: 0;
`;
const FooterLi = styled.li`
    display: flex;
    flex-direction: column;
    min-width: 200px;
`;
const LogoLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    margin-bottom: 15px;
`;
const LogoImg = styled.img``;
const LogoName = styled.h3`
    color: #fff;
    font-size: 24px;
`;
const BywayDescription = styled.p`
    color: #cbd5e1;
    font-size: 14px;
    line-height: 1.6;
    max-width: 300px;
`;
const Heading = styled.h3`
    color: #fff;
    margin-bottom: 20px;
    font-size: 18px;
`;
const LiItems = styled.a`
    color: #cbd5e1;
    text-decoration: none;
    margin-bottom: 10px;
    font-size: 14px;
    &:hover {
        color: #fff;
    }
`;
const AddressItem = styled.p`
    color: #cbd5e1;
    margin-bottom: 10px;
    font-size: 14px;
`;
const SocialMedia = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 15px;
`;
const SocialMediaLink = styled.a`
    background: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const SocialMediaImg = styled.img`
    width: 20px;
`;

// --- Modal Styles ---
const ReviewButton = styled.button`
    background: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 15px;
    width: fit-content;
    &:hover {
        background: #3b82f6;
        color: white;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
`;
const ModalBox = styled.div`
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 400px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;
const ModalTitle = styled.h2`
    text-align: center;
    margin-bottom: 20px;
    color: #333;
`;
const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
`;
const FormGroup = styled.div`
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
`;
const Label = styled.label`
    margin-bottom: 5px;
    font-weight: 600;
    color: #444;
    font-size: 14px;
`;
const Select = styled.select`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
`;
const TextArea = styled.textarea`
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    resize: vertical;
`;
const SubmitButton = styled.button`
    width: 100%;
    padding: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    &:disabled {
        background: #93c5fd;
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        background: #2563eb;
    }
`;
