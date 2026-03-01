import React, { useEffect } from "react";
import styled from "styled-components";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <PageContainer>
            <Header />

            {/* Dark hero strip */}
            <HeroStrip>
                <HeroBadge>Legal Document</HeroBadge>
                <HeroTitle>Privacy Policy</HeroTitle>
                <HeroSub>Last Updated: 28 February 2026</HeroSub>
            </HeroStrip>

            {/* Content card on dark bg */}
            <CardWrap>
                <Article>
                    <Intro>
                        At <strong>Byway</strong>, we respect your privacy and
                        are committed to protecting the personal data you share
                        with us. This Privacy Policy explains what information
                        we collect, how we use it, and the rights you have over
                        your data when you use our online learning platform.
                    </Intro>

                    <Divider />

                    {/* 1 */}
                    <Section>
                        <SectionTitle>1. Information We Collect</SectionTitle>

                        <SubSection>
                            <SubTitle>1.1 Account Registration Data</SubTitle>
                            <Para>
                                When you create an account on Byway, we collect:
                            </Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    Full name and username
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Email address and password (stored in hashed
                                    form)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Phone number (optional)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Profile picture
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Biography / About Me
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Educational qualification
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Social media profile links (e.g., LinkedIn,
                                    Twitter, GitHub)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    User role (Student, Instructor, or Admin)
                                </li>
                            </List>
                        </SubSection>

                        <SubSection>
                            <SubTitle>1.2 Instructor Application Data</SubTitle>
                            <Para>
                                When you apply to become an instructor, we
                                additionally collect:
                            </Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    Date of birth and gender
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Domain expertise and years of experience
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    CV / résumé file (uploaded document)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    LinkedIn profile URL
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Bank account number and IFSC code (for
                                    payout processing only)
                                </li>
                            </List>
                        </SubSection>

                        <SubSection>
                            <SubTitle>
                                1.3 Course &amp; Learning Activity Data
                            </SubTitle>
                            <Para>
                                As you use Byway's learning features, we record:
                            </Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    Courses you enrol in and the date of
                                    enrolment
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Lectures you have completed and their
                                    completion timestamps
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Quiz attempts — scores, pass/fail status,
                                    and individual question responses
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Assignment submissions — uploaded files,
                                    text responses, marks obtained, and
                                    instructor feedback
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Course reviews and ratings you post
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Certificates of completion issued to you,
                                    including the certificate ID and issue date
                                </li>
                            </List>
                        </SubSection>

                        <SubSection>
                            <SubTitle>
                                1.4 Transaction &amp; Payment Data
                            </SubTitle>
                            <Para>When you purchase a course, we collect:</Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    Order details (courses purchased, amounts,
                                    and transaction status)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Payment transaction IDs from our payment
                                    gateway (Razorpay / PhonePe)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Cart and wishlist items while you are
                                    shopping
                                </li>
                            </List>
                            <Callout>
                                We do not store your full card number, CVV, or
                                any raw payment credentials. All sensitive
                                payment processing is handled directly by our
                                certified payment providers.
                            </Callout>
                        </SubSection>

                        <SubSection>
                            <SubTitle>1.5 Community &amp; Chat Data</SubTitle>
                            <Para>
                                When you engage with Byway's social features, we
                                store:
                            </Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    Community posts you create (text, images,
                                    videos, and polls)
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Comments and replies you write, along with
                                    likes on posts
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Poll votes you cast
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Private messages and group chat messages you
                                    send to other users
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Read-receipts indicating whether a message
                                    has been seen
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Reports you file about posts or comments
                                </li>
                            </List>
                        </SubSection>

                        <SubSection>
                            <SubTitle>1.6 Support Requests</SubTitle>
                            <Para>
                                If you contact our support team, we collect your
                                name, email address, subject, and the content of
                                your message.
                            </Para>
                        </SubSection>

                        <SubSection>
                            <SubTitle>1.7 Technical &amp; Usage Data</SubTitle>
                            <Para>
                                Our servers automatically collect standard
                                technical information, including:
                            </Para>
                            <List>
                                <li style={{ color: "#94a3b8" }}>
                                    IP address and approximate geographic
                                    location
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Browser type and operating system
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Pages visited, links clicked, and time spent
                                    on pages
                                </li>
                                <li style={{ color: "#94a3b8" }}>
                                    Session authentication tokens (JWT — stored
                                    in your browser)
                                </li>
                            </List>
                        </SubSection>
                    </Section>

                    <Divider />

                    {/* 2 */}
                    <Section>
                        <SectionTitle>
                            2. How We Use Your Information
                        </SectionTitle>
                        <Para>We use the information we collect to:</Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                Create and maintain your user account
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Provide and personalise our learning platform
                                services
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Process payments and manage course enrolments
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Track your learning progress and issue
                                certificates of completion
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Enable communication between students and
                                instructors via chat and community features
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Review and process instructor applications
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Calculate and process instructor payouts
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Send transactional emails (e.g., OTP
                                verification, order confirmations, password
                                reset)
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Respond to support requests and resolve disputes
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Detect, investigate, and prevent fraudulent or
                                illegal activity
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Improve and develop new platform features
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Comply with our legal obligations
                            </li>
                        </List>
                    </Section>

                    <Divider />

                    {/* 3 */}
                    <Section>
                        <SectionTitle>
                            3. Legal Basis for Processing
                        </SectionTitle>
                        <Para>
                            We rely on the following legal grounds to process
                            your personal data:
                        </Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Contract performance</strong> —
                                processing necessary to deliver the services you
                                have purchased or signed up for.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Legitimate interests</strong> —
                                improving platform security, preventing fraud,
                                and enhancing user experience.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Legal obligation</strong> — complying
                                with applicable tax, financial, and regulatory
                                requirements.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Consent</strong> — where you have
                                explicitly opted in (e.g., marketing emails,
                                optional social links).
                            </li>
                        </List>
                    </Section>

                    <Divider />

                    {/* 4 */}
                    <Section>
                        <SectionTitle>
                            4. Data Sharing &amp; Disclosure
                        </SectionTitle>
                        <Para>
                            We do <strong>not</strong> sell your personal data.
                            We may share your information only in the following
                            circumstances:
                        </Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Payment processors</strong> — Razorpay
                                and PhonePe receive the minimum data required to
                                complete your transaction.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Email service providers</strong> — we
                                use Gmail SMTP to send transactional emails;
                                only your email address and message content are
                                transmitted.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Instructors</strong> — if you are
                                enrolled in a course, the instructor may see
                                your username, submitted assignments, and quiz
                                scores relevant to their course.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Other users</strong> — your public
                                profile (name, profile picture, bio, social
                                links) and any content you post in community
                                spaces is visible to other registered users.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Legal compliance</strong> — we may
                                disclose your data if required by law, court
                                order, or to protect the rights, safety, and
                                security of Byway and its users.
                            </li>
                        </List>
                    </Section>

                    <Divider />

                    {/* 5 */}
                    <Section>
                        <SectionTitle>5. Data Retention</SectionTitle>
                        <Para>
                            We retain your personal data for as long as your
                            account is active or as needed to provide our
                            services. Specifically:
                        </Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                Account data is retained for the lifetime of
                                your account and for up to{" "}
                                <strong>3 years</strong> after account deletion
                                for legal and dispute purposes.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Payment transaction records are retained for a
                                minimum of <strong>7 years</strong> to meet
                                financial and tax regulations.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Instructor application data (including bank
                                details) is retained for the duration of the
                                instructor relationship and for{" "}
                                <strong>5 years</strong> after termination.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Support messages are retained for{" "}
                                <strong>2 years</strong> from the date of
                                submission.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                OTP codes expire automatically and are deleted
                                once used or after a short validity period.
                            </li>
                        </List>
                    </Section>

                    <Divider />

                    {/* 6 */}
                    <Section>
                        <SectionTitle>6. Data Security</SectionTitle>
                        <Para>
                            We implement appropriate technical and
                            organisational measures to protect your personal
                            data:
                        </Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                Passwords are stored using Django's
                                industry-standard hashing algorithms (PBKDF2 +
                                SHA-256).
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Authentication uses short-lived JWT access
                                tokens (10-second lifetime) with 30-day rotating
                                refresh tokens.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                All data is stored in a PostgreSQL database with
                                access controls.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                Media files (profile pictures, CVs, assignment
                                files) are stored securely on the server.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                HTTPS encryption is enforced for all data in
                                transit (in production).
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                CSRF protection is enabled for all
                                state-changing requests.
                            </li>
                        </List>
                        <Para>
                            While we take security seriously, no method of
                            transmission over the internet is 100% secure. We
                            encourage you to use a strong, unique password and
                            to notify us immediately if you suspect any
                            unauthorised access to your account.
                        </Para>
                    </Section>

                    <Divider />

                    {/* 7 */}
                    <Section>
                        <SectionTitle>7. Your Rights</SectionTitle>
                        <Para>
                            Depending on your jurisdiction, you may have the
                            following rights with respect to your personal data:
                        </Para>
                        <List>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right of access</strong> — request a
                                copy of the personal data we hold about you.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to rectification</strong> — update
                                or correct inaccurate personal data via your
                                Profile settings.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to erasure</strong> — request
                                deletion of your account and personal data
                                (subject to legal retention requirements).
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to restriction</strong> — ask us
                                to restrict processing of your data in certain
                                circumstances.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to data portability</strong> —
                                receive your data in a structured,
                                machine-readable format.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to object</strong> — object to
                                processing based on legitimate interests or for
                                direct marketing purposes.
                            </li>
                            <li style={{ color: "#94a3b8" }}>
                                <strong>Right to withdraw consent</strong> —
                                where processing is based on consent, withdraw
                                it at any time without affecting prior
                                processing.
                            </li>
                        </List>
                        <Para>
                            To exercise any of these rights, please contact us
                            using the details in Section 10. We will respond
                            within <strong>30 days</strong>.
                        </Para>
                    </Section>

                    <Divider />

                    {/* 8 */}
                    <Section>
                        <SectionTitle>
                            8. Cookies &amp; Local Storage
                        </SectionTitle>
                        <Para>
                            Byway uses browser <strong>local storage</strong> to
                            store your authentication tokens (access and refresh
                            JWTs) so that you remain logged in across sessions.
                            We do not currently use advertising or tracking
                            cookies from third parties.
                        </Para>
                        <Para>
                            You can clear local storage at any time through your
                            browser's developer tools or privacy settings, which
                            will log you out of Byway.
                        </Para>
                    </Section>

                    <Divider />

                    {/* 9 */}
                    <Section>
                        <SectionTitle>9. Children's Privacy</SectionTitle>
                        <Para>
                            Byway is not directed at children under the age of{" "}
                            <strong>13</strong>. We do not knowingly collect
                            personal data from children under 13. If we become
                            aware that a child under 13 has provided us with
                            personal information, we will delete that
                            information promptly. If you believe a child has
                            provided us with their data, please contact us
                            immediately.
                        </Para>
                    </Section>

                    <Divider />

                    {/* 10 */}
                    <Section>
                        <SectionTitle>10. Contact Us</SectionTitle>
                        <Para>
                            If you have any questions, concerns, or requests
                            regarding this Privacy Policy or how we handle your
                            personal data, please contact us:
                        </Para>
                        <ContactCard>
                            <ContactRow>
                                <ContactLabel>Email</ContactLabel>
                                <ContactValue>
                                    nihal.chiyoor@gmail.com
                                </ContactValue>
                            </ContactRow>
                            <ContactDivider />
                            <ContactRow>
                                <ContactLabel>Organisation</ContactLabel>
                                <ContactValue>
                                    Byway Education — Privacy Team
                                </ContactValue>
                            </ContactRow>
                        </ContactCard>
                        <Para>
                            We aim to acknowledge all privacy inquiries within{" "}
                            <strong>48 hours</strong> and resolve them within{" "}
                            <strong>30 days</strong>.
                        </Para>
                    </Section>

                    <Divider />

                    {/* 11 */}
                    <Section>
                        <SectionTitle>11. Changes to This Policy</SectionTitle>
                        <Para>
                            We may update this Privacy Policy from time to time
                            to reflect changes in our practices, technology, or
                            legal requirements. When we make material changes,
                            we will update the <strong>"Last Updated"</strong>{" "}
                            date at the top of this page and, where appropriate,
                            notify you by email or a prominently displayed
                            notice on the platform.
                        </Para>
                        <Para>
                            We encourage you to review this Policy periodically.
                            Your continued use of Byway after any changes
                            constitutes your acceptance of the revised Policy.
                        </Para>
                    </Section>
                </Article>
            </CardWrap>

            <Footer />
        </PageContainer>
    );
}

