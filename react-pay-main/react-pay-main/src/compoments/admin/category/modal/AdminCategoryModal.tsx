import { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tag,
  type FormProps,
} from 'antd';
import { toast } from 'react-toastify';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import type { DataType } from '../../../../helpers/type';
import { updateDataAdmin } from '../../../../helpers/request';

interface ModalProps {
  selectedData: DataType | null;
  setSelectedData: (data: DataType | null) => void;
  refetch: () => void;
}

interface FieldType {
  _id: string | null;
  name: string;
  description: string;
  isActive: boolean;
}

const AdminCategoryModal = ({
  selectedData,
  setSelectedData,
  refetch,
}: ModalProps) => {
  const [form] = Form.useForm();
  const isActive = Form.useWatch('isActive', form);

  // Đồng bộ giá trị của selectedData vào form khi selectedData thay đổi
  useEffect(() => {
    if (selectedData) {
      form.setFieldsValue({
        _id: selectedData._id || null,
        name: selectedData.name || '',
        description: selectedData.description || '',
        isActive: selectedData.isActive ?? true,
      });
    }
  }, [selectedData, form]);

  const onOk = () => {
    form.resetFields();
    setSelectedData(null);
  };

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const url = values._id ? `categories/${values._id}` : 'categories/';
      const type = values._id ? 'put' : 'post';
      const res = await updateDataAdmin(url, values, type);
      if (res) {
        toast.success('Thành công !');
        onOk();
        refetch();
      }
    } catch (error) {
      toast.error('Lỗi xảy ra !');
      console.log('onFinish error :', error);
    }
  };

  return (
    <>
      <Modal
        title={selectedData?._id ? 'Sửa danh mục' : 'Thêm danh mục'}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={selectedData !== null}
        onOk={() => onOk()}
        onCancel={() => onOk()}
        footer={[
          <Button key="back" danger onClick={onOk} size="large">
            <CloseCircleOutlined />
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            size="large"
          >
            <SaveOutlined />
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          name="categoryForm"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            // label="Tên Danh Mục"
            hidden
            name="_id"
            initialValue={selectedData?._id || null}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Tên Danh Mục"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục !' },
              { min: 4, message: 'Tên danh mục tối thiểu 3 ký tự !' },
              { max: 20, message: 'Tên danh mục tối đa 20 ký tự !' },
            ]}
          >
            <Input className="h-10" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Mô Tả"
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả !' },
              { min: 4, message: 'Mô tả tối thiểu 3 ký tự !' },
              //   { max: 20, message: 'Mô tả tối đa 20 ký tự !' },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Tình trạng">
            <Space>
              <Form.Item name="isActive" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
              <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </Tag>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminCategoryModal;
