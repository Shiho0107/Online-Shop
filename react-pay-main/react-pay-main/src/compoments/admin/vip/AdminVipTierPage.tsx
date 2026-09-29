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
  Modal,
  Form,
  Statistic,
} from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CrownOutlined,
  PercentageOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { deleteData, getData, updateDataAdmin } from '../../../helpers/request';

interface VipTierType {
  _id?: string;
  name: string;
  minSpent: number;
  discount: number;
  color: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminVipTierPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<VipTierType | null>(null);
  const [form] = Form.useForm();

  const { data, isPending, refetch } = useQuery({
    queryKey: ['vip-tiers'],
    queryFn: () => getData('vip-tiers/'),
  });

  const vipTiersList: VipTierType[] = data?.data || [];

  const handleOpenCreate = () => {
    setEditingTier(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tier: VipTierType) => {
    setEditingTier(tier);
    form.setFieldsValue(tier);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (checked: boolean, tier: VipTierType) => {
    try {
      const res = await updateDataAdmin(`vip-tiers/${tier._id}`, { isActive: checked }, 'put');
      if (res?.success) {
        toast.success(`Đã cập nhật trạng thái phân hạng ${tier.name} thành công!`);
        refetch();
      } else {
        toast.error(res?.message || 'Không thể cập nhật trạng thái phân hạng!');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái!');
      console.error(error);
    }
  };

  const handleDelete = async (tier: VipTierType) => {
    try {
      const res = await deleteData(`vip-tiers/${tier._id}`);
      if (res?.success) {
        toast.success('Xoá phân hạng VIP thành công!');
        refetch();
      } else {
        toast.error(res?.message || 'Xoá phân hạng VIP thất bại!');
      }
    } catch (error) {
      console.error('handleDelete error: ', error);
      toast.error('Xoá phân hạng VIP thất bại!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTier?._id) {
        // Update
        const res = await updateDataAdmin(`vip-tiers/${editingTier._id}`, values, 'put');
        if (res?.success) {
          toast.success('Cập nhật phân hạng VIP thành công!');
          setIsModalOpen(false);
          refetch();
        } else {
          toast.error(res?.message || 'Cập nhật phân hạng VIP thất bại!');
        }
      } else {
        // Create
        const res = await updateDataAdmin('vip-tiers/', values, 'post');
        if (res?.success) {
          toast.success('Tạo phân hạng VIP mới thành công!');
          setIsModalOpen(false);
          refetch();
        } else {
          toast.error(res?.message || 'Tạo phân hạng VIP mới thất bại!');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu thông tin!');
      console.error(error);
    }
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getTierTagColor = (name: string) => {
    if (name.includes('Đồng') || name.includes('Bronze')) return 'orange';
    if (name.includes('Bạc') || name.includes('Silver')) return 'blue';
    if (name.includes('Vàng') || name.includes('Gold')) return 'gold';
    if (name.includes('Bạch Kim') || name.includes('Platinum')) return 'cyan';
    if (name.includes('Kim Cương') || name.includes('Diamond')) return 'purple';
    return 'default';
  };

  const columns: TableProps<VipTierType>['columns'] = [
    {
      title: 'Phân hạng VIP',
      key: 'name',
      render: (_, record) => (
        <Space size="middle">
          <CrownOutlined style={{ fontSize: '18px', color: '#faad14' }} />
          <div>
            <div className="font-semibold text-slate-800 text-sm">{record.name}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Chi tiêu tích lũy tối thiểu',
      dataIndex: 'minSpent',
      key: 'minSpent',
      render: (minSpent: number) => (
        <span className="font-semibold text-emerald-600">
          {formatVND(minSpent)}
        </span>
      ),
      sorter: (a, b) => a.minSpent - b.minSpent,
    },
    {
      title: 'Chiết khấu đặc quyền',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number) => (
        <Tag color="volcano" className="font-semibold px-2 py-0.5">
          {discount}%
        </Tag>
      ),
      sorter: (a, b) => a.discount - b.discount,
    },
    {
      title: 'Khung Avatar',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Space size="small">
          <div 
            className="w-6 h-6 rounded-full border border-slate-300 flex-shrink-0" 
            style={{ background: color || '#faad14' }}
            title={color}
          />
          <span className="text-xs font-mono text-gray-500 max-w-[120px] truncate block" title={color}>
            {color || '#faad14'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái hoạt động',
      key: 'isActive',
      render: (_, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleToggleStatus(checked, record)}
          checkedChildren="Đang chạy"
          unCheckedChildren="Ngừng"
        />
      ),
    },
    {
      title: 'Thao tác chỉnh sửa',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500 text-base" />}
            onClick={() => handleOpenEdit(record)}
            title="Sửa điều kiện"
          />
          <Popconfirm
            title="Xóa phân hạng này"
            description="Mức tích lũy và đặc quyền của phân hạng này sẽ bị xóa. Tiếp tục?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined className="text-base" />}
              title="Xoá phân hạng"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CrownOutlined className="text-yellow-500" /> Cấu hình đặc quyền & Phân hạng VIP
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Thiết lập điều kiện mức chi tiêu tích lũy (VND) để tự động thăng hạng khách hàng và kích hoạt chiết khấu hóa đơn tương ứng.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          Tạo phân hạng mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Statistic
              title="Tổng phân hạng VIP"
              value={vipTiersList.length}
              prefix={<CrownOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <Statistic
              title="Phân hạng đang kích hoạt"
              value={vipTiersList.filter((t) => t.isActive).length}
              prefix={<CrownOutlined className="text-emerald-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <Statistic
              title="Mức chiết khấu cao nhất"
              value={vipTiersList.length > 0 ? Math.max(...vipTiersList.map((t) => t.discount)) : 0}
              suffix="%"
              prefix={<PercentageOutlined className="text-purple-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Grid displays visual premium view */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {vipTiersList.map((tier) => {
          const color = getTierTagColor(tier.name);
          return (
            <Card
              key={tier._id}
              className={`shadow-sm border border-slate-200/60 overflow-hidden relative ${
                !tier.isActive ? 'opacity-60' : ''
              }`}
              styles={{ body: { padding: '20px 16px' } }}
            >
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-6 -mt-6 flex justify-end items-start p-4"
                style={{ background: tier.color || '#faad14', opacity: 0.85 }}
              >
                <CrownOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
              </div>
              <div className="space-y-4">
                <div>
                  <Tag color={color} className="font-semibold text-xs py-0.5 px-2">
                    {tier.name}
                  </Tag>
                  <h3 className="text-slate-800 font-bold mt-2 truncate max-w-[80%]">
                    {tier.name}
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Yêu cầu tích luỹ</div>
                  <div className="text-slate-700 font-semibold text-sm">
                    {formatVND(tier.minSpent)}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Chiết khấu đặc quyền</div>
                  <Tag color="volcano" className="font-bold m-0">
                    -{tier.discount}%
                  </Tag>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table<VipTierType>
          rowKey="_id"
          columns={columns}
          dataSource={vipTiersList}
          loading={isPending}
          pagination={false}
        />
      </div>

      <Modal
        title={editingTier ? 'Cập nhật phân hạng VIP' : 'Thêm mới phân hạng VIP'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText={editingTier ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy bỏ"
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên phân hạng VIP"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phân hạng VIP!' },
              { max: 50, message: 'Tên phân hạng không dài quá 50 ký tự!' }
            ]}
          >
            <Input
              prefix={<CrownOutlined className="text-gray-400" />}
              placeholder="Ví dụ: VIP Vàng, VIP Kim Cương..."
            />
          </Form.Item>

          <Form.Item
            name="minSpent"
            label="Số tiền tích luỹ yêu cầu (VND)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền tích luỹ yêu cầu!' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              prefix={<DollarOutlined className="text-emerald-500" />}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={((value: string | undefined) => value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any}
              placeholder="Nhập số tiền tối thiểu để đạt phân hạng"
            />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Chiết khấu đặc quyền (%)"
            rules={[
              { required: true, message: 'Vui lòng nhập phần trăm chiết khấu!' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              prefix={<PercentageOutlined className="text-amber-500" />}
              placeholder="Phần trăm chiết khấu trên mỗi đơn hàng (0 - 100)"
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc / Gradient khung Avatar"
            rules={[
              { required: true, message: 'Vui lòng chọn hoặc nhập màu sắc/gradient!' },
            ]}
          >
            <Input
              placeholder="Nhập mã màu HEX (#ffa500) hoặc CSS gradient (linear-gradient(...))"
            />
          </Form.Item>

          <div className="mb-5">
            <label className="text-slate-500 text-xs font-semibold mb-2 block">
              Gợi ý các gradient cao cấp:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Đồng Premium', value: 'linear-gradient(135deg, #cd7f32, #a05a2c)' },
                { name: 'Bạc Glow', value: 'linear-gradient(135deg, #c0c0c0, #708090)' },
                { name: 'Vàng Luxury', value: 'linear-gradient(135deg, #ffd700, #ffa500, #ff8c00)' },
                { name: 'Bạch Kim Aurora', value: 'linear-gradient(135deg, #e5e4e2, #00f2fe, #4facfe)' },
                { name: 'Kim Cương Cosmic', value: 'linear-gradient(45deg, #b000ff, #00e1ff, #ff0077, #b000ff)' },
                { name: 'Hỏa Ngọc (Ruby)', value: 'linear-gradient(135deg, #ff007f, #ff4500)' },
                { name: 'Lục Bảo (Emerald)', value: 'linear-gradient(135deg, #00ff87, #60efff)' },
                { name: 'Lam Ngọc (Sapphire)', value: 'linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)' },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => form.setFieldsValue({ color: p.value })}
                  className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-lg hover:border-blue-500 cursor-pointer text-left transition-all"
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                    style={{ background: p.value }}
                  />
                  <span className="text-[10px] font-medium text-slate-700 truncate block">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Form.Item
            name="isActive"
            label="Kích hoạt phân hạng"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVipTierPage;