/* ─────────────────────────────────────────────
   Styled Components
───────────────────────────────────────────── */

/* Full page dark navy — same as instructor page, extends top to bottom */
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    position: relative;
    color: #f1f5f9;

    &::before {
        content: "";
        position: fixed;
        inset: 0;
        background:
            radial-gradient(
                ellipse at 15% 20%,
                rgba(59, 130, 246, 0.12) 0%,
                transparent 55%
            ),
            radial-gradient(
                ellipse at 85% 75%,
                rgba(99, 102, 241, 0.1) 0%,
                transparent 55%
            );
        pointer-events: none;
        z-index: 0;
    }
`;

const HeroStrip = styled.div`
    text-align: center;
    padding: 72px 24px 56px;
    position: relative;
    z-index: 1;
`;

const HeroBadge = styled.span`
    display: inline-block;
    padding: 8px 18px;
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 20px;
    border: 1px solid rgba(59, 130, 246, 0.3);
`;

const HeroTitle = styled.h1`
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0 0 12px;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (min-width: 640px) {
        font-size: 3.75rem;
    }
`;

const HeroSub = styled.p`
    font-size: 0.9375rem;
    color: #64748b;
    margin: 0;
`;

/* White article card sitting directly on the dark bg */
const CardWrap = styled.div`
    flex: 1;
    padding: 0 24px 80px;
    position: relative;
    z-index: 1;
