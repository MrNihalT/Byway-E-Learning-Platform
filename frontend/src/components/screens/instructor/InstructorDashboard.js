import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../../../api";
import Header from "../../includes/Header";

export default function InstructorDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("course/dashboard/instructor/")
            .then((res) => setStats(res.data))
            .catch((err) => console.error(err));
    }, []);

    if (!stats) return <Container>Loading Dashboard...</Container>;

    return (
        <>
            <Header />
            <Container>
                <Title>Instructor Dashboard</Title>

                {/* Stats Cards */}
                <StatsGrid>
                    <StatCard>
                        <h3>Total Earnings</h3>
                        <h1>${stats.total_earnings}</h1>
                    </StatCard>
                    <StatCard>
                        <h3>Total Students</h3>
                        <h1>{stats.total_students}</h1>
                    </StatCard>
                    <StatCard>
                        <h3>Best Seller</h3>
                        <p>{stats.best_selling_course?.title || "N/A"}</p>
                    </StatCard>
                </StatsGrid>

                <SectionTitle>Course Performance</SectionTitle>
                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <th>Course Title</th>
                                <th>Price</th>
                                <th>Students Enrolled</th>
                                <th>Total Collected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.course_breakdown.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.title}</td>
                                    <td>${course.price}</td>
                                    <td>{course.sales_count}</td>
                                    <td>
                                        <strong>${course.revenue}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
}

// --- Styles ---
const Container = styled.div`
    padding: 40px;
    background: #f8fafc;
    min-height: 100vh;
`;
const Title = styled.h1`
    color: #1e293b;
    margin-bottom: 30px;
`;
const SectionTitle = styled.h2`
    margin-top: 40px;
    margin-bottom: 20px;
    font-size: 20px;
    color: #334155;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
`;
const StatCard = styled.div`
    background: white;
    padding: 25px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    h3 {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 10px;
    }
    h1 {
        font-size: 28px;
        color: #0f172a;
        margin: 0;
    }
    p {
        font-size: 18px;
        font-weight: 600;
        color: #2563eb;
    }
`;

const TableContainer = styled.div`
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        padding: 15px 20px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
    }
    th {
        background: #f1f5f9;
        font-weight: 600;
        color: #475569;
        font-size: 14px;
    }
    td {
        color: #334155;
        font-size: 15px;
    }
`;
