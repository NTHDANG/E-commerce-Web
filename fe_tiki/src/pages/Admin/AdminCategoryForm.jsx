import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoryById, createCategory, updateCategory } from "../../services/api"; // Cần thêm create/update
import { toast } from "react-toastify";

const AdminCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const [name, setName] = useState("");

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && categoryData) {
      setName(categoryData.data.name);
    }
  }, [isEditMode, categoryData]);

  const mutation = useMutation({
    mutationFn: isEditMode ? (data) => updateCategory(id, data) : createCategory,
    onSuccess: () => {
      toast.success(`Đã ${isEditMode ? 'cập nhật' : 'thêm'} danh mục!`)
      queryClient.invalidateQueries(["categories"]);
      navigate("/admin/categories");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name });
  };

  if (isLoading) return <div>Đang tải...</div>

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl mb-4">{isEditMode ? "Sửa" : "Thêm"} Danh mục</h1>
      <input 
        type="text" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="border p-2 w-full mb-4"
        placeholder="Tên danh mục"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Lưu</button>
    </form>
  );
};

export default AdminCategoryForm;
