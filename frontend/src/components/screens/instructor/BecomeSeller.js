import { style } from "framer-motion/client";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default function BecomeSeller() {
    return (
        <>
            <SellerSection>
                <Wrapper className="wrapper">
                    <SellerDiv>
                        <SellerContainer>
                            <SellerLeft>
                                <SellerImage
                                    src={require("../../assets/images/image 10.png")}
                                />
                            </SellerLeft>
                            <SellerRight>
                                <SellerTitle>Become an Instructor</SellerTitle>
                                <SellerDescription>
                                    Instructors from around the world teach
                                    millions of students on Byway. We provide
                                    the tools and skills to teach what you love.
                                </SellerDescription>
                                <SellerJourneyButton to="/become-instructor">
                                    <SellerJourneyButtonText>
                                        Start Your Instructor Journey
                                    </SellerJourneyButtonText>
                                    <RightIcon
                                        src={
                                            require("../../assets/icons/right_arrow.svg")
                                                .default
                                        }
                                    />
                                </SellerJourneyButton>
                            </SellerRight>
                        </SellerContainer>
                        <SellerContainer>
                            <SellerLeft>
                                <SellerImage
                                    src={require("../../assets/images/image 11.png")}
                                />
                            </SellerLeft>
                            <SellerRight>
                                <SellerTitle>
                                    Transform your life through Selling
                                </SellerTitle>
                                <SellerDescription>
                                    Learners around the world are launching new
                                    careers, advancing in their fields, and
                                    enriching their lives.
                                </SellerDescription>
                                <SellerJourneyButton>
                                    <SellerJourneyButtonText>
                                        Checkout Categories
                                    </SellerJourneyButtonText>
                                    <RightIcon
                                        src={
                                            require("../../assets/icons/right_arrow.svg")
                                                .default
                                        }
                                    />
                                </SellerJourneyButton>
                            </SellerRight>
                        </SellerContainer>
                    </SellerDiv>
                </Wrapper>
            </SellerSection>
        </>
    );
}
const SellerSection = styled.section`
    background: #ffffff;
`;
const Wrapper = styled.div``;
const SellerDiv = styled.div`
    display: flex;
    flex-direction: column;
    gap: 60px;
    padding: 60px 0;
`;
const SellerContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:nth-child(even) {
        flex-direction: row-reverse;
    }
    @media all and (max-width: 1465px) {
    }
    @media all and (max-width: 1280px) {
    }
    @media all and (max-width: 1080px) {
    }
    @media all and (max-width: 980px) {
    }
    @media all and (max-width: 768px) {
    }
    @media all and (max-width: 680px) {
        flex-wrap: wrap;
        row-gap: 30px;
        text-align: center;
    }
    @media all and (max-width: 548px) {
    }
    @media all and (max-width: 480px) {
    }
    @media all and (max-width: 420px) {
    }
    @media all and (max-width: 380px) {
    }
    @media all and (max-width: 360px) {
    }
    @media all and (max-width: 320px) {
    }
`;
const SellerLeft = styled.div`
    width: 40%;
    display: flex;
    justify-content: space-around;
    @media all and (max-width: 1465px) {
    }
    @media all and (max-width: 1280px) {
    }
    @media all and (max-width: 1080px) {
    }
    @media all and (max-width: 980px) {
    }
    @media all and (max-width: 768px) {
        width: 45%;
    }
    @media all and (max-width: 680px) {
        width: 100%;
    }
    @media all and (max-width: 548px) {
    }
    @media all and (max-width: 480px) {
    }
    @media all and (max-width: 420px) {
    }
    @media all and (max-width: 380px) {
    }
    @media all and (max-width: 360px) {
    }
    @media all and (max-width: 320px) {
    }
`;
const SellerImage = styled.img`
    width: 400px;
    height: 425px;
    angle: 0 deg;
    opacity: 1;
    @media all and (max-width: 1465px) {
    }
    @media all and (max-width: 1280px) {
        width: 350px;
        height: 360px;
    }
    @media all and (max-width: 1080px) {
    }
    @media all and (max-width: 980px) {
        width: 300px;
        height: 320px;
    }
    @media all and (max-width: 768px) {
    }
    @media all and (max-width: 680px) {
    }
    @media all and (max-width: 548px) {
    }
    @media all and (max-width: 480px) {
    }
    @media all and (max-width: 420px) {
    }
    @media all and (max-width: 380px) {
        width: 260px;
        height: 260px;
    }
    @media all and (max-width: 360px) {
    }
    @media all and (max-width: 320px) {
    }
`;
const SellerRight = styled.div`
    width: 60%;
    @media all and (max-width: 1465px) {
    }
    @media all and (max-width: 1280px) {
    }
    @media all and (max-width: 1080px) {
    }
    @media all and (max-width: 980px) {
        width: 50%;
    }
    @media all and (max-width: 768px) {
    }
    @media all and (max-width: 680px) {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    @media all and (max-width: 548px) {
    }
    @media all and (max-width: 480px) {
    }
    @media all and (max-width: 420px) {
    }
    @media all and (max-width: 380px) {
    }
    @media all and (max-width: 360px) {
    }
    @media all and (max-width: 320px) {
    }
`;
const SellerTitle = styled.h1`
    font-weight: 600;
    font-size: 20px;
    line-height: 150%;
    letter-spacing: 0%;
    margin-bottom: 8px;
    color: #000000;
`;
const SellerDescription = styled.p`
    font-family: Inter;
    font-weight: 400;
    font-style: Regular;
    font-size: 16px;
    leading-trim: NONE;
    line-height: 160%;
    letter-spacing: 0%;
    color: #1d2939;
    margin-bottom: 18px;
    max-width: 550px;
    @media all and (max-width: 1465px) {
    }
    @media all and (max-width: 1280px) {
    }
    @media all and (max-width: 1080px) {
    }
    @media all and (max-width: 980px) {
        max-width: 380px;
    }
    @media all and (max-width: 768px) {
    }
    @media all and (max-width: 680px) {
    }
    @media all and (max-width: 548px) {
    }
    @media all and (max-width: 480px) {
    }
    @media all and (max-width: 420px) {
    }
    @media all and (max-width: 380px) {
    }
    @media all and (max-width: 360px) {
    }
    @media all and (max-width: 320px) {
    }
`;
const SellerJourneyButton = styled(Link)`
    width: fit-content;
    height: 48px;
    angle: 0 deg;
    opacity: 1;
    gap: 6px;
    border-radius: 8px;
    padding: 10px 24px;
    cursor: pointer;
    background: #020617;
    display: flex;
    align-items: center;
`;
const SellerJourneyButtonText = styled.span`
    color: #ffffff;
    font-weight: 500;
    font-size: 14px;
    line-height: 160%;
    letter-spacing: 0%;
`;
const RightIcon = styled.img`
    width: 16px;
    height: 12px;
    angle: 0 deg;
    opacity: 1;
    border-width: 2px;
`;
