import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, deleteCategory } from "../../services/api"; // Cần thêm deleteCategory
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminCategoryList = () => {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Xóa danh mục thành công!");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
        <Link to="/admin/categories/new" className="bg-blue-500 text-white px-4 py-2 rounded">Thêm mới</Link>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Tên</th>
            <th className="py-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((cat) => (
            <tr key={cat.id}>
              <td className="border px-4 py-2">{cat.id}</td>
              <td className="border px-4 py-2">{cat.name}</td>
              <td className="border px-4 py-2">
                <Link to={`/admin/categories/edit/${cat.id}`} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Sửa</Link>
                <button onClick={() => handleDelete(cat.id)} className="bg-red-500 text-white px-2 py-1 rounded">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCategoryList;
