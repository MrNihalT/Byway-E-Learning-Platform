import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function NotFound() {
    return (
        <PageContainer>
            <Header />
            <Main>
                <Content>
                    <ErrorCode>404</ErrorCode>
                    <Title>Page not found</Title>
                    <Description>
                        Sorry, we couldn’t find the page you’re looking for.
                    </Description>
                    <Actions>
                        <HomeLink to="/">Go back home</HomeLink>
                        <SupportLink to="/support">
                            Contact support{" "}
                            <span aria-hidden="true">&rarr;</span>
                        </SupportLink>
                    </Actions>
                </Content>
            </Main>
            <Footer />
        </PageContainer>
    );
}

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #ffffff;
`;

const Main = styled.main`
    flex: 1;
    display: grid;
    place-items: center;
    padding: 96px 24px;
    @media (min-width: 640px) {
        padding: 128px 24px;
    }
`;

const Content = styled.div`
    text-align: center;
`;

const ErrorCode = styled.p`
    font-size: 1rem;
    font-weight: 600;
    color: #4f46e5;
    margin: 0;
`;

const Title = styled.h1`
    margin-top: 16px;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #111827;
    @media (min-width: 640px) {
        font-size: 4.5rem;
    }
`;

const Description = styled.p`
    margin-top: 24px;
    font-size: 1.125rem;
    line-height: 2rem;
    color: #4b5563;
    @media (min-width: 640px) {
        font-size: 1.25rem;
    }
`;

const Actions = styled.div`
    margin-top: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
`;

const HomeLink = styled(Link)`
    border-radius: 6px;
    background-color: #4f46e5;
    padding: 10px 14px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff !important;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
    text-decoration: none;

    &:hover {
        background-color: #4338ca;
    }
`;

const SupportLink = styled(Link)`
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827 !important;
    text-decoration: none;
`;
