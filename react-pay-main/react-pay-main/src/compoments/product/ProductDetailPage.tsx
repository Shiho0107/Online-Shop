import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button, message } from 'antd';
import { FaCartArrowDown, FaCartPlus, FaTag, FaBolt } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';

import SwiperCompoment from './swiper/SwiperCompoment';
import { getData } from '../../helpers/request';
import type { productVariantType } from '../../helpers/type';
import { convertStringToPrice } from '../../helpers/func';
import ProductDescription from './more-detail/ProductDescription';
import ProductSpecification from './more-detail/ProductSpecification';
import { addToCart } from '../../store/cartSlice';
import { useActiveFlashSale, useCountdown } from '../../helpers/useFlashSale';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [typeProduct, setTypeProduct] = useState(1);
  const [storage, setStorage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] =
    useState<productVariantType | null>(null);
  const { data, isPending } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getData(`product-variants/${slug}`),
  });

  const { variantMap } = useActiveFlashSale();
  const fsInfo = selectedVariant?._id ? variantMap[selectedVariant._id] : undefined;
  const { hours, minutes, seconds } = useCountdown(fsInfo?.endTime || '');

  const groupedByStorage = useMemo(
    () =>
      data?.data?.variants?.reduce(
        (
          accumulator: { [x: string]: any[] },
          currentItem: { storage: any }
        ) => {
          const key = currentItem.storage;

          // Nếu chưa có mảng cho dung lượng này, khởi tạo mảng rỗng
          if (!accumulator[key]) {
            accumulator[key] = [];
          }

          // Đẩy phần tử hiện tại vào mảng tương ứng
          accumulator[key].push(currentItem);

          return accumulator;
        },
        {}
      ),
    [data]
  );

  const Storage = useMemo(
    () => (data ? Object.keys(groupedByStorage) : []),
    [groupedByStorage, data]
  );

  // const Color = useMemo(
  //   () =>
  //     groupedByStorage
  //       ? groupedByStorage[storage]?.map(
  //           (item: productVariantType) => item.color
  //         )
  //       : [],
  //   [groupedByStorage, storage]
  // );

  useEffect(() => {
    Storage.length > 0 && setStorage(Storage[0]);
  }, [Storage]);

  useEffect(() => {
    if (groupedByStorage && storage && groupedByStorage[storage]) {
      const currentVariant = selectedVariant;
      const match =
        groupedByStorage[storage].find(
          (v: productVariantType) => v.color === currentVariant?.color
        ) || groupedByStorage[storage][0];

      setSelectedVariant(match);
    }
  }, [storage, groupedByStorage]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      message.error('Vui lòng chọn sản phẩm!');
      return;
    }
    dispatch(
      addToCart({
        _id: data?.data?.info?._id || (selectedVariant.product && typeof selectedVariant.product === 'object' ? (selectedVariant.product as any)._id : selectedVariant.product),
        variantId: selectedVariant._id,
        sku: selectedVariant.sku,
        name: data?.data?.info?.name || (selectedVariant.product && typeof selectedVariant.product === 'object' ? (selectedVariant.product as any).name : ''),
        price: Number(selectedVariant.price),
        mainImage: selectedVariant.imageColor || data?.data?.info?.mainImage || (selectedVariant.product && typeof selectedVariant.product === 'object' ? (selectedVariant.product as any).mainImage : '') || '',
        quantity: 1,
        storage: selectedVariant.storage,
        color: selectedVariant.color,
        condition: selectedVariant.condition,
      })
    );
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    handleAddToCart();
    navigate('/cart');
  };

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-5 pb-7">
      <div className="grid grid-cols-2 gap-4">
        <SwiperCompoment images={data?.data?.info?.images || []} />
        <div className="">
          <h2 className="font-bold text-3xl text-gray-700">
            {data?.data?.info?.name} {storage}
          </h2>
          {fsInfo && selectedVariant ? (
            <div className="my-4 rounded-xl overflow-hidden border border-orange-200 shadow-md">
              {/* Flash Sale Banner Header */}
              <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white px-4 py-2.5 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black uppercase text-sm tracking-wider">
                  <FaBolt className="text-yellow-300 animate-bounce" size={18} />
                  <span>FLASH SALE GIỜ VÀNG</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-black/20 px-2.5 py-1 rounded-full">
                  <span>Kết thúc trong:</span>
                  <span className="bg-white text-red-600 px-1.5 py-0.5 rounded font-mono font-bold">{hours}</span>:
                  <span className="bg-white text-red-600 px-1.5 py-0.5 rounded font-mono font-bold">{minutes}</span>:
                  <span className="bg-white text-red-600 px-1.5 py-0.5 rounded font-mono font-bold">{seconds}</span>
                </div>
              </div>

              {/* Flash Sale Price Area */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-orange-600">
                    {convertStringToPrice(fsInfo.flashSalePrice)}
                  </span>
                  {Number(selectedVariant.originalPrice || selectedVariant.price) > fsInfo.flashSalePrice && (
                    <span className="text-gray-400 line-through text-lg">
                      {convertStringToPrice(Number(selectedVariant.originalPrice || selectedVariant.price))}
                    </span>
                  )}
                  <span className="bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                    -{Math.round(((Number(selectedVariant.originalPrice || selectedVariant.price) - fsInfo.flashSalePrice) / Number(selectedVariant.originalPrice || selectedVariant.price)) * 100)}% GIẢM SỐC
                  </span>
                </div>
              </div>
            </div>
          ) : selectedVariant ? (
            <div className="flex items-center gap-4 text-xl pt-3 py-4">
              <span className="font-medium text-blue-600">
                {convertStringToPrice(Number(selectedVariant.price))}
              </span>
              <span className="text-gray-400 line-through">
                {convertStringToPrice(Number(selectedVariant.originalPrice))}
              </span>
            </div>
          ) : null}

          <div className="mb-7">
            <p className="text-sm text-gray-700">Dung lượng :</p>

            <div className="grid grid-cols-4 gap-3 mt-2">
              {Storage.map((key) => (
                <div
                  key={key}
                  className={clsx(
                    'p-1 text-center border rounded-lg cursor-pointer',
                    storage === key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-600 text-gray-600'
                  )}
                  onClick={() => setStorage(key)}
                >
                  <h3 className="font-medium text-sm">{key}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-7 flex items-center gap-15">
            <div className="flex flex-col">
              <p className="text-sm text-gray-700">Màu sắc :</p>
              <div className="flex items-center gap-2 mt-2">
                {groupedByStorage[storage]?.map((item: productVariantType) => (
                  <Button
                    shape="circle"
                    key={item._id}
                    className={clsx(
                      'border-2',
                      selectedVariant?._id === item._id
                        ? 'border-blue-600'
                        : 'border-transparent'
                    )}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor:
                        item.color.toLowerCase().includes('trắng') ||
                        item.color.toLowerCase().includes('white')
                          ? '#ffffff'
                          : item.color.toLowerCase().includes('đen') ||
                              item.color.toLowerCase().includes('black')
                            ? '#111111'
                            : item.color.toLowerCase().includes('titan') ||
                                item.color.toLowerCase().includes('gray')
                              ? '#8e8e93'
                              : item.color.toLowerCase().includes('vàng') ||
                                  item.color.toLowerCase().includes('gold')
                                ? '#f4e2d8'
                                : '#a2a2a2',
                    }}
                    onClick={() => setSelectedVariant(item)}
                    title={item.color}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-gray-700">Kho :</p>
              <div className="flex items-center gap-2 mt-2 font-medium">
                {selectedVariant?.stock !== undefined
                  ? selectedVariant.stock
                  : 0}
              </div>
            </div>
          </div>

          <div className="py-3 px-5 mb-5 border border-gray-300 rounded-2xl">
            <h4 className="font-medium text-gray-600 text-lg">Ưu đãi</h4>
            {/*  */}
            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Ưu đãi gói bảo hành giảm giá lên tới 40%
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Tặng thẻ tập thử 1 tháng tại California Fitness & Yoga Centers
                cho hoá đơn trên 15.000.000đ khi mua hàng
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Ưu đãi combo giảm thêm 100.000đ khi mua AirPods kèm iPhone/
                iPad/ Mac
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Mua iPhone, iPad, Mac tặng Voucher lên tới 500.000đ khi mua
                Robot hút bụi và Máy sấy tóc DREAME + MOVA​
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Combo phụ kiện giảm tới 200.000đ
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Ưu đãi combo giảm thêm 200.000đ khi mua Apple Watch kèm iPhone/
                iPad/ Mac
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Giảm thêm 100.000đ khi mua ốp lưng chính hãng Apple, Pitaka,
                Xtrem kèm máy​
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <FaTag className="text-green-600" size={15} />
              <p className="text-[14px] text-gray-600">
                Chương trình tri ân khách hàng tặng Voucher 200.000đ khi mua
                iPhone 17 Pro Max, iPhone 17 Pro, iPhone 17, iPhone 17e, iPhone
                Air
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <button
              onClick={handleBuyNow}
              className="flex justify-center items-center py-4 cursor-pointer text-white rounded-2xl font-medium bg-blue-600 hover:bg-blue-800 transition-all duration-300 ease-out"
            >
              <FaCartArrowDown size={20} />
              <span className="ms-2">Mua Ngay</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="flex justify-center items-center py-4 cursor-pointer text-blue-600 rounded-2xl font-medium border border-blue-600 hover:bg-gray-200 transition-all duration-300 ease-out"
            >
              <FaCartPlus size={20} />
              <span className="ms-2">Thêm Vào Giỏ Hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="flex justify-center items-center gap-5 mt-15">
        <button
          className={clsx(
            'border rounded-md py-2 px-3 text-[14px] font-normal  cursor-pointer',
            typeProduct === 1
              ? 'border-blue-500 text-blue-500'
              : 'border-gray-400 hover:bg-gray-200 hover:border-gray-200 transition-all duration-300 ease-out'
          )}
          onClick={() => setTypeProduct(1)}
        >
          Mô tả sản phẩm
        </button>
        <button
          className={clsx(
            'border rounded-md py-2 px-3 text-[14px] font-normal  cursor-pointer',
            typeProduct === 2
              ? 'border-blue-500 text-blue-500'
              : 'border-gray-400 hover:bg-gray-200 hover:border-gray-200 transition-all duration-300 ease-out'
          )}
          onClick={() => setTypeProduct(2)}
        >
          Thông số kỹ thuật
        </button>
        <button
          className={clsx(
            'border rounded-md py-2 px-3 text-[14px] font-normal  cursor-pointer',
            typeProduct === 3
              ? 'border-blue-500 text-blue-500'
              : 'border-gray-400 hover:bg-gray-200 hover:border-gray-200 transition-all duration-300 ease-out'
          )}
          onClick={() => setTypeProduct(3)}
        >
          Đánh giá
        </button>
      </div>

      <div>
        {typeProduct === 1 && <ProductDescription />}
        {typeProduct === 2 && (
          <ProductSpecification
            specifications={data?.data?.info?.specifications || {}}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
