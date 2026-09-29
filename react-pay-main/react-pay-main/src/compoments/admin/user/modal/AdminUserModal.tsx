import { useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tag,
  Select,
  type FormProps,
} from 'antd';
import { toast } from 'react-toastify';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import type { userType } from '../../../../helpers/type';
import { updateDataAdmin } from '../../../../helpers/request';

interface ModalProps {
  selectedData: userType | null;
  setSelectedData: (data: userType | null) => void;
  refetch: () => void;
}

interface FieldType {
  _id: string | null;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

const AdminUserModal = ({
  selectedData,
  setSelectedData,
  refetch,
}: ModalProps) => {
  const [form] = Form.useForm();
  const isActive = Form.useWatch('isActive', form);
  const role = Form.useWatch('role', form);

  // Synchronize selectedData values into form when selectedData changes
  useEffect(() => {
    if (selectedData) {
      form.setFieldsValue({
        _id: selectedData._id || null,
        email: selectedData.email || '',
        name: selectedData.name || '',
        phone: selectedData.phone || '',
        address: selectedData.address || '',
        role: selectedData.role || 'user',
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
      if (!values._id) return;
      const url = `users/${values._id}`;
      const res = await updateDataAdmin(url, values, 'put');
      if (res?.success) {
        toast.success('Cập nhật người dùng thành công!');
        onOk();
        refetch();
      } else {
        toast.error(res?.message || 'Cập nhật người dùng thất bại!');
      }
    } catch (error) {
      toast.error('Lỗi xảy ra khi cập nhật!');
      console.log('onFinish error:', error);
    }
  };

  return (
    <>
      <Modal
        title="Cập nhật người dùng"
        closable={{ 'aria-label': 'Close Button' }}
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
          name="userForm"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            hidden
            name="_id"
            initialValue={selectedData?._id || null}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Email (Không thể thay đổi)"
            name="email"
          >
            <Input className="h-10 bg-gray-100 cursor-not-allowed" disabled />
          </Form.Item>

          <Form.Item<FieldType>
            label="Tên Người Dùng"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên người dùng!' },
              { min: 2, message: 'Tên tối thiểu 2 ký tự!' },
            ]}
          >
            <Input className="h-10" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9+]+$/, message: 'Số điện thoại không hợp lệ!' },
            ]}
          >
            <Input className="h-10" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item<FieldType>
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select className="h-10">
              <Select.Option value="user">User (Khách hàng)</Select.Option>
              <Select.Option value="admin">Admin (Quản trị viên)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái tài khoản">
            <Space>
              <Form.Item name="isActive" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
              <Tag color={isActive ? 'green' : 'red'}>
                {isActive ? 'Đang hoạt động' : 'Đang bị khoá'}
              </Tag>
              <Tag color={role === 'admin' ? 'gold' : 'blue'}>
                {role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
              </Tag>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminUserModal;
