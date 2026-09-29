import { useQuery } from '@tanstack/react-query';
import { Input, Pagination, Select, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

import { deleteData, getData } from '../../../helpers/request';
import AdminProductModal from './modal/AdminProductModal';
import type { productType } from '../../../helpers/type';
import { useDebounce } from '../../../helpers/hook';
import { FaSearchengin } from 'react-icons/fa6';

const AdminProductPage = () => {
  const [selectedData, setSelectedData] = useState<productType | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('p') || searchParams.get('page') || 1;
  const limit = searchParams.get('l') || searchParams.get('limit') || 10;
  const [search, setSearch] = useState('');
  const searchValue = useDebounce(search, 500);
  const { data, isPending, refetch } = useQuery({
    queryKey: ['products', limit, page, searchValue],
    queryFn: () =>
      getData(
        `products?search=${searchValue}&page=${page}&limit=${limit}&role='admin`
      ),
  });

  const { data: serieData, isPending: isPendingSerie } = useQuery({
    queryKey: ['series'],
    queryFn: () => getData(`series/`),
  });

  const { data: categoryData, isPending: isPendingCategory } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getData(`categories/`),
  });

  const columns: TableProps<productType>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'number_id',
      key: 'number_id',
      width: 100,
      render: (_text, _, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Thông tin',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (_text, _item) => (
        <>
          <p className="text-sm">
            <strong>Màn hình</strong> : {_item.specifications?.screen}
          </p>
          <p className="text-sm">
            <strong>Camera trước</strong> : {_item.specifications?.frontCamera}
          </p>
          <p className="text-sm">
            <strong>Camera sau</strong> : {_item.specifications?.rearCamera}
          </p>
          <p className="text-sm">
            <strong>Chip</strong> : {_item.specifications?.chip}
          </p>
          <p className="text-sm">
            <strong>Pin</strong> : {_item.specifications?.battery}
          </p>
        </>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (_text, _item) => {
        return (
          <>
            <img src={_item?.mainImage || ''} alt="" className="w-20 h-20" />
          </>
        );
      },
    },
    {
      title: 'Tình trạng',
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

  const handleEdit = (_record: productType) => {
    setSelectedData(_record);
  };

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

  const handleDelete = async (_record: productType) => {
    try {
      const res = await deleteData(`products/${_record._id}`);
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
        categoryData={categoryData?.data || []}
        serieData={serieData?.data || []}
      />
      <div className="flex justify-end items-center mb-4 gap-5">
        <Input
          className="h-10 w-100!"
          prefix={<FaSearchengin size={25} />}
          placeholder="Bạn cần tìm kiếm gi ? ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="bg-green-500 text-white  px-7 py-3 rounded-lg cursor-pointer hover:bg-green-600"
          onClick={() =>
            setSelectedData({
              _id: '',
              name: '',
              description: '',
              mainImage: '',
              isActive: true,
              specifications: {
                screen: '',
                chip: '',
                gpu: '',
                frontCamera: '',
                rearCamera: '',
                battery: '',
                ram: '',
              },
            })
          }
        >
          <FileAddOutlined className="text-md me-1" />
          <span className="font-medium text-md">Thêm mới</span>
        </button>
      </div>
      <Table<productType>
        rowKey="_id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isPending && isPendingCategory && isPendingSerie}
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
          total={Number(data?.pagination?.totalProducts) || 1}
          pageSize={Number(limit) || 8}
          onChange={(value) => handleChange('p', String(value))}
          align="end"
        />
      </div>
    </>
  );
};
export default AdminProductPage;
