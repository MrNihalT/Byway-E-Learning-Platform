import React, { useEffect, useRef, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import MenuIcon from "../assets/icons/menu.png";

import { UserContext } from "./UserProvider";

export default function Header() {
    const { updateUserData, userData } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserData({ type: "LOGOUT" });
        navigate("/");
        setMenu(false);
    };

    const isLoggedin = userData && userData.access;
    const isInstructor = userData && userData.role === "instructor";
    const isSuperuser = isLoggedin && userData.is_superuser;
    const user = localStorage.getItem("user_data");

    const menuRef = useRef();
    const adminDropdownRef = useRef();
    const instructorDropdownRef = useRef();
    let [menu, setMenu] = useState(false);
    const [adminDropdown, setAdminDropdown] = useState(false);
    const [instructorDropdown, setInstructorDropdown] = useState(false);

    const MenuToggle = () => {
        setMenu((prev) => !prev);
    };
    const effectCounter = useRef(0);
    const renderCounter = useRef(0);

    renderCounter.current += 1;
    console.log("Header rendered:", renderCounter.current, "times");

    useEffect(() => {
        effectCounter.current += 1;
        console.log("useEffect ran:", effectCounter.current, "times");

        const handleclickoutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenu(false);
            }
            if (
                adminDropdownRef.current &&
                !adminDropdownRef.current.contains(event.target)
            ) {
                setAdminDropdown(false);
            }
            if (
                instructorDropdownRef.current &&
                !instructorDropdownRef.current.contains(event.target)
            ) {
                setInstructorDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleclickoutside);

        return () => {
            document.removeEventListener("mousedown", handleclickoutside);
        };
    }, []);
    return (
        <>
            <HeaderContainer>
                <Wrapper className="wrapper">
                    <NavContainer>
                        <NavLeftContainer>
                            <Link className="NavLeft" to={"/"}>
                                <h3>
                                    <Logo
                                        src={
                                            require("../assets/icons/logo.svg")
                                                .default
                                        }
                                        alt="Byway"
                                    />
                                </h3>
                                <BrandName>Byway</BrandName>
                            </Link>
                        </NavLeftContainer>

                        <NavRightContainer>
                            <Link
                                to={"/my-learning"}
                                className="createNewPostBtn"
                            >
                                <CreateNewPost>My Learning</CreateNewPost>
                            </Link>
                            <Link
                                to={"/student/certificates"}
                                className="createNewPostBtn"
                            >
                                <CreateNewPost>My Certificates</CreateNewPost>
                            </Link>
                            <Link
                                to={"/my-assignments"}
                                className="createNewPostBtn"
                            >
                                <CreateNewPost>Assignments</CreateNewPost>
                            </Link>
                            <Link to={"/community"}>
                                <CreateNewPost>Community</CreateNewPost>
                            </Link>

                            {isSuperuser && (
                                <DropdownContainer ref={adminDropdownRef}>
                                    <DropdownBtn
                                        onClick={() =>
                                            setAdminDropdown(!adminDropdown)
                                        }
                                    >
                                        Admin{" "}
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                marginLeft: "5px",
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </DropdownBtn>
                                    <DropdownMenu $isOpen={adminDropdown}>
                                        <DropdownItem to={"/admin/courses"}>
                                            All Courses
                                        </DropdownItem>
                                        <DropdownItem to={"/admin-dashboard"}>
                                            Admin Dashboard
                                        </DropdownItem>
                                        <DropdownItem
                                            to={"/admin/instructor-requests"}
                                        >
                                            Instructor Requests
                                        </DropdownItem>
                                        <DropdownItem to={"/admin/support"}>
                                            Support Requests
                                        </DropdownItem>
                                        <DropdownItem to={"/report"}>
                                            Report
                                        </DropdownItem>
                                    </DropdownMenu>
                                </DropdownContainer>
                            )}

                            {isInstructor && (
                                <DropdownContainer ref={instructorDropdownRef}>
                                    <DropdownBtn
                                        onClick={() =>
                                            setInstructorDropdown(
                                                !instructorDropdown,
                                            )
                                        }
                                    >
                                        Instructor{" "}
                                        <span
                                            style={{
                                                fontSize: "10px",
                                                marginLeft: "5px",
                                            }}
                                        >
                                            ▼
                                        </span>
                                    </DropdownBtn>
                                    <DropdownMenu $isOpen={instructorDropdown}>
                                        <DropdownItem
                                            to={"/instructor/dashboard"}
                                        >
                                            Dashboard
                                        </DropdownItem>

                                        <DropdownItem to={"/my_courses"}>
                                            My Courses
                                        </DropdownItem>
                                        <DropdownItem
                                            to={"/instructor/grading"}
                                        >
                                            Grading
                                        </DropdownItem>
                                    </DropdownMenu>
                                </DropdownContainer>
                            )}

                            {/* Icons */}
                            {user && (
                                <Link to={"/wishlist"} className="icons">
                                    <WishListIcon
                                        src={
                                            require("../assets/icons/favorate.svg")
                                                .default
                                        }
                                    />
                                </Link>
                            )}

                            <Link to={"/cart"} className="icons">
                                <CartIcon
                                    src={
                                        require("../assets/icons/cart.svg")
                                            .default
                                    }
                                />
                            </Link>

                            {user && (
                                <>
                                    <Link to={"/chat"} className="icons">
                                        <MessageIcon
                                            src={
                                                require("../assets/icons/message.svg")
                                                    .default
                                            }
                                        />
                                    </Link>

                                    <Link to={"/profile"}>
                                        <AccoutLogo>
                                            {userData.profile_picture ? (
                                                <AccountLogoImg
                                                    src={
                                                        userData.profile_picture
                                                    }
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <AccountLogoImg
                                                    src={
                                                        require("../assets/icons/user.svg")
                                                            .default
                                                    }
                                                    alt="Profile"
                                                />
                                            )}
                                        </AccoutLogo>
                                    </Link>
                                </>
                            )}

                            {user ? (
                                <Link
                                    className="LogOutBtn"
                                    onClick={handleSubmit}
                                >
                                    Log Out
                                </Link>
                            ) : (
                                <>
                                    <Link to={"/login"} className="LogInBtn">
                                        Log In
                                    </Link>
                                    <Link to={"/signup"} className="SignUpBtn">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </NavRightContainer>

                        <NavRightMobileContainer>
                            <ButtonMenu onClick={MenuToggle}>
                                <MenuImg src={MenuIcon} />
                            </ButtonMenu>

                            <MobileMenuItems
                                ref={menuRef}
                                className={menu ? "open" : ""}
                            >
                                <CloseBtn onClick={() => setMenu(false)}>
                                    &times;
                                </CloseBtn>

                                {user && (
                                    <MobileProfileLink
                                        to={"/profile"}
                                        onClick={() => setMenu(false)}
                                    >
                                        <AccoutLogo
                                            style={{
                                                margin: "0 auto 10px auto",
                                            }}
                                        >
                                            {userData.profile_picture ? (
                                                <AccountLogoImg
                                                    src={
                                                        userData.profile_picture
                                                    }
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <AccountLogoImg
                                                    src={
                                                        require("../assets/icons/user.svg")
                                                            .default
                                                    }
                                                    alt="Profile"
                                                />
                                            )}
                                        </AccoutLogo>
                                        <span>My Profile</span>
                                    </MobileProfileLink>
                                )}

                                <MobileDivider />

                                <MobileLink
                                    to={"/my-learning"}
                                    onClick={() => setMenu(false)}
                                >
                                    My Learning
                                </MobileLink>
                                <MobileLink
                                    to={"/student/certificates"}
                                    onClick={() => setMenu(false)}
                                >
                                    My Certificates
                                </MobileLink>
                                <MobileLink
                                    to={"/my-assignments"}
                                    onClick={() => setMenu(false)}
                                >
                                    Assignments
                                </MobileLink>
                                <MobileLink
                                    to={"/community"}
                                    onClick={() => setMenu(false)}
                                >
                                    Community
                                </MobileLink>

                                {isInstructor && !isSuperuser && (
                                    <>
                                        <MobileLink
                                            to={"/my_courses"}
                                            onClick={() => setMenu(false)}
                                        >
                                            My Courses
                                        </MobileLink>
                                        <MobileLink
                                            to={"/instructor/grading"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Grading
                                        </MobileLink>
                                    </>
                                )}

                                {isSuperuser && (
                                    <>
                                        <MobileLink
                                            to={"/admin/courses"}
                                            onClick={() => setMenu(false)}
                                        >
                                            All Courses
                                        </MobileLink>
                                        <MobileLink
                                            to={"/admin-dashboard"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Admin Dashboard
                                        </MobileLink>
                                        <MobileLink
                                            to={"/admin/instructor-requests"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Instructor Requests
                                        </MobileLink>
                                        <MobileLink
                                            to={"/admin/support"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Support Requests
                                        </MobileLink>
                                        <MobileLink
                                            to={"/report"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Report
                                        </MobileLink>
                                    </>
                                )}

                                {isInstructor && (
                                    <>
                                        <MobileLink
                                            to={"/instructor/dashboard"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Dashboard
                                        </MobileLink>
                                        <MobileLink
                                            to={"/create_post"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Create Course
                                        </MobileLink>
                                    </>
                                )}

                                <MobileDivider />

                                {user && (
                                    <MobileLink
                                        to={"/wishlist"}
                                        onClick={() => setMenu(false)}
                                    >
                                        Wishlist
                                    </MobileLink>
                                )}
                                <MobileLink
                                    to={"/cart"}
                                    onClick={() => setMenu(false)}
                                >
                                    Cart
                                </MobileLink>
                                {user && (
                                    <>
                                        <MobileLink
                                            to={"/chat"}
                                            onClick={() => setMenu(false)}
                                        >
                                            Messages
                                        </MobileLink>
                                    </>
                                )}

                                <MobileDivider />

                                {user ? (
                                    <MobileLogoutBtn onClick={handleSubmit}>
                                        Log Out
                                    </MobileLogoutBtn>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                            width: "100%",
                                        }}
                                    >
                                        <Link
                                            to={"/login"}
                                            className="LogInBtn"
                                            onClick={() => setMenu(false)}
                                            style={{ textAlign: "center" }}
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            to={"/signup"}
                                            className="SignUpBtn"
                                            onClick={() => setMenu(false)}
                                            style={{ textAlign: "center" }}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </MobileMenuItems>
                        </NavRightMobileContainer>
                    </NavContainer>
                </Wrapper>
            </HeaderContainer>
        </>
    );
}

const HeaderContainer = styled.header`
    display: flex;
    height: 65px;
    background: #ffffff;
    align-items: center;
    width: 100%;
    border: 1px solid #e2e8f0;
    position: sticky; /* Helps with mobile scrolling */
    top: 0;
    z-index: 999;
`;

const Wrapper = styled.div``;

const NavContainer = styled.nav`
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
`;

const NavLeftContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Logo = styled.img`
    width: 31px;
    height: 40px;
`;

const BrandName = styled.h3`
    font-weight: 500;
    font-size: 18px;
    color: #334155;
`;

const CreateNewPost = styled.h3`
    font-weight: 600;
    font-size: 14px;
    color: #000;
    @media all and (max-width: 1280px) {
        font-size: 12px;
    }
`;

const NavRightContainer = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: center;
    @media all and (max-width: 980px) {
        display: none;
    }
`;

const WishListIcon = styled.img`
    height: 24px;
    width: 24px;
`;

const CartIcon = styled.img`
    height: 24px;
    width: 24px;
`;

const NotificationIcon = styled.img`
    height: 24px;
    width: 24px;
`;

const MessageIcon = styled.img`
    height: 24px;
    width: 24px;
`;

const AccoutLogo = styled.div`
    background: #334155;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    color: #ffffff;
    font-weight: 500;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const AccountLogoImg = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

// --- MOBILE STYLES ---

const NavRightMobileContainer = styled.div`
    display: none;
    @media all and (max-width: 980px) {
        display: block;
    }
`;

const ButtonMenu = styled.button`
    background: none;
    border: none;
    cursor: pointer;
`;

const MenuImg = styled.img`
    width: 24px;
    height: 24px;
`;

const MobileMenuItems = styled.div`
    position: fixed;
    background: #ffffff;
    top: 0;
    right: 0;
    width: 250px;
    height: 100vh;
    padding: 60px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    color: #334155;
    z-index: 1000;
    align-items: flex-start; /* Align text to left */
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    overflow-y: auto; /* Scrollable if menu is long */

    &.open {
        transform: translateX(0);
    }
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 2rem;
    color: #334155;
    cursor: pointer;
    line-height: 1;
`;

const MobileLink = styled(Link)`
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    color: #334155;
    width: 100%;
    padding: 8px 0;

    &:hover {
        color: #3b82f6; /* Blue hover */
    }
`;

const MobileProfileLink = styled(Link)`
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    color: #334155;
    font-weight: 600;
    margin-bottom: 10px;
`;

const MobileDivider = styled.hr`
    width: 100%;
    border: 0;
    border-top: 1px solid #e2e8f0;
    margin: 5px 0;
`;

const MobileLogoutBtn = styled.button`
    background: #fee2e2;
    color: #dc2626;
    border: none;
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background: #fecaca;
    }
`;

// --- DROPDOWN STYLES ---

const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownBtn = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    color: #000;
    display: flex;
    align-items: center;
    padding: 0;

    @media all and (max-width: 1280px) {
        font-size: 12px;
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #ffffff;
    min-width: 180px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 0;
    margin-top: 10px;
    display: ${(props) => (props.$isOpen ? "block" : "none")};

    &::before {
        content: "";
        position: absolute;
        top: -6px;
        right: 10px;
        width: 12px;
        height: 12px;
        background: #ffffff;
        transform: rotate(45deg);
        border-top: 1px solid #e2e8f0;
        border-left: 1px solid #e2e8f0;
    }
`;

const DropdownItem = styled(Link)`
    color: #334155;
    padding: 10px 16px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    font-weight: 500;

    &:hover {
        background-color: #f1f5f9;
        color: #3b82f6;
    }
`;
