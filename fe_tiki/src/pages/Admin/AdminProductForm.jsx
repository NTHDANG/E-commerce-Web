import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductById,
  createProduct,
  updateProduct,
  getCategories,
  getBrands,
} from "../../services/api"; // Cần thêm create/update vào api.js
import { toast } from "react-toastify";

// Form để thêm mới hoặc chỉnh sửa sản phẩm
const AdminProductForm = () => {
  const { id } = useParams(); // Lấy id từ URL (nếu là edit)
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
  });

  // Fetch dữ liệu sản phẩm nếu là chế độ chỉnh sửa
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEditMode,
  });

  // Fetch danh sách danh mục và thương hiệu để hiển thị trong dropdown
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: () => getBrands() });

  // Điền dữ liệu vào form khi ở chế độ edit
  useEffect(() => {
    if (isEditMode && productData) {
      const product = productData.data;
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        brand_id: product.brand_id || "",
      });
    }
  }, [isEditMode, productData]);

  // Mutation để tạo sản phẩm mới
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Thêm sản phẩm thành công!");
      queryClient.invalidateQueries(["adminProducts"]);
      navigate("/admin/products");
    },
    onError: (err) => toast.error(`Lỗi: ${err.message}`),
  });

  // Mutation để cập nhật sản phẩm
  const updateMutation = useMutation({
    mutationFn: (vars) => updateProduct(vars.id, vars.data),
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries(["adminProducts", "product"]);
      navigate("/admin/products");
    },
    onError: (err) => toast.error(`Lỗi: ${err.message}`),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      brand_id: formData.brand_id,
    };

    if (isEditMode) {
      updateMutation.mutate({ id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  if (isProductLoading) return <div>Đang tải thông tin sản phẩm...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Chỉnh sửa Sản phẩm" : "Thêm mới Sản phẩm"}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Tên sản phẩm</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mô tả</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700">Danh mục</label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Chọn danh mục</option>
              {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Thương hiệu</label>
            <select name="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full p-2 border rounded" required>
              <option value="">Chọn thương hiệu</option>
              {brands?.data?.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={() => navigate("/admin/products")} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">
            Hủy
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={createMutation.isLoading || updateMutation.isLoading}>
            {isEditMode ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
