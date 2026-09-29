import { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, Divider, message, Tag } from 'antd';
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaCartShopping,
  FaCreditCard,
  FaBolt,
} from 'react-icons/fa6';

import type { typeInitState } from '../../helpers/type';
import { removeFromCart, updateQuantity } from '../../store/cartSlice';
import { convertStringToPrice } from '../../helpers/func';
import PayModal from './PayModal';
import { getData } from '../../helpers/request';
import { updateUser } from '../../store/authSlice';
import axios from 'axios';

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: typeInitState) => state.cart.items);
  const auth = useSelector((state: typeInitState) => state.auth.user) as any;
  const [openModal, setOpenModal] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [flashSaleMap, setFlashSaleMap] = useState<Record<string, any>>({});

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) {
      message.warning('Vui lòng nhập mã giảm giá!');
      return;
    }
    setIsApplying(true);
    try {
      const response = await axios.post('vouchers/apply', {
        code: voucherCodeInput.trim(),
      });
      if (response.data?.success) {
        setAppliedVoucher(response.data.data);
        message.success('Áp dụng mã giảm giá thành công!');
      } else {
        message.error(
          response.data?.message || 'Không thể áp dụng mã giảm giá!'
        );
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        'Mã giảm giá không hợp lệ hoặc không đủ điều kiện!';
      message.error(errMsg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    message.info('Đã hủy áp dụng mã giảm giá.');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getData('auth/profile');
        if (res?.user) {
          dispatch(updateUser({ data: res.user }));
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
      }
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const res = await getData('flash-sales/active');
        if (res?.success && Array.isArray(res?.data)) {
          const map: Record<string, any> = {};
          const now = Date.now();
          res.data.forEach((eventGroup: any) => {
            const event = eventGroup.event;
            const startTime = new Date(event.startTime).getTime();
            const endTime = new Date(event.endTime).getTime();
            if (startTime <= now && now <= endTime) {
              (eventGroup.items || []).forEach((fsItem: any) => {
                const variantId =
                  fsItem.productVariant?._id || fsItem.productVariant;
                if (
                  variantId &&
                  fsItem.isActive &&
                  fsItem.flashSaleStock - fsItem.soldCount > 0
                ) {
                  map[variantId] = {
                    flashSalePrice: fsItem.flashSalePrice,
                    originalPrice: fsItem.productVariant?.price,
                    flashSaleStock: fsItem.flashSaleStock,
                    soldCount: fsItem.soldCount,
                    eventName: event.name,
                  };
                }
              });
            }
          });
          setFlashSaleMap(map);
        }
      } catch (error) {
        console.error('Lỗi khi tải Flash Sale:', error);
      }
    };
    fetchFlashSales();
  }, []);

  // Calculate order total with Flash Sale discounts applied
  const { subtotal, totalFlashSavings } = useMemo(() => {
    let sum = 0;
    let savings = 0;
    cartItems.forEach((item) => {
      const fsInfo = flashSaleMap[item.variantId];
      const effectivePrice = fsInfo ? fsInfo.flashSalePrice : item.price;
      sum += effectivePrice * item.quantity;
      if (fsInfo) {
        const orig = fsInfo.originalPrice || item.price;
        savings += Math.max(0, orig - fsInfo.flashSalePrice) * item.quantity;
      }
    });
    return { subtotal: sum, totalFlashSavings: savings };
  }, [cartItems, flashSaleMap]);

  const shippingFee = 0; // Free shipping
  const discountPercent = auth?.currentTier?.discount || 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const voucherDiscount = appliedVoucher?.discountAmount || 0;
  const total = Math.max(
    0,
    subtotal - discountAmount - voucherDiscount + shippingFee
  );

  const handleQuantityChange = (
    variantId: string,
    currentQty: number,
    change: number
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    dispatch(updateQuantity({ variantId, quantity: newQty }));
  };

  const handleRemove = (variantId: string) => {
    dispatch(removeFromCart(variantId));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng.');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mt-5">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
          <FaCartShopping size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Giỏ hàng của bạn đang trống
        </h2>
        <p className="text-gray-500 mb-6">
          Hãy khám phá thêm các sản phẩm tuyệt vời của chúng tôi.
        </p>
        <Link to="/">
          <Button
            type="primary"
            size="large"
            className="rounded-xl px-8 h-12 text-md"
          >
            Tiếp tục mua hàng
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-5 pb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Giỏ Hàng Của Bạn
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Column */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const fsInfo = flashSaleMap[item.variantId];
            const effectivePrice = fsInfo ? fsInfo.flashSalePrice : item.price;
            const originalPrice = fsInfo?.originalPrice || item.price;

            return (
              <Card
                key={item.variantId}
                className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                styles={{ body: { padding: '16px' } }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.mainImage || ''}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border border-gray-100 bg-gray-50"
                  />

                  <div className="flex-1 items-center min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-gray-800 truncate block">
                        {item.name}
                      </span>
                      {fsInfo && (
                        <Tag
                          color="red"
                          className="inline-flex! items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full uppercase border-none bg-red-500 text-white"
                        >
                          <FaBolt size={10} /> Flash Sale
                        </Tag>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Dung lượng:{' '}
                      <span className="font-semibold text-gray-700">
                        {item.storage}
                      </span>{' '}
                      | Màu:{' '}
                      <span className="font-semibold text-gray-700">
                        {item.color}
                      </span>{' '}
                      | Tình trạng:{' '}
                      <span className="font-semibold text-gray-700">
                        {item.condition}
                      </span>
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-md font-bold ${fsInfo ? 'text-red-600' : 'text-blue-600'}`}
                        >
                          {convertStringToPrice(effectivePrice)}
                        </span>
                        {fsInfo && (
                          <span className="text-xs text-gray-400 line-through">
                            {convertStringToPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.variantId,
                            item.quantity,
                            -1
                          )
                        }
                        className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-4 font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.variantId, item.quantity, 1)
                        }
                        className="p-2 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      icon={<FaTrash size={16} />}
                      onClick={() => handleRemove(item.variantId)}
                      className="flex items-center justify-center hover:bg-red-50"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tóm tắt đơn hàng
            </h2>

            {/* Voucher input block */}
            <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                Mã giảm giá
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã ưu đãi..."
                  value={voucherCodeInput}
                  onChange={(e) =>
                    setVoucherCodeInput(e.target.value.toUpperCase())
                  }
                  disabled={!!appliedVoucher}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-1 text-sm uppercase placeholder:normal-case focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                />
                {!appliedVoucher ? (
                  <Button
                    type="primary"
                    onClick={handleApplyVoucher}
                    loading={isApplying}
                    className="rounded-lg h-8 text-xs font-semibold"
                  >
                    Áp dụng
                  </Button>
                ) : (
                  <Button
                    danger
                    onClick={handleRemoveVoucher}
                    className="rounded-lg h-8 text-xs font-semibold"
                  >
                    Hủy
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3 text-md text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                <span className="font-semibold text-gray-800">
                  {convertStringToPrice(subtotal)}
                </span>
              </div>
              {totalFlashSavings > 0 && (
                <div className="flex justify-between text-red-500 font-semibold items-center">
                  <span className="flex items-center gap-1">
                    <FaBolt className="text-red-500" /> Tiết kiệm Flash Sale
                  </span>
                  <span>-{convertStringToPrice(totalFlashSavings)}</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Giảm giá VIP ({auth?.currentTier?.name})</span>
                  <span>-{convertStringToPrice(discountAmount)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-rose-500 font-semibold items-center">
                  <span>Mã Voucher ({appliedVoucher?.code})</span>
                  <div className="flex items-center gap-1">
                    <span>-{convertStringToPrice(voucherDiscount)}</span>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-[10px] text-red-500 hover:text-red-700 bg-none border-none p-0 cursor-pointer ml-1 font-normal underline"
                      title="Xóa mã"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <Divider className="my-3!" />
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span className="text-blue-600">
                  {convertStringToPrice(total)}
                </span>
              </div>
            </div>

            <Divider className="my-6!" />

            <Link to="/">
              <Button
                type="primary"
                size="large"
                block
                ghost
                className="rounded-xl h-12 text-md font-bold"
              >
                <FaCartShopping /> Tiếp tục mua hàng
              </Button>
            </Link>
            <Button
              type="primary"
              size="large"
              block
              className="rounded-xl h-12 text-md font-bold mt-3"
              onClick={() => setOpenModal(true)}
            >
              <FaCreditCard />
              Thanh toán ngay
            </Button>
          </Card>
        </div>
      </div>
      <PayModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        subtotal={subtotal}
        voucherCode={appliedVoucher?.code}
        voucherDiscount={voucherDiscount}
        flashSaleMap={flashSaleMap}
      />
    </div>
  );
};

export default CartPage;
