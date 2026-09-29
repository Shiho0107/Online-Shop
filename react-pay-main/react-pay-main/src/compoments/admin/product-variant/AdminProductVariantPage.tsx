import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Col,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { FaSearchengin } from 'react-icons/fa6';

import { deleteData, getData } from '../../../helpers/request';
import AdminProductModal from './modal/AdminProductModal';
import type { productVariantType } from '../../../helpers/type';
import { useDebounce } from '../../../helpers/hook';
import { convertStringToPrice } from '../../../helpers/func';

const AdminProductVariantPage = () => {
  const [selectedData, setSelectedData] = useState<productVariantType | null>(
    null
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('p') || searchParams.get('page') || 1;
  const limit = searchParams.get('l') || searchParams.get('limit') || 10;
  const active = searchParams.get('active') || '';
  const series = searchParams.get('series') || '';

  const [search, setSearch] = useState('');
  const searchValue = useDebounce(search, 500);
  const { data, isPending, refetch } = useQuery({
    queryKey: ['product-variants', limit, page, searchValue, active, series],
    queryFn: () =>
      getData(
        `product-variants?search=${searchValue}&page=${page}&limit=${limit}&active=${active}&series=${series}&role=admin`
      ),
  });

  const { data: seriesData } = useQuery({
    queryKey: ['series'],
    queryFn: () => getData(`series`),
  });

  const { data: productData, isPending: isPendingProductData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getData(`products?limit=${100}&role='admin`),
  });

  const columns: TableProps<productVariantType>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'number_id',
      key: 'number_id',
      width: 50,
      render: (_text, _, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Code',
      dataIndex: 'sku',
      key: 'sku',
      width: 200,
      render: (_text, _item) => {
        return <>{_item?.sku || ''}</>;
      },
    },
    {
      title: 'Giá gốc',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 100,
      render: (_text, _item) => {
        return <>{convertStringToPrice(Number(_item?.originalPrice)) || ''}</>;
      },
    },
    {
      title: 'Giá ƯĐ',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (_text, _item) => {
        return <>{convertStringToPrice(Number(_item?.price)) || ''}</>;
      },
    },
    {
      title: 'Màu',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (_text, _item) => {
        return <>{_item?.color || ''}</>;
      },
    },
    {
      title: 'Bộ nhớ',
      dataIndex: 'storage',
      key: 'storage',
      width: 70,
      render: (_text, _item) => {
        return <>{_item?.storage || ''}</>;
      },
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (_text, _item) => {
        return (
          <>
            <img src={_item?.imageColor || ''} alt="" className="w-20 h-20" />
          </>
        );
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (_text, _item) => {
        return (
          <>
            {_item?.condition == 'New' ? (
              <Tag color="blue">{_item?.condition || ''}</Tag>
            ) : (
              <Tag color="red">{_item?.condition || ''}</Tag>
            )}
          </>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (_text, _item) => {
        return <>{_item?.stock || 0}</>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (_text, _item) => {
        return <>{_item?.createdAt || 0}</>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      render: (text: boolean) => (
        <Tag color={text ? 'green' : 'red'}>
          {text ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, _record) => (
        <Space size="medium">
          <EditOutlined
            className="text-blue-500! text-md cursor-pointer"
            onClick={() => handleEdit(_record)}
          />
          <DeleteOutlined
            className="text-red-500! text-md cursor-pointer"
            onClick={() => handleDelete(_record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (_record: productVariantType) => {
    setSelectedData(_record);
  };

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'l') {
      params.set(key, value);
      params.set('p', '1');
    } else if (key === 'active') {
      params.set(key, value);
      params.set('p', '1');
    } else if (key === 'series') {
      params.set(key, value);
      params.set('p', '1');
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const handleDelete = async (_record: productVariantType) => {
    try {
      const res = await deleteData(`product-variants/${_record._id}`);
      if (res?.success) {
        toast.success('Xoá sản phẩm thành công !');
        refetch();
      } else {
        toast.error('Xoá sản phẩm thất bại !');
      }
    } catch (error) {
      console.log('handleDelete error : ', error);
      toast.error('Xoá danh mục thất bại !');
    }
  };

  return (
    <>
      <AdminProductModal
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        refetch={refetch}
        productData={productData?.data || []}
      />

      <Card className="shadow-sm border-slate-100">
        <Row gutter={[16, 16]} align="middle" justify={'end'}>
          <Col xs={12} md={7}>
            <Input
              className="h-10 w-100!"
              prefix={<FaSearchengin size={25} />}
              placeholder="Bạn cần tìm kiếm gi ? ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={10} sm={8} md={5}>
            <Select
              className="w-full h-10"
              placeholder="Dòng sản phẩm"
              defaultValue={series || ''}
              onChange={(value) => handleChange('series', value)}
            >
              <Select.Option value="">Tất cả dòng sản phẩm</Select.Option>
              {seriesData?.data?.map((item: any) => (
                <Select.Option value={item._id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={8} sm={6} md={3}>
            <Select
              className="w-full h-10"
              placeholder="Trạng thái"
              defaultValue={active || ''}
              onChange={(value) => handleChange('active', value)}
            >
              <Select.Option value="">Tất cả trạng thái</Select.Option>
              <Select.Option value="true">Đang hoạt động</Select.Option>
              <Select.Option value="false">Ngưng hoạt động</Select.Option>
            </Select>
          </Col>

          <Col xs={8} sm={6} md={3}>
            <button
              type="button"
              className="bg-green-500 text-white  px-7 py-3 rounded-lg cursor-pointer hover:bg-green-600"
              onClick={() =>
                setSelectedData({
                  _id: '',
                  sku: '',
                  originalPrice: '0',
                  price: '0',
                  color: '',
                  storage: '256GB',
                  stock: '0',
                  condition: 'New',
                  imageColor: '',
                  product: null,
                  isActive: true,
                  region: 'VN/A',
                })
              }
            >
              <FileAddOutlined className="text-md me-1" />
              <span className="font-medium text-md">Thêm mới</span>
            </button>
          </Col>
        </Row>
      </Card>

      <Table<productVariantType>
        rowKey="_id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isPending && isPendingProductData}
        sticky
        pagination={false}
        scroll={{ y: 600 }}
      />
      <div className="pb-15 pt-10 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="ms-4 text-sm">Hiển thị theo</span>
          <Select
            defaultValue={String(limit) || '10'}
            style={{ width: 60 }}
            onChange={(value) => handleChange('l', value)}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
            ]}
          />
          <span className="text-sm">trên một trang</span>
        </div>
        <Pagination
          current={Number(page) || 1}
          total={Number(data?.pagination?.totalVariants) || 1}
          pageSize={Number(limit) || 8}
          onChange={(value) => handleChange('p', String(value))}
          align="end"
        />
      </div>
    </>
  );
};
export default AdminProductVariantPage;
