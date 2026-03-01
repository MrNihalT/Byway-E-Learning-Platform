import React, { useState, useEffect, useContext, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../../api";
import { UserContext } from "../../includes/UserProvider";
import * as S from "./ChatStyles";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function GroupChat({ activeTab, setActiveTab }) {
    const { userData } = useContext(UserContext);

    const getUserId = () => {
        if (userData?.id) return userData.id;
        if (userData?.access) {
            try {
                const decoded = jwtDecode(userData.access);
                return decoded.user_id;
            } catch (e) {
                return null;
            }
        }
        return null;
    };
    const myId = getUserId();

    const [groups, setGroups] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDesc, setNewGroupDesc] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchGroups();
        const interval = setInterval(fetchGroups, 5000);
        return () => clearInterval(interval);
    }, []);

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

    const fetchGroups = async () => {
        try {
            const res = await api.get("chat/groups/");
            setGroups(res.data);

            if (activeChat) {
                const updated = res.data.find((g) => g.id === activeChat.id);
                if (
                    updated &&
                    JSON.stringify(updated) !== JSON.stringify(activeChat)
                ) {
                    setActiveChat(updated);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await api.get(`chat/groups/${id}/messages/`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    console.log(messages);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(
                `chat/groups/${activeChat.id}/messages/`,
                { text: newMessage },
            );
            setMessages([...messages, res.data]);
            setNewMessage("");
            fetchGroups();
        } catch (err) {
            toast.error("Failed to send");
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName) return toast.error("Name required");
        try {
            await api.post("chat/groups/create/", {
                name: newGroupName,
                description: newGroupDesc,
                members: selectedMembers.map((u) => u.id),
            });
            setShowCreateModal(false);
            setNewGroupName("");
            setNewGroupDesc("");
            setSelectedMembers([]);
            fetchGroups();
            toast.success("Group Created!");
        } catch (err) {
            toast.error("Error creating group");
        }
    };

    const handleAddMembers = async () => {
        try {
            await api.post(`chat/groups/${activeChat.id}/add_members/`, {
                members: selectedMembers.map((u) => u.id),
            });
            setShowAddModal(false);
            setSelectedMembers([]);
            setSearchQuery("");
            fetchGroups();
            toast.success("Members Added");
        } catch (err) {
            toast.error("Error adding members");
        }
    };

    const handleRemoveMember = async (userId) => {
        const result = await MySwal.fire({
            title: "Remove Member?",
            text: "This user will be removed from the group.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, remove!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.post(`chat/groups/${activeChat.id}/remove_member/`, {
                user_id: userId,
            });
            fetchGroups();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error");
        }
    };

    const handleLeaveGroup = async () => {
        const result = await MySwal.fire({
            title: "Leave Group?",
            text: "You will no longer receive messages from this group.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, leave!",
            cancelButtonText: "Stay",
        });
        if (!result.isConfirmed) return;
        try {
            await api.post(`chat/groups/${activeChat.id}/leave/`);
            setActiveChat(null);
            fetchGroups();
            setShowInfoModal(false);
        } catch (err) {
            toast.error("Error leaving");
        }
    };

    const handleSearchUsers = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            try {
                const res = await api.get(`chat/users/search/?q=${query}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error(err);
            }
        } else setSearchResults([]);
    };
    const toggleMember = (user) => {
        if (selectedMembers.find((u) => u.id === user.id)) {
            setSelectedMembers(selectedMembers.filter((u) => u.id !== user.id));
        } else {
            setSelectedMembers([...selectedMembers, user]);
        }
    };

    return (
        <S.Container>
            <S.Sidebar $isActive={!!activeChat}>
                <S.SidebarHeader>
                    <div>
                        <h3>Messages</h3>
                        <S.ActionBtn onClick={() => setShowCreateModal(true)}>
                            + New Group
                        </S.ActionBtn>
                    </div>

                    <S.TabContainer>
                        <S.TabBtn
                            $active={false}
                            onClick={() => setActiveTab("chats")}
                        >
                            Direct
                        </S.TabBtn>
                        <S.TabBtn $active={true}>Groups</S.TabBtn>
                    </S.TabContainer>

                    <div style={{ padding: "0 5px" }}>
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #dfe5e7",
                                background: "#f0f2f5",
                                outline: "none",
                                fontSize: "14px",
                            }}
                        />
                    </div>
                </S.SidebarHeader>

                <S.ListContainer>
                    {groups
                        .filter((g) =>
                            g.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                        )
                        .map((group) => (
                            <S.ListItem
                                key={group.id}
                                $active={activeChat?.id === group.id}
                                onClick={() => setActiveChat(group)}
                            >
                                <S.GroupAvatar>
                                    {group.name.charAt(0).toUpperCase()}
                                </S.GroupAvatar>
                                <div>
                                    <S.Name>{group.name}</S.Name>
                                    <S.LastMsg>
                                        {group.description || "No description"}
                                    </S.LastMsg>
                                </div>
                            </S.ListItem>
                        ))}
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
                                <S.GroupAvatar
                                    style={{
                                        width: 40,
                                        height: 40,
                                        marginRight: 10,
                                    }}
                                >
                                    {activeChat.name.charAt(0).toUpperCase()}
                                </S.GroupAvatar>
                                <div>
                                    <h3>{activeChat.name}</h3>
                                    <small>
                                        {activeChat.members?.length || 0}{" "}
                                        members
                                    </small>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <S.HeaderActionBtn
                                    onClick={() => setShowInfoModal(true)}
                                >
                                    Info
                                </S.HeaderActionBtn>
                                <S.HeaderActionBtn
                                    onClick={() => setShowAddModal(true)}
                                >
                                    + Member
                                </S.HeaderActionBtn>
                            </div>
                        </S.ChatHeader>

                        <S.MessagesBox>
                            {messages.map((msg, idx) => (
                                <S.MessageBubble
                                    key={idx}
                                    $isOwn={String(msg.sender) === String(myId)}
                                >
                                    {String(msg.sender) !== String(myId) && (
                                        <b
                                            style={{
                                                fontSize: "12px",
                                                color: "#e542a3",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {msg.sender.username || "User"}
                                        </b>
                                    )}
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
                        <h3>Byway Groups</h3>
                        <p>Select a group to start chatting</p>
                    </S.EmptyState>
                )}
            </S.ChatWindow>
            {showCreateModal && (
                <S.ModalOverlay>
                    <S.ModalContent>
                        <h3>New Group</h3>
                        <S.ModalInput
                            placeholder="Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <S.ModalInput
                            placeholder="Description"
                            value={newGroupDesc}
                            onChange={(e) => setNewGroupDesc(e.target.value)}
                        />
                        <h4>Add Members</h4>
                        <S.ModalInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchUsers}
                        />
                        <S.UserList>
                            {searchResults.map((u) => (
                                <S.UserItem
                                    key={u.id}
                                    $selected={selectedMembers.find(
                                        (m) => m.id === u.id,
                                    )}
                                    onClick={() => toggleMember(u)}
                                >
                                    <S.Avatar
                                        src={
                                            u.profile_picture ||
                                            "https://via.placeholder.com/30"
                                        }
                                    />{" "}
                                    {u.username}
                                </S.UserItem>
                            ))}
                        </S.UserList>
                        <S.SelectedContainer>
                            {selectedMembers.map((u) => (
                                <S.MemberChip key={u.id}>
                                    {u.username}
                                </S.MemberChip>
                            ))}
                        </S.SelectedContainer>
                        <S.ModalActions>
                            <S.CancelBtn
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </S.CancelBtn>
                            <S.CreateBtn onClick={handleCreateGroup}>
                                Create
                            </S.CreateBtn>
                        </S.ModalActions>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
            {showAddModal && (
                <S.ModalOverlay>
                    <S.ModalContent>
                        <h3>Add Members</h3>
                        <S.ModalInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchUsers}
                        />
                        <S.UserList>
                            {searchResults.map((u) => (
                                <S.UserItem
                                    key={u.id}
                                    $selected={selectedMembers.find(
                                        (m) => m.id === u.id,
                                    )}
                                    onClick={() => toggleMember(u)}
                                >
                                    <S.Avatar
                                        src={
                                            u.profile_picture ||
                                            "https://via.placeholder.com/30"
                                        }
                                    />{" "}
                                    {u.username}
                                </S.UserItem>
                            ))}
                        </S.UserList>
                        <S.ModalActions>
                            <S.CancelBtn onClick={() => setShowAddModal(false)}>
                                Cancel
                            </S.CancelBtn>
                            <S.CreateBtn onClick={handleAddMembers}>
                                Add
                            </S.CreateBtn>
                        </S.ModalActions>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
            {showInfoModal && activeChat && (
                <S.ModalOverlay onClick={() => setShowInfoModal(false)}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <h3>{activeChat.name}</h3>
                        <p>{activeChat.description}</p>

                        <h4>Members ({activeChat.members?.length})</h4>

                        <S.UserList>
                            {activeChat.members?.map((m) => (
                                <S.UserItem
                                    key={m.id}
                                    style={{ justifyContent: "space-between" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <S.Avatar
                                            src={
                                                m.profile_picture ||
                                                "https://via.placeholder.com/30"
                                            }
                                        />
                                        <div>
                                            <span
                                                style={{ fontWeight: "bold" }}
                                            >
                                                {m.username}
                                            </span>
                                            {String(m.id) ===
                                                String(activeChat.admin_id) && (
                                                <S.AdminBadge>
                                                    Admin
                                                </S.AdminBadge>
                                            )}
                                        </div>
                                    </div>

                                    {String(activeChat.admin_id) ===
                                        String(myId) &&
                                        String(m.id) !== String(myId) && (
                                            <S.RemoveBtn
                                                onClick={() =>
                                                    handleRemoveMember(m.id)
                                                }
                                            >
                                                Remove
                                            </S.RemoveBtn>
                                        )}
                                </S.UserItem>
                            ))}
                        </S.UserList>

                        <S.ModalActions>
                            <S.HeaderActionBtn
                                $danger
                                onClick={handleLeaveGroup}
                            >
                                Exit Group
                            </S.HeaderActionBtn>
                        </S.ModalActions>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.Container>
    );
}
