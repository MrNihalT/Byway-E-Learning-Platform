import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const updateUserData = (action) => {
        switch (action.type) {
            case "LOGOUT":
                setUserData(null);
                localStorage.clear();
                break;
            case "LOGIN":
                setUserData(action.payload);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user_data");
        if (storedUser) {
            setUserData(JSON.parse(storedUser));
        }
    }, []);
    return (
        <UserContext.Provider value={{ userData, updateUserData }}>
            {children}
        </UserContext.Provider>
    );
};
