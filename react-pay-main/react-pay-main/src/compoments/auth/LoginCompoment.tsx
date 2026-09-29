import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, Flex, Spin, Alert } from 'antd';
import { FaCircleUser, FaLock } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { useAuthMutation } from '../../helpers/hook.js';
import type { typeInitState } from '../../helpers/type.js';

type FieldType = {
  email: string;
  password: string;
  remember?: string;
};

const LoginCompoment = () => {
  const { mutate, isPending } = useAuthMutation();

  const messageAuth = useSelector((state: typeInitState) => state.auth.message);
  const errorAuth = useSelector((state: typeInitState) => state.auth.error);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    try {
      const loginData = {
        value: { email: values.email, password: values.password },
        url: 'login',
      };
      mutate(loginData);
    } catch (error) {
      console.log('Đăng nhập thất bại !');
    }
  };

  return (
    <>
      {errorAuth && (
        <div className="my-5">
          <Alert
            title={messageAuth}
            type="error"
            className="flex! justify-center! items-center! text-center!"
          />
        </div>
      )}
      <h2 className="text-2xl pb-5">Đăng nhập</h2>
      <Form
        name="login"
        layout="vertical"
        initialValues={{ remember: true }}
        // style={{ maxWidth: 360 }}
        onFinish={onFinish}
      >
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
          className="mb-10!"
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
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Ghi Nhớ</Checkbox>
            </Form.Item>
            <Link
              to={'/auth/register'}
              className="cursor-pointer hover:underline"
            >
              Đăng ký tài khoản !
            </Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            size="large"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spin /> Vui lòng chờ ...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
export default LoginCompoment;
