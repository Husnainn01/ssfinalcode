"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfig } from "@/lib/editorConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from "react-dropzone";

const CKEditorComponent = dynamic(() => import("@/components/block/editor"), { ssr: false });

const UpdateBlog = ({ BlogId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    date: "",
    visibility: "",
    image: "",
    thumbnail: "",
  });

  const [visibilityOptions] = useState(["Active", "Inactive"]);

  useEffect(() => {
    fetchCategories();
    fetchBlogPost();
  }, [BlogId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/posts/cat");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(`/api/posts/${BlogId}`);
      const data = await response.json();
      setFormData({
        title: data.title || "",
        content: data.content || "",
        category: data.category || "",
        date: data.date || "",
        visibility: data.visibility || "",
        image: data.image || "",
        thumbnail: data.thumbnail || "",
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData((prevData) => ({ ...prevData, content: data }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${BlogId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Blog post updated successfully");
        router.push("/admin/dashboard/blog");
      } else {
        throw new Error("Failed to update blog post");
      }
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="ml-2 font-bold mb-4">Add New Post</h3>

      <div className="ml-2 mb-4 flex gap-4 md:flex-row flex-col">
        <Input
          clearable
          underlined
          placeholder="Enter Title"
          label="Post Main Title"
          labelPlacement="outside"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <Input
          clearable
          underlined
          placeholder="Thumbnail URL"
          labelPlacement="outside"
          label="Thumbnail"
          name="thumbnail"
          value={formData.thumbnail}
          onChange={handleInputChange}
        />
        <Input
          clearable
          underlined
          placeholder="Enter tags, separated by commas (e.g., Vasu, Theme, Cars)"
          labelPlacement="outside"
          label="Tags"
          name="tag"
          value={formData.tag}
          onChange={handleInputChange}
        />
      </div>
      <div className="ml-2 mb-4 flex gap-4 md:flex-row flex-col">
        <Select
          clearable
          underlined
          placeholder="Select Category"
          labelPlacement="outside"
          label="Category"
          selectedKeys={[formData.category]}
          name="category"
          value={formData.category}
          onChange={handleSelectChange}
        >
          {categories.map((category) => (
            <SelectItem key={category.category} value={category.category}>
              {category.category}
            </SelectItem>
          ))}
        </Select>

        <Input
          type="date"
          labelPlacement="outside"
          label="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
        />
        <Select
          clearable
          underlined
          placeholder="Select Visibility"
          labelPlacement="outside"
          label="Visibility"
          name="visibility"
          value={formData.visibility}
          selectedKeys={[formData.visibility]}
          onChange={handleSelectChange}
        >
          {visibilityOptions.map((visibilityOptions) => (
            <SelectItem key={visibilityOptions} value={visibilityOptions}>
              {visibilityOptions}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="ml-2 mb-4">
        <CKEditor
          editor={ClassicEditor}
          config={editorConfig}
          data={formData.content}
          onChange={handleEditorChange}
        />
      </div>
      <Button className="bg-black text-white" onClick={handleSubmit}>
        Submit
      </Button>
      <ToastContainer />
    </div>
  );
};

export default UpdateBlog;
