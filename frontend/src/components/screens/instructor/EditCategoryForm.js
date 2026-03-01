import React, { useState } from "react";
import styled from "styled-components";
import api from "../../api";

// Re-using styled components again
const FormContainer = styled.div`
    max-width: 600px;
    margin: 20px auto;
    padding: 25px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
    position: relative; // Good for an 'X' close button
`;

const FormHeading = styled.h3`
    /* ... */
`; // (Same as above)
const StyledForm = styled.form`
    /* ... */
`; // (Same as above)
const FormGroup = styled.div`
    /* ... */
`; // (Same as above)
const Label = styled.label`
    /* ... */
`; // (Same as above)
const Input = styled.input`
    /* ... */
`; // (Same as above)
const FileInput = styled.input`
    /* ... */
`; // (Same as above)
const ButtonGroup = styled.div`
    /* ... */
`; // (Same as above)
const SubmitButton = styled.button`
    /* ... */
`; // (Same as above)
const CancelButton = styled(SubmitButton)`
    /* ... */
`; // (Same as above)
const ErrorMessage = styled.p`
    /* ... */
`; // (Same as above)

const ImagePreview = styled.img`
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 6px;
    margin-top: 10px;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #888;
    &:hover {
        color: #000;
    }
`;

function EditCategoryForm({ category, onCategoryUpdated, onClose }) {
    const [name, setName] = useState(category.name);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(category.category_img); // Shows current or new image
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file)); // Set preview to new file
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("name", name);
        if (imageFile) {
            // Only send the image if a new one was selected
            formData.append("category_img", imageFile);
        }

        try {
            const response = await api.put(
                `course/admin/categories/${category.id}/edit/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            onCategoryUpdated(response.data); // Pass the updated category up
        } catch (err) {
            console.error("Failed to update category", err.response);
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

// Copy/paste the styled-component definitions here
FormHeading.defaultProps = { as: "h3" };
StyledForm.defaultProps = { as: "form" };
FormGroup.defaultProps = { as: "div" };
Label.defaultProps = { as: "label" };
Input.defaultProps = { as: "input" };
FileInput.defaultProps = { as: "input" };
ButtonGroup.defaultProps = { as: "div" };
SubmitButton.defaultProps = { as: "button" };
CancelButton.defaultProps = { as: "button" };
ErrorMessage.defaultProps = { as: "p" };

export default EditCategoryForm;
