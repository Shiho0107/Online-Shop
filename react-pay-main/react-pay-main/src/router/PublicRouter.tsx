import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import MasterLayout from '../layouts/user/MasterLayout';
import HomePage from '../compoments/home/HomePage';
import AuthCompoment from '../compoments/auth/AuthCompoment';

const SearchPage = lazy(() => import('../compoments/search/SearchPage'));

const LoginCompoment = lazy(() => import('../compoments/auth/LoginCompoment'));
const RegisterCompoment = lazy(
  () => import('../compoments/auth/RegisterCompoment')
);
const ProductDetailPage = lazy(
  () => import('../compoments/product/ProductDetailPage')
);
const CartPage = lazy(() => import('../compoments/cart/CartPage'));
const FlashSalePage = lazy(
  () => import('../compoments/flash-sale/FlashSalePage')
);

const IphonePage = lazy(() => import('../compoments/navbar/IphonePage'));
const MacPage = lazy(() => import('../compoments/navbar/MacPage'));
const IpadPage = lazy(() => import('../compoments/navbar/IpadPage'));
const WatchPage = lazy(() => import('../compoments/navbar/WatchPage'));
const ItemPage = lazy(() => import('../compoments/navbar/ItemPage'));
const MyPayPage = lazy(() => import('../compoments/pay/MyPayPage'));
const MyPayDetail = lazy(() => import('../compoments/pay/MyPayDetail'));

// Admin
const AdminMasterLayout = lazy(
  () => import('../layouts/admin/AdminMasterLayout')
);

const AdminVipTierPage = lazy(
  () => import('../compoments/admin/vip/AdminVipTierPage')
);

const AdminStatisticalPage = lazy(
  () => import('../compoments/admin/statistical/AdminStatisticalPage')
);

const AdminImportExportPage = lazy(
  () => import('../compoments/admin/import-export/ImportExportPage')
);

const AdminCategoryPage = lazy(
  () => import('../compoments/admin/category/AdminCategoryPage')
);

const AdminSeriePage = lazy(
  () => import('../compoments/admin/serie/AdminSeriePage')
);
const AdminProductPage = lazy(
  () => import('../compoments/admin/product/AdminProductPage')
);

const AdminUserPage = lazy(
  () => import('../compoments/admin/user/AdminUserPage')
);

const AdminOrderPage = lazy(
  () => import('../compoments/admin/order/AdminOrderPage')
);

const AdminProductVariantPage = lazy(
  () => import('../compoments/admin/product-variant/AdminProductVariantPage')
);

const AdminVoucherPage = lazy(
  () => import('../compoments/admin/voucher/AdminVoucherPage')
);

const AdminFlashSalePage = lazy(
  () => import('../compoments/admin/flash-sale/AdminFlashSalePage')
);

const PublicRouter = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <Routes>
          <Route element={<MasterLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth" element={<AuthCompoment />}>
              <Route index element={<LoginCompoment />} />
              <Route path="login" element={<LoginCompoment />} />
              <Route path="register" element={<RegisterCompoment />} />
            </Route>
            <Route path="/iphone" element={<IphonePage />} />
            <Route path="/mac" element={<MacPage />} />
            <Route path="/ipad" element={<IpadPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="/:type/:slug" element={<ItemPage />} />
            <Route path="/:type/detail/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/flash-sale" element={<FlashSalePage />} />
            <Route path="/mypay" element={<MyPayPage />} />
            <Route path="/mypay/:orderCode" element={<MyPayDetail />} />
            <Route path="*" element={<HomePage />} />
          </Route>

          <Route path="/admin" element={<AdminMasterLayout />}>
            <Route
              index
              path="/admin/statistical"
              element={<AdminStatisticalPage />}
            />
            <Route
              path="/admin/import-export"
              element={<AdminImportExportPage />}
            />
            <Route path="/admin/users" element={<AdminUserPage />} />
            <Route path="/admin/vip-tiers" element={<AdminVipTierPage />} />
            <Route path="/admin/categories" element={<AdminCategoryPage />} />
            <Route path="/admin/series" element={<AdminSeriePage />} />
            <Route path="/admin/products" element={<AdminProductPage />} />
            <Route
              path="/admin/product-variants"
              element={<AdminProductVariantPage />}
            />
            <Route path="/admin/vouchers" element={<AdminVoucherPage />} />
            <Route path="/admin/flash-sales" element={<AdminFlashSalePage />} />
            <Route path="/admin/orders" element={<AdminOrderPage />} />
            <Route path="/admin/*" element={<AdminStatisticalPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default PublicRouter;
