import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import Header from "../../includes/Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Report() {
    const { userData } = useContext(UserContext);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get("community/admin/reports/");
                setReports(response.data);
            } catch (err) {
                console.error("Error fetching reports:", err);
                toast.error("Failed to load reports.");
            } finally {
                setIsLoading(false);
            }
        };

        if (userData && userData.is_staff) {
            fetchReports();
        } else {
            
            fetchReports();
        }
    }, [userData]);

    const handleViewPost = (postId) => {
        navigate("/community", { state: { highlightPostId: postId } });
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <LoadingWrapper>Loading Reports...</LoadingWrapper>
            </>
        );
    }

    return (
        <>
            <Header />
            <PageContainer>
                <Wrapper>
                    <Title>Community Reports</Title>
                    {reports.length === 0 ? (
                        <NoReportsBox>
                            <span role="img" aria-label="check">
                                ✅
                            </span>{" "}
                            No active reports.
                        </NoReportsBox>
                    ) : (
                        <ReportTable>
                            <thead>
                                <tr>
                                    <th>Reason</th>
                                    <th>Post ID</th>
                                    <th>Comment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report, index) => (
                                    <tr key={index}>
                                        <td className="reason-cell">
                                            <ReasonTag reason={report.reason}>
                                                {report.reason}
                                            </ReasonTag>
                                        </td>
                                        <td>{report.post}</td>
                                        <td>{report.comment ? "Yes" : "No"}</td>
                                        <td>
                                            <ActionButton
                                                onClick={() =>
                                                    handleViewPost(report.post)
                                                }
                                            >
                                                View Post
                                            </ActionButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </ReportTable>
                    )}
                </Wrapper>
            </PageContainer>
        </>
    );
}

const PageContainer = styled.div`
    background-color: #f4f7f9;
    min-height: 100vh;
    padding-top: 40px;
`;

const Wrapper = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
`;

const Title = styled.h1`
    font-size: 28px;
    color: #1a202c;
    margin-bottom: 30px;
    font-weight: 700;
`;

const ReportTable = styled.table`
    width: 100%;
    background: white;
    border-radius: 12px;
    border-collapse: collapse;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

    thead {
        background-color: #f8fafc;
        tr {
            th {
                padding: 16px 20px;
                text-align: left;
                font-size: 14px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                border-bottom: 1px solid #e2e8f0;
            }
        }
    }

    tbody {
        tr {
            transition: background 0.2s;
            &:hover {
                background-color: #f1f5f9;
            }
            td {
                padding: 16px 20px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
                font-size: 15px;
                &.reason-cell {
                    text-transform: capitalize;
                }
            }
        }
    }
`;

const ReasonTag = styled.span`
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    background-color: ${(props) => {
        const reason = props.reason ? props.reason.toLowerCase() : "";
        switch (reason) {
            case "spam":
                return "#fee2e2; color: #dc2626;";
            case "harassment":
                return "#ffedd5; color: #ea580c;";
            case "inappropriate":
                return "#fef9c3; color: #a16207;";
            default:
                return "#e2e8f0; color: #475569;";
        }
    }};
`;

const ActionButton = styled.button`
    background-color: #3b82f6;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background-color: #2563eb;
    }
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    font-size: 18px;
    color: #64748b;
`;

const NoReportsBox = styled.div`
    background: white;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    font-size: 18px;
    color: #64748b;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;
