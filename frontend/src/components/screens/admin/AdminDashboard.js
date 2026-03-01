import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../includes/UserProvider";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api";
import styled from "styled-components";
import Header from "../../includes/Header";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function PayoutsSection() {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [monthFilter, setMonthFilter] = useState("");

    useEffect(() => {
        fetchPayouts();
    }, [statusFilter, monthFilter]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            let url = `course/admin/payouts/?status=${statusFilter}`;
            if (monthFilter) url += `&month=${monthFilter}`;
            const res = await api.get(url);
            setPayouts(res.data);
        } catch (err) {
            console.error("Error fetching payouts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id) => {
        const result = await MySwal.fire({
            title: "Mark as Paid?",
            text: "Confirm you have transferred the money to this instructor.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, mark as Paid!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;
        try {
            await api.post(`course/admin/payouts/${id}/pay/`);

            setPayouts((prev) => prev.filter((p) => p.id !== id));
            toast.success("Status updated to PAID.");
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    const handleGenerate = async () => {
        const targetMonth = monthFilter || new Date().toISOString().slice(0, 7);

        const result = await MySwal.fire({
            title: "Calculate Earnings?",
            text: `Generate payout records for ${targetMonth}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, calculate!",
            cancelButtonText: "Cancel",
        });
        if (!result.isConfirmed) return;

        try {
            const res = await api.post("course/admin/payouts/generate/", {
                month: targetMonth,
            });

            toast.info(
                `${res.data.message}\nRecords Created: ${
                    res.data.records_created
                }\nUpdated: ${res.data.updated || 0}`,
            );

            fetchPayouts();
        } catch (err) {
            console.error(err);
            toast.error("Error generating payouts. Check console.");
        }
    };

    return (
        <SectionContainer>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <SectionTitle style={{ marginTop: 0 }}>
                    Instructor Payouts
                </SectionTitle>
                <GenerateBtn onClick={handleGenerate}>
                    ⚡ Calculate Last Month
                </GenerateBtn>
            </div>

            <FilterBar>
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="PENDING">Pending Payments</option>
                    <option value="PAID">Payment History (Paid)</option>
                </Select>
                <Input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={{ width: "auto" }}
                />
            </FilterBar>

            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Instructor</th>
                            <th>Bank Details</th>
                            <th>Month</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : payouts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            payouts.map((pay) => (
                                <tr key={pay.id}>
                                    <td>
                                        <strong>
                                            {pay.instructor.full_name}
                                        </strong>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#666",
                                            }}
                                        >
                                            {pay.instructor.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "13px" }}>
                                            <span style={{ color: "#64748b" }}>
                                                Acc:
                                            </span>{" "}
                                            <strong>
                                                {pay.instructor.bank_account_no}
                                            </strong>
                                        </div>
                                        <div style={{ fontSize: "13px" }}>
                                            <span style={{ color: "#64748b" }}>
                                                IFSC:
                                            </span>{" "}
                                            {pay.instructor.bank_ifsc_code}
                                        </div>
                                    </td>
                                    <td>{pay.month}</td>
                                    <td>
                                        <span
                                            style={{
                                                color: "#16a34a",
                                                fontWeight: "bold",
                                                fontSize: "15px",
                                            }}
                                        >
                                            ${pay.amount}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge
                                            isDraft={pay.status === "PENDING"}
                                        >
                                            {pay.status}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        {pay.status === "PENDING" && (
                                            <PayButton
                                                onClick={() =>
                                                    handleMarkPaid(pay.id)
                                                }
                                            >
                                                Mark Paid
                                            </PayButton>
                                        )}
                                        {pay.status === "PAID" && (
                                            <span style={{ color: "#16a34a" }}>
                                                ✓ Done
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </StyledTable>
            </TableWrapper>
        </SectionContainer>
    );
}

function CreateCategoryForm({ onCategoryAdded, onClose }) {
    const [name, setName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !imageFile) {
            setError("Both name and image are required.");
            return;
        }
        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category_img", imageFile);

        try {
            const response = await api.post(
                "course/admin/categories/create/",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            onCategoryAdded(response.data);
        } catch (err) {
            setError(err.response?.data?.data || "Failed to create category.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormContainer>
            <FormHeading>Add New Category</FormHeading>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <StyledForm onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="cat_name">Category Name</Label>
                    <Input
                        type="text"
                        id="cat_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="cat_image">Category Image</Label>
                    <FileInput
                        type="file"
                        id="cat_image"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        required
                    />
                </FormGroup>
                <ButtonGroup>
                    <CancelButton
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Category"}
                    </SubmitButton>
                </ButtonGroup>
            </StyledForm>
        </FormContainer>
    );
}

function EditCategoryForm({ category, onCategoryUpdated, onClose }) {
    const [name, setName] = useState(category.name);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(category.category_img);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        if (imageFile) {
            formData.append("category_img", imageFile);
        }

        try {
            const response = await api.put(
                `course/admin/categories/${category.id}/edit/`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            onCategoryUpdated(response.data);
        } catch (err) {
            setError(err.response?.data?.data || "Failed to update category.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormContainer>
            <CloseButton onClick={onClose}>&times;</CloseButton>
            <FormHeading>Edit Category: {category.name}</FormHeading>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <StyledForm onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="cat_name">Category Name</Label>
                    <Input
                        type="text"
                        id="cat_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label htmlFor="cat_image">
                        Category Image (Upload to replace)
                    </Label>
                    {preview && (
                        <ImagePreview src={preview} alt="Category Preview" />
                    )}
                    <FileInput
                        type="file"
                        id="cat_image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </FormGroup>
                <ButtonGroup>
                    <CancelButton
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </SubmitButton>
                </ButtonGroup>
            </StyledForm>
        </FormContainer>
    );
}

function AdminDashboard() {
    const { userData } = useContext(UserContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [instructorStats, setInstructorStats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        if (userData === null) return;
        if (!userData || !userData.is_superuser) {
            navigate("/");
        }
    }, [userData, navigate]);

    useEffect(() => {
        if (userData && userData.is_superuser) {
            setIsLoading(true);
            Promise.all([
                api.get("course/dashboard/admin/"),
                api.get("auth/admin/all-users/"),
                api.get("course/admin/all-courses/"),
                api.get("course/categories/"),
            ])
                .then(([dashboardRes, usersRes, coursesRes, categoriesRes]) => {
                    setStats(dashboardRes.data.platform_stats);
                    setInstructorStats(dashboardRes.data.instructor_stats);
                    setAllUsers(usersRes.data);
                    setAllCourses(coursesRes.data);
                    setCategories(categoriesRes.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to load admin data", err);
                    setError("Could not load admin data.");
                    setIsLoading(false);
                });
        }
    }, [userData]);

    const handleCategoryAdded = (newCategory) => {
        setCategories([...categories, newCategory]);
        setShowAddForm(false);
    };

    const handleCategoryUpdated = (updatedCategory) => {
        setCategories(
            categories.map((c) =>
                c.id === updatedCategory.id ? updatedCategory : c,
            ),
        );
        setEditingCategory(null);
    };

    if (isLoading)
        return <LoadingIndicator>Loading Admin Dashboard...</LoadingIndicator>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;
    if (!userData || !userData.is_superuser) return null;

    return (
        <>
            <Header />
            <DashboardContainer>
                <Title>Admin Dashboard</Title>

                {stats && (
                    <StatsGrid>
                        <StatCard style={{ borderTop: "4px solid #2563eb" }}>
                            <h3>Total Revenue</h3>
                            <StatValue style={{ color: "#2563eb" }}>
                                ${stats.total_revenue}
                            </StatValue>
                        </StatCard>
                        <StatCard>
                            <h3>Total Instructors</h3>
                            <StatValue>{stats.total_instructors}</StatValue>
                        </StatCard>
                        <StatCard>
                            <h3>Total Students</h3>
                            <StatValue>
                                {stats.total_students || stats.total_users}
                            </StatValue>
                        </StatCard>
                        <StatCard>
                            <h3>Active Courses</h3>
                            <StatValue>{stats.total_courses}</StatValue>
                        </StatCard>
                        <StatCard>
                            <h3>Total Enrollments</h3>
                            <StatValue>{stats.total_enrollments}</StatValue>
                        </StatCard>
                    </StatsGrid>
                )}

                <PayoutsSection />

                <SectionTitle>Top Performing Instructors</SectionTitle>
                <TableWrapper>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Instructor</th>
                                <th>Courses</th>
                                <th>Students Taught</th>
                                <th>Total Earnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructorStats.length > 0 ? (
                                instructorStats.map((inst, index) => (
                                    <tr key={inst.id}>
                                        <td>
                                            <Badge>#{index + 1}</Badge>
                                        </td>
                                        <td>
                                            <strong>{inst.name}</strong>
                                            <br />
                                            <small style={{ color: "#666" }}>
                                                {inst.email}
                                            </small>
                                        </td>
                                        <td>{inst.courses_created}</td>
                                        <td>{inst.total_students_taught}</td>
                                        <td>
                                            <span
                                                style={{
                                                    color: "#16a34a",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                ${inst.total_revenue_generated}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        style={{ textAlign: "center" }}
                                    >
                                        No data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </StyledTable>
                </TableWrapper>

                <SectionTitle>Manage Categories</SectionTitle>
                {showAddForm && (
                    <CreateCategoryForm
                        onCategoryAdded={handleCategoryAdded}
                        onClose={() => setShowAddForm(false)}
                    />
                )}
                {editingCategory && (
                    <EditCategoryForm
                        category={editingCategory}
                        onCategoryUpdated={handleCategoryUpdated}
                        onClose={() => setEditingCategory(null)}
                    />
                )}
                {!showAddForm && !editingCategory && (
                    <AddButton onClick={() => setShowAddForm(true)}>
                        + Add New Category
                    </AddButton>
                )}
                <TableWrapper>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Total Courses</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>
                                        <CategoryImg
                                            src={category.category_img}
                                            alt={category.name}
                                        />
                                    </td>
                                    <td>{category.name}</td>
                                    <td>{category.total_course}</td>
                                    <td>
                                        <EditLink
                                            as="button"
                                            onClick={() =>
                                                setEditingCategory(category)
                                            }
                                        >
                                            Edit
                                        </EditLink>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </TableWrapper>

                <SectionTitle>Manage All Users</SectionTitle>
                <TableWrapper>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <RoleBadge role={user.role}>
                                            {user.role}
                                        </RoleBadge>
                                    </td>
                                    <td>{user.is_superuser ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </TableWrapper>

                <SectionTitle>Manage All Courses</SectionTitle>
                <TableWrapper>
                    <StyledTable>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Instructor</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCourses.map((course) => (
                                <tr key={course.id}>
                                    <td>{course.id}</td>
                                    <td>{course.title}</td>
                                    <td>
                                        {course.instructor?.username || "N/A"}
                                    </td>
                                    <td>${course.price}</td>
                                    <td>
                                        <StatusBadge isDraft={course.is_draft}>
                                            {course.is_draft
                                                ? "Draft"
                                                : "Published"}
                                        </StatusBadge>
                                    </td>
                                    <td>
                                        <EditLink
                                            to={`/instructor/edit-course/${course.id}`}
                                        >
                                            Edit
                                        </EditLink>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </StyledTable>
                </TableWrapper>
            </DashboardContainer>
        </>
    );
}

export default AdminDashboard;

const DashboardContainer = styled.div`
    max-width: 1200px;
    margin: 30px auto;
    padding: 20px;
`;

const Title = styled.h2`
    text-align: center;
    color: #1e293b;
    margin-bottom: 40px;
    font-size: 28px;
`;

const SectionContainer = styled.div`
    margin-bottom: 50px;
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
    color: #334155;
    font-size: 20px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 15px;
    margin-top: 50px;
    margin-bottom: 25px;
`;

const LoadingIndicator = styled.div`
    padding: 50px;
    text-align: center;
    font-size: 1.2em;
    color: #64748b;
`;
const ErrorMessage = styled.p`
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    margin: 20px 0;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 50px;
`;
const StatCard = styled.div`
    background: #fff;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    text-align: center;
    h3 {
        margin-top: 0;
        font-size: 0.9rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
`;
const StatValue = styled.p`
    font-size: 2.2rem;
    font-weight: 700;
    color: #0f172a;
    margin: 10px 0 0 0;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
`;
const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    th,
    td {
        padding: 16px 20px;
        text-align: left;
        border-bottom: 1px solid #f1f5f9;
    }
    th {
        background-color: #f8fafc;
        font-weight: 600;
        color: #475569;
        font-size: 14px;
    }
    tbody tr:last-child td {
        border-bottom: none;
    }
    tbody tr:hover {
        background-color: #fcfcfc;
    }
`;

const RoleBadge = styled.span`
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    background-color: ${(props) =>
        props.role === "instructor" ? "#dcfce7" : "#f1f5f9"};
    color: ${(props) => (props.role === "instructor" ? "#166534" : "#475569")};
    text-transform: capitalize;
`;
const StatusBadge = styled(RoleBadge)`
    background-color: ${(props) => (props.isDraft ? "#fef9c3" : "#dcfce7")};
    color: ${(props) => (props.isDraft ? "#854d0e" : "#166534")};
`;
const Badge = styled.span`
    background: #eff6ff;
    color: #1e40af;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
`;

const EditLink = styled(Link)`
    text-decoration: none;
    color: #2563eb;
    font-weight: 500;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 14px;
    &:hover {
        text-decoration: underline;
    }
`;
const CategoryImg = styled.img`
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
`;
const AddButton = styled.button`
    display: inline-block;
    padding: 12px 20px;
    background-color: #16a34a;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background-color 0.2s;
    &:hover {
        background-color: #15803d;
    }
`;

// Forms
const FormContainer = styled.div`
    max-width: 600px;
    margin: 20px 0;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    position: relative;
`;
const FormHeading = styled.h3`
    text-align: center;
    color: #1e293b;
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 1.25rem;
`;
const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;
const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
const Label = styled.label`
    margin-bottom: 8px;
    font-weight: 500;
    color: #475569;
    font-size: 0.9rem;
`;
const Input = styled.input`
    padding: 12px 15px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
    &:focus {
        outline: 2px solid #2563eb;
        border-color: transparent;
    }
`;
const FileInput = styled.input`
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.95rem;
    background: #f8fafc;
`;
const ButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    margin-top: 10px;
`;
const SubmitButton = styled.button`
    padding: 12px 20px;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    flex-grow: 1;
    transition: background 0.2s;
    &:hover {
        background-color: #1d4ed8;
    }
    &:disabled {
        background-color: #93c5fd;
        cursor: not-allowed;
    }
`;
const CancelButton = styled(SubmitButton)`
    background-color: #94a3b8;
    &:hover {
        background-color: #64748b;
    }
`;
const ImagePreview = styled.img`
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    margin-top: 10px;
    border: 1px solid #e2e8f0;
`;
const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #94a3b8;
    &:hover {
        color: #1e293b;
    }
`;

// Payout Specific Styles
const FilterBar = styled.div`
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;
`;
const Select = styled.select`
    padding: 10px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.95rem;
`;
const PayButton = styled.button`
    padding: 6px 12px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    &:hover {
        background: #1d4ed8;
    }
`;
const GenerateBtn = styled.button`
    padding: 8px 16px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    &:hover {
        background: #334155;
    }
`;
