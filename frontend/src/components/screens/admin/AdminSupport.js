import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { toast } from "react-toastify";

export default function AdminSupport() {
    const [supportRequests, setSupportRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchSupportRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get("course/support/");
            setSupportRequests(response.data);
        } catch (error) {
            console.error("Error fetching support requests:", error);
            toast.error("Failed to fetch support requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupportRequests();
    }, []);

    const openModal = (request) => {
        setSelectedRequest(request);
    };

    const closeModal = () => {
        setSelectedRequest(null);
    };

    return (
        <PageContainer>
            <Header />
            <ContentWrapper>
                <div className="wrapper">
                    <TitleSection>
                        <Title>Support Requests</Title>
                        <Subtitle>Manage user inquiries and feedback.</Subtitle>
                    </TitleSection>

                    {loading ? (
                        <LoadingState>Loading requests...</LoadingState>
                    ) : supportRequests.length === 0 ? (
                        <EmptyState>No support requests found.</EmptyState>
                    ) : (
                        <TableContainer>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supportRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td width="20%">
                                                {request.name ||
                                                    request.full_name}
                                            </td>
                                            <td width="20%">{request.email}</td>
                                            <td width="40%">
                                                {request.subject.slice(0, 155)}
                                            </td>
                                            <td width="10%">
                                                {new Date(
                                                    request.created_at ||
                                                        request.date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td width="10%">
                                                <ViewButton
                                                    onClick={() =>
                                                        openModal(request)
                                                    }
                                                >
                                                    View Details
                                                </ViewButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableContainer>
                    )}
                </div>
            </ContentWrapper>
            <Footer />

            {selectedRequest && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Request Details</ModalTitle>
                            <CloseButton onClick={closeModal}>
                                &times;
                            </CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <DetailGroup>
                                <DetailLabel>From:</DetailLabel>
                                <DetailValue>
                                    {selectedRequest.name ||
                                        selectedRequest.full_name}{" "}
                                    ({selectedRequest.email})
                                </DetailValue>
                            </DetailGroup>
                            <DetailGroup>
                                <DetailLabel>Subject:</DetailLabel>
                                <DetailValue>
                                    {selectedRequest.subject}
                                </DetailValue>
                            </DetailGroup>
                            <DetailGroup>
                                <DetailLabel>Date:</DetailLabel>
                                <DetailValue>
                                    {new Date(
                                        selectedRequest.created_at ||
                                            selectedRequest.date,
                                    ).toLocaleString()}
                                </DetailValue>
                            </DetailGroup>
                            <DetailGroup>
                                <DetailLabel>Message:</DetailLabel>
                                <MessageText>
                                    {selectedRequest.message ||
                                        selectedRequest.description}
                                </MessageText>
                            </DetailGroup>
                        </ModalBody>
                        <ModalFooter>
                            <PrimaryButton onClick={closeModal}>
                                Close
                            </PrimaryButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
}

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f8fafc;
`;

const ContentWrapper = styled.div`
    flex: 1;
    padding: 60px 0;
`;

const TitleSection = styled.div`
    margin-bottom: 40px;
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: #64748b;
`;

const LoadingState = styled.div`
    text-align: center;
    padding: 60px;
    font-size: 18px;
    color: #64748b;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #64748b;
    font-size: 18px;
`;

const TableContainer = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    text-align: left;

    thead {
        background: #f1f5f9;
        th {
            padding: 16px;
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
        }
    }

    tbody {
        tr {
            border-bottom: 1px solid #f1f5f9;
            &:hover {
                background: #f8fafc;
            }
        }
        td {
            padding: 16px;
            font-size: 14px;
            color: #334155;
        }
    }
`;

const ViewButton = styled.button`
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #2563eb;
    }
`;

// Modal Styles
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
    background: white;
    width: 90%;
    max-width: 600px;
    border-radius: 16px;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
`;

const ModalHeader = styled.div`
    padding: 20px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ModalTitle = styled.h2`
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    color: #94a3b8;
    cursor: pointer;
    &:hover {
        color: #64748b;
    }
`;

const ModalBody = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const DetailGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const DetailLabel = styled.span`
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
`;

const DetailValue = styled.span`
    font-size: 15px;
    color: #0f172a;
    font-weight: 500;
`;

const MessageText = styled.div`
    padding: 16px;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
    white-space: pre-wrap;
`;

const ModalFooter = styled.div`
    padding: 16px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
`;

const PrimaryButton = styled.button`
    padding: 10px 20px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    &:hover {
        background: #1e293b;
    }
`;
