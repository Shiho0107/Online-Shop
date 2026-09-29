import { useQuery } from '@tanstack/react-query';
import { Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { deleteData, getData } from '../../../helpers/request';
import AdminSerieModal from './modal/AdminSerieModal';
import type { DataType } from '../../../helpers/type';
import { setSeries } from '../../../store/serieSlice';

const AdminSeriePage = () => {
  const [selectedData, setSelectedData] = useState<DataType | null>(null);
  const dispatch = useDispatch();
  const { data, isPending, refetch } = useQuery({
    queryKey: ['series'],
    queryFn: () => getData(`series/`),
  });

  useEffect(() => {
    if (data?.data) {
      dispatch(setSeries(data.data));
    }
  }, [data]);

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'number_id',
      key: 'number_id',
      render: (_text, _, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Tình trạng',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (text: boolean) => (
        <Tag color={text ? 'green' : 'red'}>
          {text ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
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

  const handleEdit = (_record: DataType) => {
    setSelectedData(_record);
  };

  const handleDelete = async (_record: DataType) => {
    try {
      const res = await deleteData(`series/${_record._id}`);
      if (res?.success) {
        toast.success('Xoá serie thành công !');
        refetch();
      } else {
        toast.error('Xoá serie thất bại !');
      }
    } catch (error) {
      console.log('handleDelete error : ', error);
      toast.error('Xoá serie thất bại !');
    }
  };

  return (
    <>
      <AdminSerieModal
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        refetch={refetch}
      />
      <div className="flex justify-end items-center mb-4">
        <button
          type="button"
          className="bg-green-500 text-white  px-7 py-3 rounded-lg cursor-pointer hover:bg-green-600"
          onClick={() =>
            setSelectedData({
              _id: null,
              name: '',
              description: '',
              isActive: true,
            })
          }
        >
          <FileAddOutlined className="text-md me-1" />
          <span className="font-medium text-md">Thêm mới</span>
        </button>
      </div>
      <Table<DataType>
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
export default AdminSeriePage;