`;

const Article = styled.article`
    max-width: 740px;
    margin: 0 auto;
    background: linear-gradient(
        145deg,
        #1a2840 0%,
        #19212fff 60%,
        #1a2840 100%
    );
    border-radius: 16px;
    padding: 48px 52px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
        0 4px 6px rgba(65, 63, 63, 0.2),
        0 20px 60px rgba(67, 66, 66, 0.35);

    @media (max-width: 640px) {
        padding: 32px 24px;
        border-radius: 12px;
    }
    &:hover {
        transition: all 0.1s ease-in-out;
        box-shadow:
            0 4px 6px rgba(108, 106, 106, 0.2),
            0 20px 60px rgba(108, 106, 106, 0.35);
    }
`;

const Intro = styled.p`
    font-size: 1rem;
    line-height: 1.75;
    color: #94a3b8;
    margin: 0;

    strong {
        color: #f1f5f9;
        font-weight: 600;
    }
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 40px 0;
`;

const Section = styled.section``;

const SectionTitle = styled.h2`
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 18px;
    letter-spacing: -0.01em;
`;

const SubSection = styled.div`
    margin-bottom: 26px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SubTitle = styled.h3`
    font-size: 0.9375rem;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 10px;
`;

const Para = styled.p`
    font-size: 0.9375rem;
    line-height: 1.75;
    color: #94a3b8;
    margin: 0 0 14px;

    strong {
        color: #f1f5f9;
        font-weight: 600;
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const List = styled.ul`
    margin: 0 0 14px;
    padding-left: 22px;
    color: #cbd5e1;
    font-size: 0.9375rem;
    line-height: 1.75;
    list-style-type: disc !important;

    li {
        margin-bottom: 6px;

        &:last-child {
            margin-bottom: 0;
        }

        &::marker {
            color: #f1f5f9;
        }
    }

    strong {
        color: #f1f5f9;
        font-weight: 600;
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const Callout = styled.div`
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-left: 3px solid #3b82f6;
    border-radius: 6px;
    padding: 14px 18px;
    font-size: 0.875rem;
    line-height: 1.7;
    color: #93c5fd;
    margin-top: 4px;
`;

const ContactCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 20px 24px;
    margin: 0 0 16px;
`;

const ContactRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 12px;
`;

const ContactLabel = styled.span`
    font-size: 0.8125rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-width: 110px;
    flex-shrink: 0;
`;

const ContactValue = styled.span`
    font-size: 0.9375rem;
    color: #e2e8f0;
`;

const ContactDivider = styled.hr`
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 14px 0;
`;
