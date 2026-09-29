import { useQuery } from '@tanstack/react-query';
import {
  Space,
  Table,
  Tag,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  Card,
  Row,
  Col,
  Button,
  Divider,
  Modal,
  Form,
  Statistic,
  Select,
  DatePicker,
} from 'antd';
import type { TableProps } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  GiftOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { getData, updateDataAdmin, deleteData } from '../../../helpers/request';

const { RangePicker } = DatePicker;

interface VoucherType {
  _id?: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  scope: 'all' | 'category' | 'product' | 'variant';
  applicableCategory?: string | { _id: string; name: string };
  applicableProducts: string[] | Array<{ _id: string; name: string; mainImage?: string }>;
  applicableVariants: string[] | Array<{ _id: string; sku: string; price: number; storage: string; color: string; condition: string }>;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  limitPerUser: number;
  allowedVipTiers: string[] | Array<{ _id: string; name: string }>;
  isActive: boolean;
  createdAt?: string;
}


const AdminVoucherPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);

  const handleOpenDetails = (voucher: VoucherType) => {
    setSelectedVoucher(voucher);
    setIsDetailsOpen(true);
  };
  const [form] = Form.useForm();
  const [limitsForm] = Form.useForm();

  // Queries
  const { data: vouchersData, isPending: isVouchersPending, refetch: refetchVouchers } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: () => getData('vouchers/admin'),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getData('categories/'),
  });

  const { data: productsRes } = useQuery({
    queryKey: ['products'],
    queryFn: () => getData('products/?limit=1000'),
  });

  const { data: vipTiersRes } = useQuery({
    queryKey: ['vip-tiers'],
    queryFn: () => getData('vip-tiers/'),
  });

  const vouchersList: VoucherType[] = vouchersData?.data || [];
  const categoriesList = categoriesRes?.data || [];
  const productsList = productsRes?.data || [];
  const vipTiersList = vipTiersRes?.data || [];

  const handleOpenCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      discountType: 'percentage',
      scope: 'all',
      usageLimit: 100,
      limitPerUser: 1,
      isActive: true,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditLimits = (voucher: VoucherType) => {
    setSelectedVoucher(voucher);
    limitsForm.setFieldsValue({
      usageLimit: voucher.usageLimit,
      limitPerUser: voucher.limitPerUser,
    });
    setIsLimitsOpen(true);
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      const res = await deleteData(`vouchers/${id}`);
      if (res?.success) {
        toast.success('Xóa voucher thành công!');
        refetchVouchers();
      } else {
        toast.error(res?.message || 'Xóa voucher thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa voucher!');
    }
  };

  const handleToggleStatus = async (checked: boolean, voucher: VoucherType) => {
    try {
      const res = await updateDataAdmin(`vouchers/${voucher._id}/status`, { isActive: checked }, 'patch');
      if (res?.success) {
        toast.success(`Đã cập nhật trạng thái voucher ${voucher.code}`);
        refetchVouchers();
      } else {
        toast.error(res?.message || 'Lỗi khi cập nhật trạng thái voucher!');
      }
    } catch (error) {
      toast.error('Lỗi kết nối API!');
    }
  };

  const handleLimitsSubmit = async (values: any) => {
    if (!selectedVoucher?._id) return;
    try {
      const res = await updateDataAdmin(`vouchers/${selectedVoucher._id}/limits`, values, 'patch');
      if (res?.success) {
        toast.success('Cập nhật giới hạn voucher thành công!');
        setIsLimitsOpen(false);
        refetchVouchers();
      } else {
        toast.error(res?.message || 'Cập nhật thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi kết nối API!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString(),
      };
      delete payload.dates;

      const res = await updateDataAdmin('vouchers', payload, 'post');
      if (res?.success) {
        toast.success('Tạo voucher thành công!');
        setIsModalOpen(false);
        refetchVouchers();
      } else {
        toast.error(res?.message || 'Tạo voucher thất bại!');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi!');
    }
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const columns: TableProps<VoucherType>['columns'] = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (code: string, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" className="font-bold text-sm px-2 py-0.5 font-mono">{code}</Tag>
          <span className="text-gray-400 text-xs">{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'Loại Chiết Khấu',
      key: 'discount',
      render: (_, record) => {
        if (record.discountType === 'percentage') {
          return (
            <Space direction="vertical" size={0}>
              <span className="font-bold text-red-500">{record.discountValue}% Off</span>
              {record.maxDiscountAmount > 0 && (
                <span className="text-gray-400 text-xs">Tối đa: {formatVND(record.maxDiscountAmount)}</span>
              )}
            </Space>
          );
        }
        return <span className="font-bold text-green-600">-{formatVND(record.discountValue)}</span>;
      },
    },
    {
      title: 'Điều kiện tối thiểu',
      dataIndex: 'minOrderAmount',
      key: 'minOrderAmount',
      render: (amount: number) => (
        <span className="font-medium text-slate-700">
          {amount > 0 ? formatVND(amount) : 'Không yêu cầu'}
        </span>
      ),
    },
    {
      title: 'Hạng VIP áp dụng',
      dataIndex: 'allowedVipTiers',
      key: 'allowedVipTiers',
      render: (allowedTiers: string[]) => {
        if (!allowedTiers || allowedTiers.length === 0) {
          return <Tag color="default">Mọi thành viên</Tag>;
        }
        return allowedTiers.map(tierId => {
          const tier = vipTiersList.find((t: any) => t._id === tierId);
          return <Tag key={tierId} color="gold">{tier ? tier.name : 'VIP'}</Tag>;
        });
      },
    },
    {
      title: 'Lượt sử dụng',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-slate-800">
            {record.usedCount} / {record.usageLimit}
          </span>
          <span className="text-gray-400 text-[10px]">Mỗi user: tối đa {record.limitPerUser} lần</span>
        </Space>
      ),
    },
    {
      title: 'Thời hạn',
      key: 'dateRange',
      render: (_, record) => (
        <Space direction="vertical" size={0} className="text-xs">
          <span>Bắt đầu: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</span>
          <span>Kết thúc: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleStatus(checked, record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetails(record)}
            size="small"
          >
            Chi tiết
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenEditLimits(record)}
            size="small"
          >
            Giới hạn
          </Button>
          <Popconfirm
            title="Xóa voucher"
            description="Bạn có chắc chắn muốn xóa vĩnh viễn voucher này không?"
            onConfirm={() => handleDeleteVoucher(record._id!)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GiftOutlined className="text-blue-500" /> Hệ thống quản lý Sale Voucher
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Thiết lập mã giảm giá, cấu hình theo hạng thành viên VIP, quản lý số lượng phát hành, theo dõi và hủy giao dịch dùng voucher.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          Tạo mã Voucher mới
        </Button>
      </div>

      {/* Statistics board */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Statistic
              title="Tổng Voucher đã tạo"
              value={vouchersList.length}
              prefix={<GiftOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <Statistic
              title="Voucher đang hiệu lực"
              value={vouchersList.filter((v) => v.isActive && dayjs(v.endDate).isAfter(dayjs())).length}
              prefix={<CalendarOutlined className="text-emerald-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <Statistic
              title="Tổng lượt sử dụng voucher"
              value={vouchersList.reduce((sum, v) => sum + v.usedCount, 0)}
              prefix={<TeamOutlined className="text-purple-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table view */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table<VoucherType>
          rowKey="_id"
          columns={columns}
          dataSource={vouchersList}
          loading={isVouchersPending}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Creation Modal */}
      <Modal
        title="Tạo Voucher mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Tạo mới"
        cancelText="Hủy bỏ"
        onOk={() => form.submit()}
        width={650}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[
                  { required: true, message: 'Nhập mã voucher!' },
                  { pattern: /^[A-Z0-9]+$/, message: 'Chỉ cho phép chữ in hoa và số!' }
                ]}
              >
                <Input placeholder="Ví dụ: APPLE500K" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Mô tả chiến dịch"
                rules={[{ required: true, message: 'Nhập mô tả!' }]}
              >
                <Input placeholder="Mô tả ngắn cho khách hàng thấy" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Hình thức chiết khấu"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Phần trăm (%)', value: 'percentage' },
                    { label: 'Khấu trừ trực tiếp (VND)', value: 'fixed' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá trị giảm"
                rules={[{ required: true, message: 'Nhập giá trị!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDiscountAmount"
                label="Mức giảm tối đa (VND) - Đối với %"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Bỏ trống nếu không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minOrderAmount"
                label="Giá trị đơn tối thiểu (VND)"
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="dates"
                label="Thời hạn áp dụng"
                rules={[{ required: true, message: 'Chọn khoảng thời gian!' }]}
              >
                <RangePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="scope" label="Phạm vi áp dụng">
                <Select
                  options={[
                    { label: 'Toàn bộ cửa hàng', value: 'all' },
                    { label: 'Theo danh mục sản phẩm', value: 'category' },
                    { label: 'Theo sản phẩm cụ thể', value: 'product' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="allowedVipTiers" label="Giới hạn hạng VIP">
                <Select
                  mode="multiple"
                  placeholder="Để trống nếu áp dụng cho mọi người"
                  style={{ width: '100%' }}
                  options={vipTiersList.map((t: any) => ({ label: t.name, value: t._id }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Conditional scope items */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.scope !== curr.scope}>
            {({ getFieldValue }) => {
              const scope = getFieldValue('scope');
              if (scope === 'category') {
                return (
                  <Form.Item name="applicableCategory" label="Chọn danh mục áp dụng" rules={[{ required: true }]}>
                    <Select options={categoriesList.map((c: any) => ({ label: c.name, value: c._id }))} />
                  </Form.Item>
                );
              }
              if (scope === 'product') {
                return (
                  <Form.Item name="applicableProducts" label="Chọn sản phẩm áp dụng" rules={[{ required: true }]}>
                    <Select
                      mode="multiple"
                      showSearch
                      optionFilterProp="label"
                      placeholder="Chọn hoặc gõ để tìm sản phẩm..."
                      options={productsList.map((p: any) => ({ label: p.name, value: p._id }))}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="usageLimit" label="Tổng số lượng phát hành" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="limitPerUser" label="Giới hạn dùng/Người dùng" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Editing limits modal */}
      <Modal
        title="Điều chỉnh giới hạn Voucher"
        open={isLimitsOpen}
        onCancel={() => setIsLimitsOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy bỏ"
        onOk={() => limitsForm.submit()}
        destroyOnClose
      >
        <Form form={limitsForm} layout="vertical" onFinish={handleLimitsSubmit} className="mt-4">
          <Form.Item name="usageLimit" label="Tổng số lượng phát hành" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="limitPerUser" label="Giới hạn dùng/Người dùng" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>



      {/* Voucher Details Modal */}
      <Modal
        title={`Chi tiết cấu hình Voucher: ${selectedVoucher?.code || ''}`}
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailsOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
        destroyOnClose
      >
        {selectedVoucher && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block text-xs">Mô tả</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedVoucher.description || '(Không có mô tả)'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Trạng thái</span>
                <Tag color={selectedVoucher.isActive ? 'green' : 'red'} className="font-bold">
                  {selectedVoucher.isActive ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                </Tag>
              </div>
            </div>

            <Divider className="my-2!" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block text-xs">Phương thức giảm giá</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedVoucher.discountType === 'percentage'
                    ? `Chiết khấu ${selectedVoucher.discountValue}%`
                    : `Giảm cố định ${formatVND(selectedVoucher.discountValue)}`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Giá trị giảm tối đa</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedVoucher.maxDiscountAmount > 0
                    ? formatVND(selectedVoucher.maxDiscountAmount)
                    : 'Không giới hạn'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block text-xs">Đơn hàng tối thiểu</span>
                <span className="font-semibold text-slate-800 text-sm">{formatVND(selectedVoucher.minOrderAmount)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs">Giới hạn mua / khách hàng</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedVoucher.limitPerUser} lần</span>
              </div>
            </div>

            <Divider className="my-2!" />

            <div>
              <span className="text-gray-400 block text-xs mb-1">Hạng VIP được áp dụng</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedVoucher.allowedVipTiers && (selectedVoucher.allowedVipTiers as any[]).length > 0 ? (
                  (selectedVoucher.allowedVipTiers as any[]).map((tier) => (
                    <Tag key={tier._id} color="purple" className="font-semibold">{tier.name}</Tag>
                  ))
                ) : (
                  <Tag color="default">Tất cả khách hàng (Không giới hạn VIP)</Tag>
                )}
              </div>
            </div>

            <Divider className="my-2!" />

            <div>
              <span className="text-gray-400 block text-xs mb-2">Phạm vi áp dụng (Phân loại: {selectedVoucher.scope.toUpperCase()})</span>
              {selectedVoucher.scope === 'all' && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 font-semibold mt-1">
                  Áp dụng cho toàn bộ các sản phẩm trong cửa hàng.
                </div>
              )}

              {selectedVoucher.scope === 'category' && selectedVoucher.applicableCategory && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 mt-1">
                  Danh mục áp dụng: <strong className="font-semibold">{(selectedVoucher.applicableCategory as any).name || 'Danh mục'}</strong>
                </div>
              )}

              {selectedVoucher.scope === 'product' && (
                <div className="space-y-2 mt-1">
                  <span className="text-xs text-gray-500 font-medium">Danh sách sản phẩm được áp dụng:</span>
                  <div className="max-h-[200px] overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100 bg-white">
                    {selectedVoucher.applicableProducts && (selectedVoucher.applicableProducts as any[]).map((p) => (
                      <div key={p._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 text-xs">
                        <img src={p.mainImage || '/placeholder.png'} className="w-8 h-8 object-contain border border-slate-100 rounded bg-slate-50" />
                        <span className="font-semibold text-slate-800">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVoucher.scope === 'variant' && (
                <div className="space-y-2 mt-1">
                  <span className="text-xs text-gray-500 font-medium">Danh sách các phiên bản cấu hình (biến thể) được áp dụng:</span>
                  <div className="max-h-[200px] overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100 bg-white">
                    {selectedVoucher.applicableVariants && (selectedVoucher.applicableVariants as any[]).map((v) => (
                      <div key={v._id} className="p-2 hover:bg-slate-50 text-xs flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800">Phiên bản: {v.storage} - {v.color} - {v.condition}</div>
                          <div className="text-[10px] text-gray-400 font-mono">SKU: {v.sku}</div>
                        </div>
                        <span className="font-semibold text-blue-600">{formatVND(v.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminVoucherPage;
