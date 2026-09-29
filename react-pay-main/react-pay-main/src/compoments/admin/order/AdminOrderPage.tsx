import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FaBars } from 'react-icons/fa6';
import {
  Avatar,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  type TableProps,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { getData } from '../../../helpers/request';
import { convertStringToPrice, formattedDate } from '../../../helpers/func';
import { useDebounce } from '../../../helpers/hook';
import AdminOrderModal from './AdminOrderModal';

const AdminOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const page = searchParams.get('p') || searchParams.get('page') || 1;
  const limit = searchParams.get('l') || searchParams.get('limit') || 10;
  const status = searchParams.get('s') || searchParams.get('status') || '';
  const keyword = useDebounce(searchText, 500);

  const columns: TableProps<any>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'number_id',
      key: 'number_id',
      width: 100,
      render: (_text, _, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      width: 350,
      render: (_, record) => (
        <Space size="middle">
          {record.userImage ? (
            <Avatar src={record.userImage} size={42} />
          ) : (
            <Avatar
              style={{
                backgroundColor:
                  record.role === 'admin' ? '#d4b106' : '#1890ff',
              }}
              icon={<UserOutlined />}
              size={42}
            />
          )}
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {record.info.name || 'N/A'}
            </div>
            <div className="text-gray-400 text-xs">{record.info.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Mã hoá đơn',
      dataIndex: 'codeOrder',
      render: (_, _record) => <span>#{_record.orderCode}</span>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, _record) => (
        <span>{convertStringToPrice(Number(_record.totalAmount))}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: any) => {
        return record.status == 'PAID' ? (
          <Tag color="green">Thanh toán</Tag>
        ) : record.status == 'PENDING' ? (
          <Tag color="blue">Đang xử lý</Tag>
        ) : (
          <Tag color="red">Thất bại</Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (_, _record) => <span>{formattedDate(_record.createdAt)}</span>,
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (_, _record) => <span>{formattedDate(_record.updatedAt)}</span>,
    },
    {
      title: '',
      key: 'action',
      render: (_, _record) => (
        <div
          className="flex justify-center items-center"
          onClick={() => {
            setOrderCode(_record?.orderCode);
            setOpenModal(true);
          }}
        >
          {/* <Link to={`/mypay/${_record.orderCode}`}> */}
          <FaBars className="cursor-pointer" />
          {/* </Link> */}
        </div>
      ),
    },
  ];

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'l') {
      params.set(key, value);
      params.set('p', '1');
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const { data, isPending } = useQuery({
    queryKey: ['pays', limit, page, status, keyword],
    queryFn: () =>
      getData(
        `pays/get-pay?search=${keyword}&page=${page}&limit=${limit}&s=${status}`
      ),
  });

  // console.log('data', data);
  return (
    <>
      <AdminOrderModal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        orderCode={orderCode}
      />
      <Card className="shadow-sm border-slate-100">
        <Row gutter={[16, 16]} align="middle" justify={'end'}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm mã hoá đơn"
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
              placeholder="Trạng thái"
              defaultValue={status || ''}
              onChange={(value) => handleChange('s', value)}
            >
              <Select.Option value="">Tất cả trạng thái</Select.Option>
              <Select.Option value="PAID">Đã thanh toán</Select.Option>
              <Select.Option value="PENDING">Đang xử lý</Select.Option>
              <Select.Option value="CANCELLED">Thất bại</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>
      <Table<any>
        rowKey="_id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isPending}
        sticky
        scroll={{ y: 500 }}
      />
    </>
  );
};

export default AdminOrderPage;
