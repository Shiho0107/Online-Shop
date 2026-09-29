import { useQuery } from '@tanstack/react-query';
import {
  Space,
  Table,
  Tag,
  Input,
  Select,
  Switch,
  Popconfirm,
  Avatar,
  Card,
  Row,
  Col,
  Button,
} from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { deleteData, getData, updateDataAdmin } from '../../../helpers/request';
import type { userType } from '../../../helpers/type';
import AdminUserModal from './modal/AdminUserModal';

const AdminUserPage = () => {
  const [selectedData, setSelectedData] = useState<userType | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  const { data, isPending, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => getData(`users/`),
  });
  console.log('AdminUserPage: query data =', data, 'isPending =', isPending);

  const handleEdit = (_record: userType) => {
    setSelectedData(_record);
  };

  const handleToggleStatus = async (checked: boolean, _record: userType) => {
    try {
      const res = await updateDataAdmin(`users/${_record._id}`, { isActive: checked }, 'put');
      if (res?.success) {
        toast.success(`Đã ${checked ? 'mở khoá' : 'khoá'} tài khoản ${res?.data?.email || ''} thành công!`);
        refetch();
      } else {
        toast.error(res?.message || 'Không thể cập nhật trạng thái tài khoản!');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái!');
      console.error(error);
    }
  };

  const handleDelete = async (_record: userType) => {
    try {
      const res = await deleteData(`users/${_record._id}`);
      if (res?.success) {
        toast.success('Xoá người dùng thành công!');
        refetch();
      } else {
        toast.error(res?.message || 'Xoá người dùng thất bại!');
      }
    } catch (error) {
      console.log('handleDelete error : ', error);
      toast.error('Xoá người dùng thất bại!');
    }
  };

  // Filter and search logic
  const usersList: userType[] = data?.data || [];
  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (user.phone || '').includes(searchText);

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'blocked' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: TableProps<userType>['columns'] = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => {
        const vipColor = record.currentTier?.color || '';
        const vipName = record.currentTier?.name || '';
        let vipCrownType = '';
        if (vipColor) {
          if (vipName.includes('Đồng') || vipName.includes('Bronze')) vipCrownType = 'bronze';
          else if (vipName.includes('Bạc') || vipName.includes('Silver')) vipCrownType = 'silver';
          else if (vipName.includes('Vàng') || vipName.includes('Gold')) vipCrownType = 'gold';
          else if (vipName.includes('Bạch Kim') || vipName.includes('Platinum')) vipCrownType = 'platinum';
          else if (vipName.includes('Kim Cương') || vipName.includes('Diamond')) vipCrownType = 'diamond';
          else vipCrownType = 'gold';
        }

        return (
          <Space size="middle">
            <div className={vipColor ? 'vip-avatar-container' : ''} style={vipColor ? { background: vipColor } : {}}>
              {vipColor && (
                <div className={`vip-badge-crown ${vipCrownType}`} style={{ top: '-4px', right: '-4px', width: '15px', height: '15px', fontSize: '8px' }}>
                  👑
                </div>
              )}
              {record.userImage ? (
                <Avatar src={record.userImage} size={42} style={{ border: vipColor ? '1.5px solid white' : 'none' }} />
              ) : (
                <Avatar
                  style={{ 
                    backgroundColor: record.role === 'admin' ? '#d4b106' : '#1890ff',
                    border: vipColor ? '1.5px solid white' : 'none'
                  }}
                  icon={<UserOutlined />}
                  size={42}
                />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">{record.name || 'N/A'}</div>
              <div className="text-gray-400 text-xs">{record.email}</div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <span>{text || 'N/A'}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (text) => <span className="max-w-[200px] inline-block truncate">{text || 'N/A'}</span>,
    },
    {
      title: 'Tích luỹ & Hạng VIP',
      key: 'vip',
      render: (_, record) => {
        const spent = record.totalSpent || 0;
        const currentTierName = record.currentTier?.name || 'Thành viên thường';
        const discount = record.currentTier?.discount || 0;

        let tagColor = 'default';
        if (currentTierName.includes('Đồng') || currentTierName.includes('Bronze')) tagColor = 'orange';
        else if (currentTierName.includes('Bạc') || currentTierName.includes('Silver')) tagColor = 'blue';
        else if (currentTierName.includes('Vàng') || currentTierName.includes('Gold')) tagColor = 'gold';
        else if (currentTierName.includes('Bạch Kim') || currentTierName.includes('Platinum')) tagColor = 'cyan';
        else if (currentTierName.includes('Kim Cương') || currentTierName.includes('Diamond')) tagColor = 'purple';

        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-emerald-600 text-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(spent)}
            </span>
            <Tag color={tagColor} className="w-fit font-medium py-0.5 px-2">
              {currentTierName} {discount > 0 ? `(-${discount}%)` : ''}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: 'user' | 'admin') => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'} className="capitalize font-medium px-2 py-0.5">
          {role === 'admin' ? 'Admin' : 'User'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      render: (_, record) => (
        <Space size="small">
          <Switch
            checked={record.isActive}
            onChange={(checked) => handleToggleStatus(checked, record)}
            checkedChildren="Đang hoạt động"
            unCheckedChildren="Bị khoá"
          />
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-gray-500 text-xs">
          {date ? new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }) : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500 text-base" />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa thông tin"
          />
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác!"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined className="text-base" />}
              title="Xoá tài khoản"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminUserModal
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        refetch={refetch}
      />

      <Card className="shadow-sm border-slate-100">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo tên, email, sđt..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10 rounded-lg"
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              className="w-full h-10"
              placeholder="Chọn vai trò"
              value={filterRole}
              onChange={(value) => setFilterRole(value)}
            >
              <Select.Option value="all">Tất cả vai trò</Select.Option>
              <Select.Option value="admin">Quản trị viên (Admin)</Select.Option>
              <Select.Option value="user">Khách hàng (User)</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              className="w-full h-10"
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="blocked">Đang bị khoá</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6} className="text-right">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              className="h-10 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 border-slate-200"
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table<userType>
          rowKey="_id"
          columns={columns}
          dataSource={filteredUsers}
          loading={isPending}
          sticky
          scroll={{ y: 550 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng cộng ${total} người dùng`,
          }}
        />
      </div>
    </div>
  );
};

export default AdminUserPage;
