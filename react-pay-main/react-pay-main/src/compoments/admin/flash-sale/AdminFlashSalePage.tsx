import { useQuery } from '@tanstack/react-query';
import {
  Space,
  Table,
  Tag,
  Input,
  InputNumber,
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Statistic,
  Select,
  DatePicker,
  List,
  Popconfirm,
} from 'antd';
import type { TableProps } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { getData, updateDataAdmin, deleteData } from '../../../helpers/request';

const getEventStatus = (
  event: FlashSaleEventType
): 'scheduled' | 'active' | 'ended' | 'cancelled' => {
  if (event.status === 'cancelled') return 'cancelled';
  const now = Date.now();
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();

  if (now > end) return 'ended';
  if (now >= start && now <= end) return 'active';
  return 'scheduled';
};

const { RangePicker } = DatePicker;

interface FlashSaleEventType {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  isActive: boolean;
  applicableCategory?: {
    _id: string;
    name: string;
  };
  discountPercentage?: number;
}

interface FlashSaleItemType {
  _id: string;
  product: {
    _id: string;
    name: string;
    mainImage: string;
    category?: {
      _id: string;
      name: string;
    };
    serie?: {
      _id: string;
      name: string;
    };
  };
  productVariant: {
    _id: string;
    sku: string;
    price: number;
    originalPrice?: number;
    storage: string;
    color: string;
    condition: string;
  };
  flashSalePrice: number;
  flashSaleStock: number;
  soldCount: number;
  limitPerUser: number;
  isActive: boolean;
}

