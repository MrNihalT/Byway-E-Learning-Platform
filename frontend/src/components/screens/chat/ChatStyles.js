import styled from "styled-components";

/* ─────────────────────────────────────────────
   BYWAY CHAT — Light Professional Theme
   Matching the white header (#ffffff)
───────────────────────────────────────────── */

export const Container = styled.div`
    display: flex;
    height: 90vh;
    max-width: 1600px;
    margin: 0 auto;
    background: #f1f5f9;
    overflow: hidden;
    border-top: 1px solid #e2e8f0;

    @media (max-width: 768px) {
        height: calc(100vh - 65px);
        width: 100%;
        margin: 0;
    }
`;

/* ── Sidebar ──────────────────────────────── */
export const Sidebar = styled.div`
    width: 30%;
    min-width: 300px;
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 100%;
        display: ${(props) =>
            props.$isActive ? "none !important" : "flex !important"};
    }
`;

export const SidebarHeader = styled.div`
    padding: 16px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    & > div:first-child {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.01em;
        }
    }
`;

/* Tab buttons (Direct / Groups) */
export const TabContainer = styled.div`
    display: flex;
    gap: 6px;
    background: #f1f5f9;
    border-radius: 10px;
    padding: 4px;
`;

export const TabBtn = styled.button`
    flex: 1;
    padding: 7px 12px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: ${(p) => (p.$active ? "#3b82f6" : "transparent")};
    color: ${(p) => (p.$active ? "#ffffff" : "#64748b")};
    box-shadow: ${(p) =>
        p.$active ? "0 2px 8px rgba(59,130,246,0.25)" : "none"};

    &:hover {
        background: ${(p) => (p.$active ? "#2563eb" : "#e2e8f0")};
        color: ${(p) => (p.$active ? "#fff" : "#334155")};
    }
`;

/* Filter chips */
export const FilterContainer = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
`;

export const FilterBtn = styled.button`
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid ${(p) => (p.$active ? "#3b82f6" : "#e2e8f0")};
    background: ${(p) => (p.$active ? "#eff6ff" : "#ffffff")};
    color: ${(p) => (p.$active ? "#2563eb" : "#64748b")};
    transition: all 0.15s;

    &:hover {
        border-color: #3b82f6;
        color: #2563eb;
    }
`;

/* Conversation list */
export const ListContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    background: #ffffff;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }
`;

export const ListItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    position: relative;
    background: ${(p) => (p.$active ? "#eff6ff" : "transparent")};
    border-left: 3px solid ${(p) => (p.$active ? "#3b82f6" : "transparent")};
    transition: background 0.15s;

    &:hover {
        background: #f8fafc;
    }

    &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 72px;
        right: 0;
        height: 1px;
        background: #f1f5f9;
        display: ${(p) => (p.$active ? "none" : "block")};
    }
`;

export const Avatar = styled.img`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    margin-right: 14px;
    object-fit: cover;
    flex-shrink: 0;
    border: 2px solid #e2e8f0;
`;

export const GroupAvatar = styled.div`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    margin-right: 14px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
`;

export const Name = styled.h4`
    margin: 0 0 3px;
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
`;

export const LastMsg = styled.p`
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    line-height: 1.4;
`;

/* ── Chat Window ──────────────────────────── */
export const ChatWindow = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    position: relative;

    @media (max-width: 768px) {
        display: ${(props) =>
            props.$isActive ? "flex !important" : "none !important"};
        width: 100%;
        height: 100%;
    }
`;

export const ChatHeader = styled.div`
    padding: 12px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

    h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
    }

    small {
        color: #94a3b8;
        font-size: 12px;
    }
`;

export const MessagesBox = styled.div`
    flex: 1;
    padding: 24px 60px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

export const MessageBubble = styled.div`
    max-width: 62%;
    padding: 10px 14px 8px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.55;
    position: relative;
    display: flex;
    flex-direction: column;

    align-self: ${(p) => (p.$isOwn ? "flex-end" : "flex-start")};

    background: ${(p) =>
        p.$isOwn ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "#ffffff"};
    color: ${(p) => (p.$isOwn ? "#ffffff" : "#1e293b")};

    border-top-right-radius: ${(p) => (p.$isOwn ? "4px" : "16px")};
    border-top-left-radius: ${(p) => (!p.$isOwn ? "4px" : "16px")};

    box-shadow: ${(p) =>
        p.$isOwn
            ? "0 4px 12px rgba(37, 99, 235, 0.25)"
            : "0 1px 4px rgba(0, 0, 0, 0.07)"};
