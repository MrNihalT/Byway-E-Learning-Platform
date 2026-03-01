import React, { useState } from "react";
import Header from "../../includes/Header";
import DirectChat from "./DirectChat";
import GroupChat from "./GroupChat";

export default function Chat() {
    const [activeTab, setActiveTab] = useState("chats");

    return (
        <>
            <Header />
            {activeTab === "chats" ? (
                <DirectChat activeTab={activeTab} setActiveTab={setActiveTab} />
            ) : (
                <GroupChat activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
        </>
    );
}
