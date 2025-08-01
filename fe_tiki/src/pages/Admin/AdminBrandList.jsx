import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBrands, deleteBrand } from "../../services/api"; // Cần thêm deleteBrand
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminBrandList = () => {
  const queryClient = useQueryClient();
  const { data: brandsData, isLoading } = useQuery({ queryKey: ["brands"], queryFn: () => getBrands() });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Xóa thương hiệu thành công!");
      queryClient.invalidateQueries(["brands"]);
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
        <h1 className="text-3xl font-bold">Quản lý Thương hiệu</h1>
        <Link to="/admin/brands/new" className="bg-blue-500 text-white px-4 py-2 rounded">Thêm mới</Link>
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
          {brandsData?.data?.map((brand) => (
            <tr key={brand.id}>
              <td className="border px-4 py-2">{brand.id}</td>
              <td className="border px-4 py-2">{brand.name}</td>
              <td className="border px-4 py-2">
                <Link to={`/admin/brands/edit/${brand.id}`} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Sửa</Link>
                <button onClick={() => handleDelete(brand.id)} className="bg-red-500 text-white px-2 py-1 rounded">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBrandList;