`;

export const Time = styled.span`
    font-size: 10.5px;
    color: ${(p) => (p.$isOwn ? "rgba(255,255,255,0.65)" : "#94a3b8")};
    align-self: flex-end;
    margin-top: 4px;
    margin-left: 12px;
`;

/* ── Input Area ───────────────────────────── */
export const InputArea = styled.form`
    padding: 12px 20px;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 64px;
`;

export const Input = styled.input`
    flex: 1;
    padding: 12px 18px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    font-size: 14px;
    background: #f8fafc;
    color: #0f172a;
    transition:
        border-color 0.2s,
        background 0.2s;

    &:focus {
        outline: none;
        border-color: #93c5fd;
        background: #ffffff;
    }

    &::placeholder {
        color: #94a3b8;
    }
`;

export const SendBtn = styled.button`
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    font-size: 0;

    &::after {
        content: "➤";
        font-size: 16px;
        color: #fff;
    }

    &:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    &:active {
        transform: scale(0.96);
    }
`;

export const EmptyState = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    background: #f8fafc;

    &::before {
        content: "💬";
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.6;
    }

    h3 {
        font-size: 18px;
        font-weight: 700;
        color: #334155;
        margin: 0 0 8px;
    }

    p {
        font-size: 14px;
        color: #94a3b8;
        margin: 0;
    }
`;

/* ── Buttons & Actions ────────────────────── */
export const ActionBtn = styled.button`
    padding: 8px;
    background: transparent;
    color: #2563eb;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
        color: #1d4ed8;
        text-decoration: underline;
    }
`;

export const HeaderActionBtn = styled.button`
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 8px;
    border: 1px solid ${(p) => (p.$danger ? "#fecaca" : "#e2e8f0")};
    cursor: pointer;
    font-weight: 600;
    background: ${(p) => (p.$danger ? "#fff1f2" : "#f8fafc")};
    color: ${(p) => (p.$danger ? "#dc2626" : "#64748b")};
    margin-left: 8px;
    transition: all 0.15s;

    &:hover {
        background: ${(p) => (p.$danger ? "#fee2e2" : "#f1f5f9")};
        color: ${(p) => (p.$danger ? "#b91c1c" : "#334155")};
    }
`;

export const BackBtn = styled.button`
    display: none;
    background: transparent;
    border: none;
    font-size: 22px;
    color: #64748b;
    cursor: pointer;
    margin-right: 10px;
    padding: 0;
    transition: color 0.15s;

    &:hover {
        color: #0f172a;
    }

    @media (max-width: 768px) {
        display: block;
    }
`;

/* ── Modals ───────────────────────────────── */
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

export const ModalContent = styled.div`
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 28px;
    border-radius: 16px;
    width: 440px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #0f172a;
        font-size: 18px;
        font-weight: 700;
    }
`;

export const ModalInput = styled.input`
    width: 100%;
    padding: 11px 14px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: #f8fafc;
    color: #0f172a;
    box-sizing: border-box;
    transition: border-color 0.2s;

    &::placeholder {
        color: #94a3b8;
    }

    &:focus {
        border-color: #93c5fd;
        outline: none;
        background: #ffffff;
    }
`;

export const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
`;

export const CancelBtn = styled.button`
    padding: 8px 18px;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    cursor: pointer;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s;

    &:hover {
        background: #f1f5f9;
        color: #334155;
    }
`;

export const CreateBtn = styled.button`
    padding: 8px 24px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    transition: all 0.2s;

    &:hover {
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        transform: translateY(-1px);
    }
`;

export const UserList = styled.div`
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 15px;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 4px;
    }
`;

export const UserItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    background: ${(p) => (p.$selected ? "#eff6ff" : "#ffffff")};
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;

    &:hover {
        background: #f8fafc;
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const SelectedContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
`;

export const MemberChip = styled.div`
    background: #eff6ff;
    color: #2563eb;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid #bfdbfe;
`;

export const RemoveBtn = styled.button`
    background: transparent;
    border: none;
    color: #ef4444;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.15s;

    &:hover {
        color: #dc2626;
    }
`;

export const AdminBadge = styled.span`
    background: #f0f9ff;
    color: #0284c7;
    font-size: 10px;
    padding: 2px 7px;
    border-radius: 20px;
    margin-left: 8px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid #bae6fd;
`;
