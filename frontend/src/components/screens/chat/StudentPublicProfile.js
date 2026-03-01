import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import Header from "../../includes/Header";
import Footer from "../../includes/Footer";
import { UserContext } from "../../includes/UserProvider";
import { toast } from "react-toastify";

export default function StudentPublicProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`auth/user/public/${studentId}/`)
            .then((res) => {
                setStudent(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [studentId]);

    const handleMessage = async () => {
        if (!userData) {
            toast.error("Please log in to message this student.");
            return;
        }
        try {
            await api.post("chat/start/", { user_id: student.id });
            navigate("/chat");
        } catch (err) {
            console.error(err);
            toast.error("Could not initiate chat.");
        }
    };

    if (loading) return <Container>Loading Profile...</Container>;
    if (!student) return <Container>User not found.</Container>;

    return (
        <>
            <Header />
            <Container>
                <ProfileCard>
                    <ProfileImg
                        src={
                            student.profile_picture ||
                            "https://via.placeholder.com/150"
                        }
                    />
                    <Info>
                        <Name>{student.full_name || student.username}</Name>
                        <RoleBadge>Student</RoleBadge>

                        {userData && userData.id !== student.id && (
                            <MessageButton onClick={handleMessage}>
                                Message
                            </MessageButton>
                        )}

                        <Bio>{student.about_me || "No bio available."}</Bio>

                        <Stats>
                            <Stat>
                                <b>
                                    {student.date_joined
                                        ? new Date(
                                              student.date_joined,
                                          ).toLocaleDateString()
                                        : "Unknown"}
                                </b>
                                <span>Joined</span>
                            </Stat>
                        </Stats>
                    </Info>
                </ProfileCard>
            </Container>
            <Footer />
        </>
    );
}

const Container = styled.div`
    background: #f8fafc;
    min-height: 80vh;
    padding: 60px 20px;
    display: flex;
    justify-content: center;
`;

const ProfileCard = styled.div`
    background: white;
    width: 100%;
    max-width: 600px;
    padding: 40px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: fit-content;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const ProfileImg = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 20px;
    border: 4px solid #f1f5f9;
`;

const Info = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Name = styled.h1`
    font-size: 24px;
    color: #0f172a;
    margin: 0 0 10px 0;
`;

const RoleBadge = styled.span`
    background: #e0f2fe;
    color: #0284c7;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 15px;
    display: inline-block;
`;

const MessageButton = styled.button`
    padding: 8px 24px;
    background-color: #0f172a;
    color: white;
    border: none;
    border-radius: 30px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 15px;

    &:hover {
        background-color: #334155;
    }
`;

const Bio = styled.p`
    color: #64748b;
    margin: 10px 0 25px 0;
    line-height: 1.6;
    max-width: 80%;
`;

const Stats = styled.div`
    border-top: 1px solid #e2e8f0;
    padding-top: 25px;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 40px;
`;

const Stat = styled.div`
    display: flex;
    flex-direction: column;
    b {
        color: #0f172a;
        font-size: 18px;
    }
    span {
        color: #64748b;
        font-size: 14px;
    }
`;
