import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ProductOutlined,
  BarsOutlined,
  TableOutlined,
  FolderOpenOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  GiftOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { useQuery } from '@tanstack/react-query';

import { checkAdminRole } from '../../helpers/request';

const { Header, Sider, Content } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const menuItems = [
  {
    key: '/admin/statistical',
    icon: <BarChartOutlined />,
    label: <Link to="/admin/statistical">Thống Kê</Link>,
    title: 'Thống Kê',
  },
  {
    key: '/admin/import-export',
    icon: <BarChartOutlined />,
    label: <Link to="/admin/import-export">Quản lý xuất / nhập</Link>,
    title: 'Quản lý xuất / nhập',
  },
  {
    key: '/admin/users',
    icon: <UserOutlined />,
    label: <Link to="/admin/users">Quản lý người dùng</Link>,
    title: 'Quản lý người dùng',
  },
  {
    key: '/admin/vip-tiers',
    icon: <CrownOutlined />,
    label: <Link to="/admin/vip-tiers">Cấu hình VIP</Link>,
    title: 'Cấu hình VIP',
  },
  {
    key: '/admin/categories',
    icon: <FolderOpenOutlined />,
    label: <Link to="/admin/categories">Quản lý danh mục</Link>,
    title: 'Quản lý danh mục',
  },
  {
    key: '/admin/series',
    icon: <BarsOutlined />,
    label: <Link to="/admin/series">Quản lý series</Link>,
    title: 'Quản lý series',
  },
  {
    key: '/admin/products',
    icon: <ProductOutlined />,
    label: <Link to="/admin/products">Quản lý sản phẩm</Link>,
    title: 'Quản lý sản phẩm',
  },
  {
    key: '/admin/product-variants',
    icon: <TableOutlined />,
    label: <Link to="/admin/product-variants">Quản lý Phiên bản</Link>,
    title: 'Quản lý Phiên bản',
  },
  {
    key: '/admin/vouchers',
    icon: <GiftOutlined />,
    label: <Link to="/admin/vouchers">Quản lý Voucher</Link>,
    title: 'Quản lý Voucher',
  },
  {
    key: '/admin/flash-sales',
    icon: <ThunderboltOutlined />,
    label: <Link to="/admin/flash-sales">Quản lý Flash Sale</Link>,
    title: 'Quản lý Flash Sale',
  },
  {
    key: '/admin/orders',
    icon: <ShoppingCartOutlined />,
    label: <Link to="/admin/orders">Quản lý đơn hàng</Link>,
    title: 'Quản lý đơn hàng',
  },
];

const AdminMasterLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigation = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { isPending, data } = useQuery({
    queryKey: ['role'],
    queryFn: () => checkAdminRole(),
  });

  useEffect(() => {
    if (!data && !isPending) {
      navigation('/home');
    }
  }, [data, isPending]);

  // Tìm item tương ứng với URL hiện tại để hiển thị ở Header
  const activeItem = menuItems.find((item) => location.pathname === item.key);
  const currentTitle = activeItem ? activeItem.title : 'Trang quản trị';

  return (
    <>
      <div className="">
        <>
          <Layout style={{ minHeight: '100vh' }}>
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              style={siderStyle}
              className="max-w-full!"
            >
              <div
                style={{
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                }}
              >
                <Link to="/" className="w-full h-full">
                  <img
                    src="/gemini-svg.svg"
                    alt="Logo"
                    style={{
                      height: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Link>
              </div>
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
              />
            </Sider>
            <Layout>
              <Header
                style={{
                  padding: '0 24px 0 0',
                  background: colorBgContainer,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                  }}
                />
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1f1f1f',
                  }}
                >
                  {currentTitle}
                </span>
              </Header>

              <Content
                style={{
                  margin: '24px 16px',
                  padding: 24,
                  minHeight: 280,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <main className="flex-1 p-3">
                  <Outlet />
                </main>
              </Content>
            </Layout>
          </Layout>
        </>
      </div>
    </>
  );
};

export default AdminMasterLayout;
