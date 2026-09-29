import { Divider, Form, Input, Modal, Tag } from 'antd';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getData } from '../../../helpers/request';
import { convertStringToPrice } from '../../../helpers/func';

interface AdminOrderModalProps {
  open: boolean;
  onCancel: () => void;
  orderCode: string;
}

interface FieldType {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const AdminOrderModal = ({
  open,
  onCancel,
  orderCode,
}: AdminOrderModalProps) => {
  const [form] = Form.useForm();

  const { data, isPending } = useQuery({
    queryKey: ['mypay', orderCode],
    queryFn: () => getData(`pays/get-pay/${orderCode}`),
    enabled: !!orderCode && !!open,
  });
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.data?.info?.name || '',
        email: data?.data?.info?.email || '',
        phone: data?.data?.info?.phone || '',
        address: data?.data?.info?.address || '',
      });
    }
  }, [data, form]);

  return (
    <Modal
      title="Thông tin đơn hàng"
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={open}
      onOk={onCancel}
      onCancel={onCancel}
      width={{
        xs: '90%',
        sm: '80%',
        md: '50%',
        lg: '60%',
        xl: '60%',
        xxl: '60%',
      }}
      footer={null}
      className="h-auto!"
    >
      <div className="min-h-auto! py-10 px-2">
        {isPending || !data ? (
          <div className="flex items-center justify-center min-h-screen ">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <h1 className="text-[24px] font-bold mb-6">
              Mã giao dịch{' '}
              <span className="text-yellow-700">
                #{orderCode}
                <span className="ms-3">
                  {data?.data?.status == 'PAID' ? (
                    <Tag color="green">Thanh toán</Tag>
                  ) : data?.data?.status == 'PENDING' ? (
                    <Tag color="blue">Đang xử lý</Tag>
                  ) : (
                    <Tag color="red">Thất bại</Tag>
                  )}
                </span>
              </span>
            </h1>
            <div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3">
                  <p className="font-medium text-lg text-center">
                    Thông tin nhận hàng
                  </p>
                  <Form
                    disabled
                    form={form}
                    name="OrderForm"
                    layout="vertical"
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    autoComplete="off"
                  >
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
                          {
                            required: true,
                            message: 'Vui lòng nhập Địa Chỉ !',
                          },
                          { min: 3, message: 'Địa Chỉ tối thiểu 3 ký tự !' },
                        ]}
                      >
                        <Input className="h-10" />
                      </Form.Item>

                      <Form.Item<FieldType>
                        label="Số Điện Thoại"
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: 'Vui lòng nhập Số Điện Thoại !',
                          },
                          {
                            min: 10,
                            message: 'Số Điện Thoại tối thiểu 10 ký tự !',
                          },
                          {
                            max: 15,
                            message: 'Số Điện Thoại tối đa 15 ký tự !',
                          },
                        ]}
                      >
                        <Input className="h-10" />
                      </Form.Item>
                    </div>
                  </Form>
                </div>
                <div className="pt-3 overflow-auto ">
                  <div className="pb-2">
                    {data?.data?.items &&
                      data?.data?.items?.map((item: any) => (
                        <div
                          key={item.productVariant._id}
                          className="flex items-center gap-2 max-h-[200px] overflow-auto scroll-smooth"
                        >
                          <img
                            src={
                              item?.productVariant?.imageColor ||
                              item?.productVariant?.product?.mainImage ||
                              ''
                            }
                            alt={item?.productVariant?.product?.name || ''}
                            className="w-15 h-15 object-cover rounded-xl border border-gray-100 bg-gray-50"
                          />

                          <div className="flex justify-between items-center gap-5 w-full h-full">
                            <div className="">
                              <p className="text-sm font-medium text-gray-800 ">
                                {item?.productVariant?.product?.name}
                              </p>
                              <span className="text-sm text-gray-500 ">
                                {item?.productVariant?.storage} |{' '}
                                {item?.productVariant?.color} |{' '}
                                {item?.productVariant?.condition}
                              </span>
                            </div>
                            <div className="flex justify-end items-center gap-3">
                              <span className="text-sm text-gray-500 truncate ">
                                {convertStringToPrice(
                                  item?.productVariant?.price
                                )}
                              </span>
                              <span className="text-sm text-gray-500 truncate ">
                                x{item?.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Total Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500">Tổng tiền hàng:</span>
                      <span className="font-bold text-gray-800">
                        {convertStringToPrice(data?.data?.totalAmount || 0)}
                      </span>
                    </div>
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
                        {convertStringToPrice(data?.data?.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AdminOrderModal;