const AdminFlashSalePage = () => {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isViewItemsModalOpen, setIsViewItemsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FlashSaleEventType | null>(
    null
  );
  const [eventForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  // const [tick, setTick] = useState(0);

  // // Auto tick every 5 seconds to update real-time status tags (e.g. auto switch to ended when endTime passes)
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTick((prev) => prev + 1);
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, []);

  // Queries
  const {
    data: eventsData,
    isPending: isEventsPending,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['admin-flash-sales'],
    queryFn: () => getData('flash-sales/events'),
  });

  const { data: productsRes } = useQuery({
    queryKey: ['products'],
    queryFn: () => getData('products/?limit=1000'),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getData('categories/'),
  });

  const {
    data: eventItemsData,
    isPending: isItemsPending,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ['event-items', selectedEvent?._id],
    queryFn: () => getData(`flash-sales/events/${selectedEvent?._id}/items`),
    enabled: !!selectedEvent?._id,
  });

  const eventsList: FlashSaleEventType[] = eventsData?.data || [];
  const productsList = productsRes?.data || [];
  const categoriesList = categoriesRes?.data || [];
  const eventItemsList: FlashSaleItemType[] = eventItemsData?.data || [];

  const handleOpenCreateEvent = () => {
    eventForm.resetFields();
    eventForm.setFieldsValue({ status: 'scheduled' });
    setIsEventModalOpen(true);
  };

  const handleOpenAddItem = (event: FlashSaleEventType) => {
    setSelectedEvent(event);
    itemForm.resetFields();
    const defaultPct = event.discountPercentage || 0;
    itemForm.setFieldsValue({
      limitPerUser: 1,
      pricingMethod: defaultPct > 0 ? 'percentage' : 'price',
      discountPercentage: defaultPct > 0 ? defaultPct : undefined,
      category: event.applicableCategory?._id || undefined,
    });
    setIsAddItemModalOpen(true);
  };

  const handleOpenViewItems = (event: FlashSaleEventType) => {
    setSelectedEvent(event);
    setIsViewItemsModalOpen(true);
  };

  const handleEventSubmit = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || '',
        startTime: values.dates[0].toISOString(),
        endTime: values.dates[1].toISOString(),
        status: values.status,
        applicableCategory: values.applicableCategory || null,
        discountPercentage: values.discountPercentage || 0,
      };

      const res = await updateDataAdmin('flash-sales/events', payload, 'post');
      if (res?.success) {
        toast.success('Tạo sự kiện Flash Sale thành công!');
        setIsEventModalOpen(false);
        refetchEvents();
      } else {
        toast.error(res?.message || 'Tạo sự kiện thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi kết nối API!');
    }
  };
  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await deleteData(`flash-sales/events/${id}`);
      if (res?.success) {
        toast.success('Xóa sự kiện Flash Sale thành công!');
        refetchEvents();
      } else {
        toast.error(res?.message || 'Xóa sự kiện thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi khi xóa sự kiện Flash Sale!');
    }
  };

  const handleAddItemSubmit = async (values: any) => {
    if (!selectedEvent?._id) return;
    try {
      const payload = {
        product: values.product,
        pricingMethod: values.pricingMethod,
        discountPercentage: values.discountPercentage,
        flashSalePrice: values.flashSalePrice,
        flashSaleStock: values.flashSaleStock,
        limitPerUser: values.limitPerUser,
      };
      const res = await updateDataAdmin(
        `flash-sales/events/${selectedEvent._id}/items`,
        payload,
        'post'
      );
      if (res?.success) {
        toast.success('Thêm sản phẩm vào Flash Sale thành công!');
        setIsAddItemModalOpen(false);
        if (selectedEvent?._id) {
          refetchItems();
        }
      } else {
        toast.error(res?.message || 'Thêm sản phẩm thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi kết nối API!');
    }
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const columns: TableProps<FlashSaleEventType>['columns'] = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-slate-800">{name}</span>
          <span className="text-gray-400 text-xs">{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Mặt hàng áp dụng',
      dataIndex: 'applicableCategory',
      key: 'applicableCategory',
      render: (category: any) => (
        <Tag
          color={category ? 'blue' : 'default'}
          className="font-semibold text-[10px] uppercase font-mono"
        >
          {category ? category.name : 'TẤT CẢ MẶT HÀNG'}
        </Tag>
      ),
    },
    {
      title: 'Giảm giá chung',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      render: (pct: number) => (
        <span className="font-semibold text-red-500 text-sm">
          {pct > 0 ? `-${pct}%` : 'Tùy chỉnh'}
        </span>
      ),
      sorter: (a, b) =>
        (a.discountPercentage || 0) - (b.discountPercentage || 0),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const effectiveStatus = getEventStatus(record);
        let color = 'default';
        let label = 'Chờ chạy';
        if (effectiveStatus === 'active') {
          color = 'orange';
          label = 'Đang diễn ra';
        } else if (effectiveStatus === 'ended') {
          color = 'red';
          label = 'Đã kết thúc';
        } else if (effectiveStatus === 'cancelled') {
          color = 'purple';
          label = 'Đã hủy';
        }
        return (
          <Tag color={color} className="font-bold">
            {label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const effectiveStatus = getEventStatus(record);
        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleOpenViewItems(record)}
              size="small"
            >
              Xem sản phẩm
            </Button>
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={() => handleOpenAddItem(record)}
              size="small"
              disabled={
                effectiveStatus === 'ended' || effectiveStatus === 'cancelled'
              }
            >
              Thêm SP
            </Button>
            <Popconfirm
              title="Xóa sự kiện Flash Sale"
              description="Bạn có chắc chắn muốn xóa vĩnh viễn sự kiện này cùng toàn bộ các sản phẩm đã cài đặt không?"
              onConfirm={() => handleDeleteEvent(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} size="small">
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ThunderboltOutlined className="text-orange-500" /> Hệ thống Flash
            Sale
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Lên lịch sự kiện Flash Sale theo giờ vàng, khóa giá sốc cho các biến
            thể sản phẩm, giới hạn lượt mua và theo dõi tồn kho trực tiếp.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateEvent}
          className="h-10 rounded-lg bg-orange-500 hover:bg-orange-600 border-none"
        >
          Tạo sự kiện Flash Sale
        </Button>
      </div>

      {/* Summary dashboard */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-linear-to-r from-orange-50 to-amber-50">
            <Statistic
              title="Tổng sự kiện"
              value={eventsList.length}
              prefix={<CalendarOutlined className="text-orange-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-linear-to-r from-red-50 to-orange-50">
            <Statistic
              title="Sự kiện đang chạy"
              value={
                eventsList.filter((e) => getEventStatus(e) === 'active').length
              }
              prefix={<ThunderboltOutlined className="text-red-500 mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm border-slate-100 bg-linear-to-r from-blue-50 to-cyan-50">
            <Statistic
              title="Sự kiện sắp bắt đầu"
              value={
                eventsList.filter((e) => getEventStatus(e) === 'scheduled')
                  .length
              }
              prefix={<LineChartOutlined className="text-blue-500 mr-2" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Events Table list */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <Table<FlashSaleEventType>
          rowKey="_id"
          columns={columns}
          dataSource={eventsList}
          loading={isEventsPending}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Create Event Modal */}
      <Modal
        title="Lên lịch Flash Sale mới"
        open={isEventModalOpen}
        onCancel={() => setIsEventModalOpen(false)}
        okText="Lên lịch"
        cancelText="Hủy bỏ"
        onOk={() => eventForm.submit()}
        destroyOnClose
      >
        <Form
          form={eventForm}
          layout="vertical"
          onFinish={handleEventSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên chương trình / Khung giờ"
            rules={[{ required: true, message: 'Nhập tên chương trình!' }]}
          >
            <Input placeholder="Ví dụ: Giờ vàng 9/9 - Sale Sập Sàn" />
          </Form.Item>
          <Form.Item name="description" label="Chi tiết sự kiện">
            <Input.TextArea rows={3} placeholder="Mô tả sự kiện Flash Sale" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Thời gian diễn ra"
            rules={[{ required: true, message: 'Chọn khoảng thời gian!' }]}
          >
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái khởi tạo">
            <Select
              options={[
                { label: 'Lên lịch (Scheduled)', value: 'scheduled' },
                { label: 'Kích hoạt ngay (Active)', value: 'active' },
              ]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="applicableCategory" label="Ngành hàng giới hạn">
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Áp dụng toàn bộ"
                  allowClear
                  options={categoriesList.map((c: any) => ({
                    label: c.name,
                    value: c._id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountPercentage"
                label="Tỷ lệ giảm giá mặc định (%)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={99}
                  prefix="%"
                  placeholder="Ví dụ: 10, 15..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add Items Modal */}
      <Modal
        title={`Thêm sản phẩm vào: ${selectedEvent?.name || ''}`}
        open={isAddItemModalOpen}
        onCancel={() => setIsAddItemModalOpen(false)}
        okText="Xác nhận thêm"
        cancelText="Quay lại"
        onOk={() => itemForm.submit()}
        destroyOnClose
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleAddItemSubmit}
          className="mt-4"
        >
          <Form.Item name="category" label="Lọc theo Danh mục sản phẩm">
            <Select
              showSearch
              optionFilterProp="label"
              allowClear={!selectedEvent?.applicableCategory?._id}
              disabled={!!selectedEvent?.applicableCategory?._id}
              placeholder="Chọn danh mục sản phẩm để thu hẹp tìm kiếm..."
              onChange={() =>
                itemForm.setFieldsValue({
                  product: undefined,
                  productVariant: undefined,
                })
              }
              options={categoriesList.map((c: any) => ({
                label: c.name,
                value: c._id,
              }))}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.category !== curr.category}
          >
            {({ getFieldValue }) => {
              const selectedCatId = getFieldValue('category');
              const finalCatId =
                selectedCatId || selectedEvent?.applicableCategory?._id;
              const filtered = finalCatId
                ? productsList.filter(
                    (p: any) => p.category?._id === finalCatId
                  )
                : productsList;

              return (
                <Form.Item
                  name="product"
                  label="Chọn sản phẩm"
                  rules={[{ required: true, message: 'Chọn sản phẩm gốc!' }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm kiếm sản phẩm..."
                    optionFilterProp="label"
                    onChange={() =>
                      itemForm.setFieldsValue({ productVariant: undefined })
                    }
                    options={filtered.map((p: any) => ({
                      label: p.name,
                      value: p._id,
                    }))}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pricingMethod"
                label="Cách thiết lập giá"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Nhập giá bán trực tiếp (VND)', value: 'price' },
                    { label: 'Áp dụng chiết khấu (%)', value: 'percentage' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="flashSaleStock"
                label="Số lượng Flash Sale"
                rules={[{ required: true, message: 'Nhập số lượng bán!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev.pricingMethod !== curr.pricingMethod
            }
          >
            {({ getFieldValue }) => {
              const pricingMethod = getFieldValue('pricingMethod');

              if (pricingMethod === 'percentage') {
                return (
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="discountPercentage"
                        label="Tỷ lệ chiết khấu (%)"
                        rules={[
                          {
                            required: true,
                            message: 'Nhập phần trăm giảm giá (1 - 99)!',
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={1}
                          max={99}
                          prefix="%"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                );
              }

              return (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="flashSalePrice"
                      label="Giá Flash Sale trực tiếp (VND)"
                      rules={[{ required: true, message: 'Nhập giá bán sốc!' }]}
                    >
                      <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              );
            }}
          </Form.Item>

          <Form.Item
            name="limitPerUser"
            label="Giới hạn mua / 1 Khách hàng"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Items list modal */}
      <Modal
        title={`Danh sách sản phẩm trong sự kiện: ${selectedEvent?.name || ''}`}
        open={isViewItemsModalOpen}
        onCancel={() => setIsViewItemsModalOpen(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        <div className="mt-4">
          <List
            loading={isItemsPending}
            dataSource={eventItemsList}
            renderItem={(item) => {
              const originalPrice = item.productVariant?.price || 0;
              const flashPrice = item.flashSalePrice || 0;
              const discountPct =
                originalPrice > 0
                  ? Math.round(
                      ((originalPrice - flashPrice) / originalPrice) * 100
                    )
                  : 0;

              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <img
                        src={item.product?.mainImage || '/placeholder.png'}
                        alt="Product"
                        className="w-12 h-12 object-contain border border-slate-100 rounded"
                      />
                    }
                    title={
                      <Space align="center" size="small">
                        <span className="font-semibold text-slate-800">
                          {item.product?.name || 'Sản phẩm'}
                        </span>
                        {item.product?.category?.name && (
                          <Tag
                            color="blue"
                            className="text-[10px] uppercase font-bold tracking-wider px-1.5"
                          >
                            {item.product.category.name}
                          </Tag>
                        )}
                        {item.product?.serie?.name && (
                          <Tag
                            color="purple"
                            className="text-[10px] uppercase font-bold tracking-wider px-1.5"
                          >
                            {item.product.serie.name}
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0} className="text-xs">
                        <span>
                          Phiên bản: {item.productVariant?.storage} -{' '}
                          {item.productVariant?.color} -{' '}
                          {item.productVariant?.condition}
                        </span>
                        <span>
                          Mã định danh SKU:{' '}
                          <strong className="font-mono text-gray-500">
                            {item.productVariant?.sku}
                          </strong>
                        </span>
                        <span>
                          Giá chuẩn: {formatVND(item.productVariant?.price)}
                        </span>
                        <span>
                          Giá Flash Sale:{' '}
                          <strong className="text-orange-500 font-semibold">
                            {formatVND(item.flashSalePrice)}
                          </strong>
                          {discountPct > 0 && (
                            <Tag
                              color="red"
                              className="ml-2 font-bold px-1.5 py-0.2"
                            >
                              -{discountPct}%
                            </Tag>
                          )}
                        </span>
                      </Space>
                    }
                  />
                  <div className="text-right text-xs">
                    <div className="font-semibold text-slate-700">
                      Tồn kho Flash: {item.flashSaleStock}
                    </div>
                    <div className="text-green-600 font-medium">
                      Đã bán: {item.soldCount}
                    </div>
                    <div className="text-gray-400">
                      Giới hạn mua: {item.limitPerUser} sản phẩm
                    </div>
                  </div>
                </List.Item>
              );
            }}
            locale={{
              emptyText:
                'Chưa có sản phẩm nào được lên kệ trong khung giờ này.',
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminFlashSalePage;
