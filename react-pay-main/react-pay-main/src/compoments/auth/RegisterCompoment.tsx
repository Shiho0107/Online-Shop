import type { FormProps } from 'antd';
import { Button, Form, Input, Flex, Spin, Alert, Upload } from 'antd';
import {
  FaAddressCard,
  FaCircleUser,
  FaIdCard,
  FaLock,
  FaPhoneFlip,
} from 'react-icons/fa6';
import { HiOutlineXCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useState } from 'react';

import { useImagePreview } from '../../helpers/hook.js';
import type { FieldType } from '../../helpers/type.js';
import { Link, useNavigate } from 'react-router-dom';

const RegisterCompoment = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [loding, setLoading] = useState(false);
  const { imagePreview, handleImageChange } = useImagePreview({
    defaultPreview: {
      path: '',
      file: null,
    },
  });
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      const dataRegister = new FormData();
      dataRegister.append('email', values.email);
      dataRegister.append('password', values.password);
      dataRegister.append('username', values.username);
      dataRegister.append('phone', values.phone);
      dataRegister.append('address', values.address);
      dataRegister.append('passwordConfirm', values.passwordConfirm);
      if (Object(imagePreview)?.file) {
        dataRegister.append('image', Object(imagePreview)?.file);
      }
      const URL =
        import.meta.env.VITE_REACT_APP_IS_DEV == 'true'
          ? import.meta.env.VITE_REACT_APP_BE_API_URL_DEV
          : import.meta.env.VITE_REACT_APP_BE_API_URL_PRODUCT;

      // mutate(registerData);
      const res = await axios.post(`${URL}auth/register`, dataRegister, config);
      if (res.status === 201) {
        toast.success('Đăng ký tài khoản thành công !');
        navigate('/auth/login');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // console.log('error', error);
        if (error.response?.status === 400) {
          setStatus(error.response.data?.message || 'Unauthorized');
        } else {
          setStatus(error.response?.data?.detail || 'Lỗi khác xảy ra');
        }
      } else {
        console.log(error);
        setStatus('Lỗi không xác định');
      }
      setLoading(false);
      toast.error('Đăng ký thất bại!');
    }
  };
  return (
    <>
      {status && (
        <div className="my-5">
          <Alert
            title={status}
            type="error"
            className="flex! justify-center! items-center! text-center!"
          />
        </div>
      )}
      <h2 className="text-2xl pb-5">Đăng ký</h2>
      <Form form={form} name="register" layout="vertical" onFinish={onFinish}>
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

        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập email !' }]}
          className="mb-7!"
          label="Email :"
        >
          <Input
            prefix={<FaCircleUser size={19} />}
            placeholder="Username"
            className="h-10"
            type="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự !' },
            { max: 30, message: 'Mật khẩu tối đa 30 ký tự !' },
          ]}
          className="mb-7!"
          hasFeedback
          label="Mật khẩu :"
        >
          <Input
            prefix={<FaLock size={17} />}
            type="password"
            placeholder="Password"
            className="h-10"
          />
        </Form.Item>

        <Form.Item
          name="passwordConfirm"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự !' },
            { max: 30, message: 'Mật khẩu tối đa 30 ký tự !' },
            {
              validator: (_: any, value: any) => {
                if (!value || form.getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            },
          ]}
          className="mb-10!"
          hasFeedback
          label="Nhập lại mật khẩu :"
        >
          <Input
            prefix={<FaLock size={17} />}
            type="password"
            placeholder="Mời bạn nhập lại mật khẩu"
            className="h-10"
          />
        </Form.Item>

        <Form.Item>
          <Flex justify="end" align="center">
            <Link
              to={'/auth/login'}
              className="cursor-pointer hover:underline hover:text-blue-500"
            >
              Tôi đã có tài khoản !
            </Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            size="large"
            disabled={loding}
          >
            {loding ? (
              <>
                <Spin /> Vui lòng chờ ...
              </>
            ) : (
              'Đăng ký'
            )}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
export default RegisterCompoment;
