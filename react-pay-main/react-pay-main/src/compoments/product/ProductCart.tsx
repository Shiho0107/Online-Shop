import { Link } from 'react-router-dom';
import { FaTag, FaBolt } from 'react-icons/fa6';
import type { productVariantType } from '../../helpers/type';
import {
  convertStringToPrice,
  calculateDiscountPercentage,
} from '../../helpers/func';
import { useActiveFlashSale } from '../../helpers/useFlashSale';

const ProductCart = (it: productVariantType) => {
  const { variantMap, productMap } = useActiveFlashSale();

  const fsInfo = variantMap[it._id] || (it.product?._id ? productMap[it.product._id] : undefined);
  const isFlashSale = !!fsInfo;
  const displayPrice = isFlashSale ? fsInfo.flashSalePrice : Number(it.price);
  const originalPrice = Number(it.originalPrice || it.price);
  const discountPct = calculateDiscountPercentage(originalPrice, displayPrice);

  return (
    <Link
      to={`/iphone/detail/${it.product?.slug || '_'}`}
      key={it._id}
      className={`pt-10 pb-4 px-3 rounded-2xl bg-[#ffffff] relative cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl ${
        isFlashSale
          ? 'border-2 border-orange-500 shadow-lg shadow-orange-100/60 ring-2 ring-orange-400/30'
          : 'border border-slate-100'
      }`}
    >
      {/* Top Banner Tag */}
      {isFlashSale ? (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-r-xl rounded-tl-2xl shadow-md flex items-center gap-1 animate-pulse z-10">
          <FaBolt className="text-yellow-300 text-xs animate-bounce" />
          <span>Flash Sale {discountPct > 0 ? `-${discountPct}%` : 'GIÁ SỐC'}</span>
        </div>
      ) : discountPct > 0 ? (
        <div className="absolute top-0 left-0 bg-red-500 rounded-r-2xl rounded-tl-2xl w-auto px-3 py-1 text-gray-100 text-[13px] text-center z-10">
          Giảm {discountPct}%
        </div>
      ) : null}

      {!isFlashSale && (
        <div className="absolute top-3 right-2 border-2 px-2 border-green-600 rounded-lg text-[13px] text-green-700 z-10">
          <span className="flex justify-center items-center gap-1">
            <FaTag /> New
          </span>
        </div>
      )}

      <img
        loading="lazy"
        src={it.product?.mainImage ?? undefined}
        alt=""
        className="rounded-2xl object-cover w-55 mx-auto transition-transform duration-300 hover:scale-105"
      />

      <h3 className="text-center text-lg mt-3 font-medium text-slate-800 line-clamp-1">
        {it.product?.name || '_'} | {it.storage} | {it.color}
      </h3>

      <div className="mt-3 flex justify-center items-baseline gap-2">
        <span className={`font-bold ${isFlashSale ? 'text-orange-600 text-xl tracking-tight drop-shadow-sm' : 'text-blue-600 text-lg'}`}>
          {convertStringToPrice(displayPrice)}
        </span>
        {originalPrice > displayPrice && (
          <span className="line-through text-xs text-gray-400">
            {convertStringToPrice(originalPrice)}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ProductCart;
