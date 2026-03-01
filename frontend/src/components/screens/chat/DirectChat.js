import React, { useState, useEffect, useContext, useRef } from "react";
import api from "../../../api"; // Adjust path based on folder structure
import { UserContext } from "../../includes/UserProvider";
import * as S from "./ChatStyles"; // Import styles
import { toast } from "react-toastify";

export default function DirectChat({ activeTab, setActiveTab }) {
    const { userData } = useContext(UserContext);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [filterMode, setFilterMode] = useState("all");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, [filterMode]);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.id);
            const interval = setInterval(
                () => fetchMessages(activeChat.id),
                3000,
            );
            return () => clearInterval(interval);
        }
    }, [activeChat?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            let url = "chat/conversations/";
            if (filterMode === "students") url += "?filter=students";
            if (filterMode === "instructors") url += "?filter=instructors";
            const res = await api.get(url);
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await api.get(`chat/conversations/${id}/messages/`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(
                `chat/conversations/${activeChat.id}/messages/`,
                { text: newMessage },
            );
            setMessages([...messages, res.data]);
            setNewMessage("");
            fetchConversations();
        } catch (err) {
            toast.error("Failed to send");
        }
    };

    return (
        <S.Container>
            <S.Sidebar $isActive={!!activeChat}>
                <S.SidebarHeader>
                    <div>
                        <h3>Messages</h3>
                    </div>
                    <S.TabContainer>
                        <S.TabBtn $active={true}>Direct</S.TabBtn>
                        <S.TabBtn
                            $active={false}
                            onClick={() => setActiveTab("groups")}
                        >
                            Groups
                        </S.TabBtn>
                    </S.TabContainer>
                    <S.FilterContainer>
                        <S.FilterBtn
                            $active={filterMode === "all"}
                            onClick={() => setFilterMode("all")}
                        >
                            All
                        </S.FilterBtn>
                        {userData?.role === "instructor" && (
                            <S.FilterBtn
                                $active={filterMode === "students"}
                                onClick={() => setFilterMode("students")}
                            >
                                Students
                            </S.FilterBtn>
                        )}
                        {userData?.role === "student" && (
                            <S.FilterBtn
                                $active={filterMode === "instructors"}
                                onClick={() => setFilterMode("instructors")}
                            >
                                Instructors
                            </S.FilterBtn>
                        )}
                    </S.FilterContainer>
                </S.SidebarHeader>

                <S.ListContainer>
                    {conversations.map((c) => {
                        const otherUser = c.other_user || c.user2;

                        return (
                            <S.ListItem
                                key={c.id}
                                $active={activeChat?.id === c.id}
                                onClick={() => setActiveChat(c)}
                            >
                                <S.Avatar
                                    src={
                                        c.other_user?.profile_picture ||
                                        "https://via.placeholder.com/150"
                                    }
                                />
                                <div>
                                    <S.Name>
                                        {c.other_user?.full_name ||
                                            c.other_user?.username ||
                                            "User"}
                                    </S.Name>
                                    <S.LastMsg>
                                        {c.last_message?.text ||
                                            "Click to chat"}
                                    </S.LastMsg>
                                </div>
                            </S.ListItem>
                        );
                    })}
                </S.ListContainer>
            </S.Sidebar>

            <S.ChatWindow $isActive={!!activeChat}>
                {activeChat ? (
                    <>
                        <S.ChatHeader>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <S.BackBtn onClick={() => setActiveChat(null)}>
                                    ←
                                </S.BackBtn>
                                <S.Avatar
                                    src={
                                        activeChat.other_user
                                            ?.profile_picture ||
                                        "https://via.placeholder.com/150"
                                    }
                                    style={{
                                        width: 40,
                                        height: 40,
                                        marginRight: 10,
                                    }}
                                />
                                <h3>
                                    {activeChat.other_user?.full_name ||
                                        activeChat.other_user?.username}
                                </h3>
                            </div>
                        </S.ChatHeader>

                        <S.MessagesBox>
                            {messages.map((msg, idx) => (
                                <S.MessageBubble
                                    key={idx}
                                    $isOwn={msg.sender === userData?.id}
                                >
                                    {msg.text}
                                    <S.Time>
                                        {(() => {
                                            const timeString =
                                                msg.timestamp || msg.created_at;
                                            if (!timeString) return "";
                                            const date = new Date(timeString);
                                            return isNaN(date.getTime())
                                                ? ""
                                                : date.toLocaleTimeString([], {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  });
                                        })()}
                                    </S.Time>
                                </S.MessageBubble>
                            ))}
                            <div ref={messagesEndRef} />
                        </S.MessagesBox>

                        <S.InputArea onSubmit={handleSendMessage}>
                            <S.Input
                                placeholder="Type a message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <S.SendBtn type="submit">Send</S.SendBtn>
                        </S.InputArea>
                    </>
                ) : (
                    <S.EmptyState>
                        <h3>Byway Messsages</h3>
                        <p>Select a contact to start chatting</p>
                    </S.EmptyState>
                )}
            </S.ChatWindow>
        </S.Container>
    );
}
