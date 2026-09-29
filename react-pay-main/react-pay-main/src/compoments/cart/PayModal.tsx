import { Divider, Form, Input, Modal, type FormProps } from 'antd';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

import { convertStringToPrice } from '../../helpers/func';
import type { typeInitState } from '../../helpers/type';
import { postPay } from '../../helpers/request';
import { clearCart } from '../../store/cartSlice';
import { useNavigate } from 'react-router-dom';
// import { clearCart } from '../../store/cartSlice';

interface PayModalProps {
  visible: boolean;
  onClose: () => void;
  subtotal: number;
  voucherCode?: string;
  voucherDiscount?: number;
  flashSaleMap?: Record<string, any>;
}

interface FieldType {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const PayModal: React.FC<PayModalProps> = ({
  visible,
  onClose,
  subtotal,
  voucherCode,
  voucherDiscount = 0,
  flashSaleMap = {},
}) => {
  const [form] = Form.useForm();
  const auth = useSelector((state: typeInitState) => state.auth.user);
  const cartItems = useSelector((state: typeInitState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = auth as any;
  const discountPercent = authUser?.currentTier?.discount || 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount - voucherDiscount);

  useEffect(() => {
    if (auth && visible) {
      form.setFieldsValue({
        name: auth.name || '',
        email: auth.email || '',
        phone: auth.phone || '',
        address: auth.address || '',
      });
    }
  }, [auth, form, visible]);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      if (!auth) {
        toast.info('Mời bạn đăng nhập để tiến hành thanh toán !');
        return;
      }

      if (cartItems.length === 0) {
        toast.error('Giỏ hàng không có sản phẩm !');
        return;
      }

      const payData = cartItems.map((item) => {
        return {
          variantId: item.variantId,
          quantity: item.quantity,
        };
      });
      const res = await postPay({
        orders: payData,
        user: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
        },
        voucherCode: voucherCode || undefined,
      });
      if (res?.success) {
        toast.success('Đã thêm đơn hàng thành công !');
        window.open(res.data.checkoutUrl, '_blank', 'noopener,noreferrer');
        navigate('/mypay');
        dispatch(clearCart());
      }
    } catch (error) {
      console.log('handlePay error : ', error);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      title={
        <div className="text-center py-2">
          <div className="text-2xl font-bold text-gray-800">
            Xác nhận thông tin
          </div>
        </div>
      }
      width={{
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '60%',
        xl: '50%',
        xxl: '40%',
      }}
    >
      <Form
        form={form}
        name="PayForm"
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="">
            <Form.Item<FieldType>
              label="Tên"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập Tên !' },
                { min: 3, message: 'Tên tối thiểu 3 ký tự !' },
                { max: 20, message: 'Tên tối đa 20 ký tự !' },
              ]}
            >
              <Input className="h-10" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập Email !' },
                { min: 3, message: 'Email tối thiểu 3 ký tự !' },
              ]}
            >
              <Input className="h-10" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Địa Chỉ"
              name="address"
              rules={[
                { required: true, message: 'Vui lòng nhập Địa Chỉ !' },
                { min: 3, message: 'Địa Chỉ tối thiểu 3 ký tự !' },
              ]}
            >
              <Input className="h-10" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Số Điện Thoại"
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập Số Điện Thoại !' },
                { min: 10, message: 'Số Điện Thoại tối thiểu 10 ký tự !' },
                { max: 15, message: 'Số Điện Thoại tối đa 15 ký tự !' },
              ]}
            >
              <Input className="h-10" />
            </Form.Item>
          </div>
          <div className="pt-3 overflow-auto max-h-100">
            {/* Header */}
            {/* <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaRegMoneyBillAlt size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Thanh Toán
            </h2>
            <p className="text-sm text-gray-500">
              Chọn phương thức thanh toán phù hợp với bạn
            </p>
          </div> */}

            <div className="pb-2 space-y-2">
              {cartItems.map((item) => {
                const fsInfo = flashSaleMap[item.variantId];
                const effectivePrice = fsInfo
                  ? fsInfo.flashSalePrice
                  : item.price;

                return (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-2 border-b border-gray-100 pb-2"
                  >
                    <img
                      src={item.mainImage || ''}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                    />

                    <div className="flex justify-between items-center gap-2 w-full min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                          </p>
                          {fsInfo && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              ⚡ FS
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 block truncate">
                          {item.storage} | {item.color} | {item.condition}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 block">
                          {convertStringToPrice(effectivePrice)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 shrink-0">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Tổng tiền hàng:</span>
                <span className="font-bold text-gray-800">
                  {convertStringToPrice(subtotal)}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-center mb-2 text-emerald-600 font-medium">
                  <span>Giảm giá VIP ({authUser?.currentTier?.name}):</span>
                  <span>-{convertStringToPrice(discountAmount)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-rose-500 font-semibold">
                  <span>Mã Voucher ({voucherCode}):</span>
                  <span>-{convertStringToPrice(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Phí vận chuyển:</span>
                <span className="font-bold text-gray-800">Miễn Phí</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  Tổng cộng:
                </span>
                <span className="text-lg font-bold text-red-600">
                  {convertStringToPrice(total)}
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 hidden">
              {/* Payment Method 1: Bank Transfer */}
              <button
                // onClick={() => onPaymentMethodSelect('bank')}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <FaRegMoneyBillAlt size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Thanh toán qua ngân hàng
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                </div>
              </button>

              {/* Payment Method 2: Momo */}
              <button
                // onClick={() => onPaymentMethodSelect('momo')}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Ví MoMo</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Thanh toán nhanh
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                </div>
              </button>

              {/* Payment Method 3: Cash on Delivery */}
              <button
                // onClick={() => onPaymentMethodSelect('cash')}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <FaRegMoneyBillAlt size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Thanh toán khi nhận hàng
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Trả tiền mặt khi nhận hàng
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-md font-semibold cursor-pointer"
          >
            Xác nhận thông tin
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default PayModal;
