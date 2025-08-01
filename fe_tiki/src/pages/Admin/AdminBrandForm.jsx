import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrandById, createBrand, updateBrand } from "../../services/api"; // Cần thêm create/update
import { toast } from "react-toastify";

const AdminBrandForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);
  const [name, setName] = useState("");

  const { data: brandData, isLoading } = useQuery({
    queryKey: ["brand", id],
    queryFn: () => getBrandById(id),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && brandData) {
      setName(brandData.data.name);
    }
  }, [isEditMode, brandData]);

  const mutation = useMutation({
    mutationFn: isEditMode ? (data) => updateBrand(id, data) : createBrand,
    onSuccess: () => {
      toast.success(`Đã ${isEditMode ? 'cập nhật' : 'thêm'} thương hiệu!`)
      queryClient.invalidateQueries(["brands"]);
      navigate("/admin/brands");
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
      <h1 className="text-2xl mb-4">{isEditMode ? "Sửa" : "Thêm"} Thương hiệu</h1>
      <input 
        type="text" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="border p-2 w-full mb-4"
        placeholder="Tên thương hiệu"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Lưu</button>
    </form>
  );
};

export default AdminBrandForm;
