import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Trang hiển thị danh sách sản phẩm cho Admin
const AdminProductList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // 6 sản phẩm mỗi trang

  // Fetch danh sách sản phẩm
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["adminProducts", currentPage],
    queryFn: () => getProducts({ page: currentPage, limit: productsPerPage }),
  });

  // Mutation để xóa sản phẩm
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      // Làm mới lại danh sách sản phẩm sau khi xóa
      queryClient.invalidateQueries(["adminProducts"]);
    },
    onError: (error) => {
      toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      deleteProductMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-center">Đang tải danh sách sản phẩm...</div>;
  if (isError) return <div className="text-center text-red-500">Lỗi khi tải dữ liệu.</div>;

  const products = productsData?.products || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>
        <Link to="/admin/products/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Thêm mới sản phẩm
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Ảnh</th>
              <th className="py-3 px-6 text-left">Tên sản phẩm</th>
              <th className="py-3 px-6 text-center">Giá</th>
              <th className="py-3 px-6 text-center">Tồn kho</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{product.id}</td>
                <td className="py-3 px-6 text-left">
                  <img 
                    src={product.product_images?.[0]?.image_url ? `${import.meta.env.VITE_API_IMAGE_BASE_URL}/${product.product_images[0].image_url}` : '/no-image.png'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="py-3 px-6 text-left">{product.name}</td>
                <td className="py-3 px-6 text-center">{product.product_variant_values?.[0]?.price.toLocaleString('vi-VN')} ₫</td>
                <td className="py-3 px-6 text-center">{product.stock}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center">
                    <Link to={`/admin/products/edit/${product.id}`} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                      Sửa
                    </Link>
                    <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="mt-6 flex justify-center items-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {productsData?.totalPages || 1}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(productsData?.totalPages || 1, prev + 1)
            )
          }
          disabled={currentPage >= (productsData?.totalPages || 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default AdminProductList;
