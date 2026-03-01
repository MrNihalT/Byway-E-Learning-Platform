import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function AdminInstructorRequests() {
    const { userData } = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?.is_superuser) {
            fetchRequests();
        }
    }, [userData]);

    const fetchRequests = async () => {
        try {
            const res = await api.get("auth/admin/instructor-requests/");
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const result = await MySwal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Application?`,
            text: `Are you sure you want to ${action} this application?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: action === "approve" ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `Yes, ${action}!`,
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.post(`auth/admin/instructor-requests/${id}/review/`, {
                action,
            });
            toast.success(`Successfully ${action}ed!`);
            setRequests((prev) => prev.filter((req) => req.id !== id));
        } catch (err) {
            toast.error("Action failed.");
        }
    };

    if (loading) return <Container>Loading...</Container>;

    return (
        <>
            <Header />
            <Container>
                <Title>Pending Instructor Applications</Title>
                {requests.length === 0 ? (
                    <EmptyState>No pending requests at the moment.</EmptyState>
                ) : (
                    <List>
                        {requests.map((req) => (
                            <Card key={req.id}>
                                <CardHeader>
                                    <div>
                                        <Name>{req.full_name}</Name>
                                        <Username>@{req.username}</Username>
                                    </div>
                                    <DateBadge>
                                        Applied:{" "}
                                        {new Date(
                                            req.created_at,
                                        ).toLocaleDateString()}
                                    </DateBadge>
                                </CardHeader>

                                <SectionLabel>
                                    Personal Information
                                </SectionLabel>
                                <Grid>
                                    <Item>
                                        <strong>Email:</strong> {req.email}
                                    </Item>
                                    <Item>
                                        <strong>Phone:</strong>{" "}
                                        {req.phone_number}
                                    </Item>
                                    <Item>
                                        <strong>Gender:</strong> {req.gender}
                                    </Item>
                                    <Item>
                                        <strong>DOB:</strong> {req.dob}
                                    </Item>
                                </Grid>

                                <SectionLabel>
                                    Professional Details
                                </SectionLabel>
                                <Grid>
                                    <Item>
                                        <strong>Qualification:</strong>{" "}
                                        {req.qualification}
                                    </Item>
                                    <Item>
                                        <strong>Experience:</strong>{" "}
                                        {req.experience_years} Years
                                    </Item>
                                    <Item style={{ gridColumn: "1 / -1" }}>
                                        <strong>Domain Expertise:</strong>{" "}
                                        {req.domain_expertise}
                                    </Item>
                                </Grid>

                                <BioBox>
                                    <strong>Bio:</strong> {req.bio}
                                </BioBox>

                                <SectionLabel>Payout Details</SectionLabel>
                                <Grid>
                                    <Item>
                                        <strong>Bank Acc:</strong>{" "}
                                        {req.bank_account_no}
                                    </Item>
                                    <Item>
                                        <strong>IFSC/Code:</strong>{" "}
                                        {req.bank_ifsc_code}
                                    </Item>
                                </Grid>

                                <Divider />
                                <Links>
                                    {req.certificate_file ? (
                                        <FileLink
                                            href={
                                                req.certificate_file.startsWith(
                                                    "http",
                                                )
                                                    ? req.certificate_file
                                                    : `http://127.0.0.1:8000${req.certificate_file}`
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            📄 View CV / Resume
                                        </FileLink>
                                    ) : (
                                        <span style={{ color: "red" }}>
                                            No CV Uploaded
                                        </span>
                                    )}

                                    {req.social_links?.linkedin && (
                                        <SocialLink
                                            href={req.social_links.linkedin}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            🔗 LinkedIn Profile
                                        </SocialLink>
                                    )}
                                </Links>

                                <Actions>
                                    <RejectBtn
                                        onClick={() =>
                                            handleAction(req.id, "reject")
                                        }
                                    >
                                        Reject
                                    </RejectBtn>
                                    <ApproveBtn
                                        onClick={() =>
                                            handleAction(req.id, "approve")
                                        }
                                    >
                                        Approve
                                    </ApproveBtn>
                                </Actions>
                            </Card>
                        ))}
                    </List>
                )}
            </Container>
        </>
    );
}

// --- STYLES ---

const Container = styled.div`
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    min-height: 80vh;
`;

const Title = styled.h1`
    text-align: center;
    margin-bottom: 40px;
    color: #1e293b;
    font-size: 2rem;
`;

const EmptyState = styled.p`
    text-align: center;
    color: #64748b;
    font-size: 1.1rem;
    margin-top: 50px;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;

const Card = styled.div`
    background: white;
    border: 1px solid #e2e8f0;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 15px;
    margin-bottom: 20px;
`;

const Name = styled.h3`
    margin: 0;
    color: #0f172a;
    font-size: 1.25rem;
`;

const Username = styled.span`
    color: #64748b;
    font-size: 0.9rem;
`;

const DateBadge = styled.span`
    background: #f1f5f9;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #475569;
    font-weight: 500;
`;

const SectionLabel = styled.h5`
    margin: 20px 0 10px 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    border-bottom: 1px dashed #e2e8f0;
    padding-bottom: 5px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 15px;
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const Item = styled.div`
    font-size: 0.95rem;
    color: #334155;
    strong {
        color: #0f172a;
        font-weight: 600;
        margin-right: 5px;
    }
`;

const BioBox = styled.div`
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.5;
    margin-top: 15px;
    border: 1px solid #f1f5f9;
    strong {
        display: block;
        margin-bottom: 5px;
        color: #334155;
    }
`;

const Divider = styled.hr`
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 25px 0;
`;

const Links = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
`;

const LinkBtn = styled.a`
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 8px 12px;
    border-radius: 6px;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
`;

const FileLink = styled(LinkBtn)`
    background-color: #eff6ff;
    color: #2563eb;
    &:hover {
        background-color: #dbeafe;
    }
`;

const SocialLink = styled(LinkBtn)`
    background-color: #f0fdf4;
    color: #16a34a;
    &:hover {
        background-color: #dcfce7;
    }
`;

const Actions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
`;

const Btn = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    color: white;
    transition: opacity 0.2s;
    &:hover {
        opacity: 0.9;
    }
`;

const ApproveBtn = styled(Btn)`
    background: #16a34a;
`;

const RejectBtn = styled(Btn)`
    background: #dc2626;
`;
