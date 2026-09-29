import { Modal, type FormProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Button, Form, Input, Spin, Upload } from 'antd';
import {
  FaAddressCard,
  FaCircleUser,
  FaIdCard,
  FaPhoneFlip,
} from 'react-icons/fa6';
import { useState } from 'react';
import { HiOutlineXCircle } from 'react-icons/hi';
import { useDispatch } from 'react-redux';

import type { FieldType, PropsModal } from '../../helpers/type';
import { getData, updateData } from '../../helpers/request';
import { useImagePreview } from '../../helpers/hook';
import { updateUser } from '../../store/authSlice.ts';
import { toast } from 'react-toastify';

const UserModalCompoment = ({ isModalOpen, setIsModalOpen }: PropsModal) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { data, isPending } = useQuery({
    queryKey: ['user'],
    queryFn: () => getData(`auth/profile`),
    enabled: isModalOpen,
  });

  const { imagePreview, handleImageChange } = useImagePreview({
    defaultPreview: {
      path: data && data?.user?.userImage ? data.user.userImage : '',
      file: null,
    },
  });
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      //   console.log('values', values);

      const dataUserUpdate = new FormData();
      dataUserUpdate.append('email', values.email);
      dataUserUpdate.append('username', values.username);
      dataUserUpdate.append('phone', values.phone);
      dataUserUpdate.append('address', values.address);

      if (Object(imagePreview)?.file) {
        dataUserUpdate.append('image', Object(imagePreview)?.file);
      }
      setLoading(true);
      const res = await updateData('auth/user', dataUserUpdate);
      if (res.success) {
        dispatch(updateUser(res));
        toast.success('Cập nhật thông tin thành công !');
        setIsModalOpen(false);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Cập nhật thông tin thất bại !');
      setLoading(false);
    }
  };
  return (
    <Modal
      title={'Thông tin người dùng !'}
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isModalOpen}
      onOk={() => setIsModalOpen(false)}
      onCancel={() => setIsModalOpen(false)}
      footer={[]}
    >
      {isPending ? (
        <div className="flex justify-center items-center h-30">
          <Spin description="Đang cập nhật..."></Spin>
        </div>
      ) : (
        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            email: data?.user?.email,
            username: data?.user?.name,
            phone: data?.user?.phone,
            address: data?.user?.address,
          }}
        >
          <div className="mb-5 flex! flex-col justify-center items-center">
            <span>Ảnh đại diện</span>
            <Upload
              onChange={(info) =>
                handleImageChange(info.file?.originFileObj ?? null)
              }
              name="avatar"
              listType="picture-card"
              className="avatar-uploader flex! justify-center items-center w-full"
              showUploadList={false}
              accept=".jpg,.png"
            >
              {Object(imagePreview)?.path == '' ? (
                <button type="button">
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              ) : (
                <div className="flex items-center justify-center my-5 relative">
                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    className="absolute top-0 left-0 p-1 cursor-pointer"
                  >
                    <HiOutlineXCircle className="text-2xl" />
                  </button>
                  <img
                    src={Object(imagePreview)?.path}
                    alt=""
                    className="h-25 w-30 rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </Upload>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: 'Vui lòng nhập tên người dùng !' },
              ]}
              label="Tên người dùng :"
            >
              <Input
                prefix={<FaIdCard size={19} />}
                placeholder="Mời bạn nhập tên người dùng"
                className="h-10"
                type="text"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập điện thoại !',
                },
                {
                  min: 10,
                  message: 'Số điện thoại phải 10 số !',
                },
                {
                  max: 10,
                  message: 'Số điện thoại phải 10 số !',
                },
              ]}
              label="Điện thoại :"
            >
              <Input
                prefix={<FaPhoneFlip size={19} />}
                placeholder="Mời bạn nhập số điện thoại"
                className="h-10"
                type="text"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email !' }]}
            className="mb-7!"
            label="Email :"
          >
            <Input
              readOnly
              prefix={<FaCircleUser size={19} />}
              placeholder="Username"
              className="h-10"
              type="email"
              disabled
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ !' }]}
            className="mb-7!"
            label="Địa chỉ :"
          >
            <Input
              prefix={<FaAddressCard size={19} />}
              placeholder="Mời bạn nhập địa chỉ"
              className="h-10"
              type="text"
            />
          </Form.Item>

          <Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              size="large"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Spin className="me-1" /> Vui lòng chờ ...
                </div>
              ) : (
                'Cập nhật thông tin'
              )}
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UserModalCompoment;
