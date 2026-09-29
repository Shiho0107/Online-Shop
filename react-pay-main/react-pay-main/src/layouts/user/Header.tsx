import { Avatar, Form, Input, Badge } from 'antd';
import {
  FaSearchengin,
  FaCartShopping,
  FaUser,
  FaAlignJustify,
  FaCircleUser,
  FaAddressCard,
  FaArrowRightFromBracket,
  FaWallet,
  FaBolt,
} from 'react-icons/fa6';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
// import { toast } from 'react-toastify';

import type {
  categoryType,
  productVariantType,
  typeInitState,
} from '../../helpers/type';
import { logout, updateUser } from '../../store/authSlice.ts';
import UserModalCompoment from '../../compoments/auth/UserModalCompoment';
import { useDebounce } from '../../helpers/hook.ts';
import { getData } from '../../helpers/request.ts';
import { convertStringToPrice } from '../../helpers/func.ts';
import { HeaderCategory } from '../../helpers/dataTest.ts';

const ServicesItems: MenuProps['items'] = [
  { label: 'Sửa chữa', key: 'repair' },
  { label: 'Bảo hành', key: 'warranty' },
  { label: 'Mua bán', key: 'buy-sell' },
  { label: 'Thu cũ', key: 'trade-in' },
  { label: 'Tư vấn', key: 'consulting' },
  { label: 'Hỗ trợ kỹ thuật', key: 'technical-support' },
];

const HeaderComponent = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalUser, setIsModalUser] = useState(false);
  const auth = useSelector((state: typeInitState) => state.auth.user);

  useEffect(() => {
    if (auth) {
      const fetchProfile = async () => {
        try {
          const res = await getData('auth/profile');
          if (res?.user) {
            dispatch(updateUser({ data: res.user }));
          }
        } catch (error) {
          console.error(
            'Lỗi khi tải thông tin người dùng trong Header:',
            error
          );
        }
      };
      fetchProfile();
    }
  }, [dispatch, auth ? true : false]);
  const authUser = auth as any;
  const vipColor = authUser?.currentTier?.color || '';
  const vipName = authUser?.currentTier?.name || '';
  let vipCrownType = '';
  if (vipColor) {
    if (vipName.includes('Đồng') || vipName.includes('Bronze'))
      vipCrownType = 'bronze';
    else if (vipName.includes('Bạc') || vipName.includes('Silver'))
      vipCrownType = 'silver';
    else if (vipName.includes('Vàng') || vipName.includes('Gold'))
      vipCrownType = 'gold';
    else if (vipName.includes('Bạch Kim') || vipName.includes('Platinum'))
      vipCrownType = 'platinum';
    else if (vipName.includes('Kim Cương') || vipName.includes('Diamond'))
      vipCrownType = 'diamond';
    else vipCrownType = 'gold';
  }
  const cartItems = useSelector((state: typeInitState) => state.cart.items);
  const cartCount = useMemo(() => {
    return cartItems
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;
  }, [cartItems]);
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchValue = useDebounce(search, 500);

  const { data: dataCategory, isPending: isPendingCategory } = useQuery({
    queryKey: ['category'],
    queryFn: () => getData(`categories?isActive=true`),
    enabled: true,
  });

  const HeaderNavBar = useMemo(() => {
    return isPendingCategory
      ? HeaderCategory.map((item) => ({
          label: item.name,
          key: item.slug,
          path: `/${item.slug}`,
        }))
      : dataCategory?.data?.map((item: categoryType) => ({
          label: item.name,
          key: item.slug,
          path: `/${item.slug}`,
        }));
  }, [dataCategory, isPendingCategory]);

  const { data, isPending } = useQuery({
    queryKey: ['product', searchValue],
    queryFn: () =>
      getData(`product-variants?search=${searchValue}&page=${1}&limit=${5}`),
    enabled: searchValue !== '',
  });

  const onSubmit = () => {
    let s = search.trim();
    if (!s) return;
    navigate(`/search?s=${s}&p=1&l=8&sort=new`);
    form.resetFields();
    setSearch('');
  };

  const handleLogout = () => {
    try {
      dispatch(logout());
    } catch (error) {}
  };

  const itemsAuth: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <FaAddressCard />,
      onClick: () => setIsModalUser(true),
    },
    {
      key: 'my-pay',
      label: 'Hoá đơn của tôi',
      icon: <FaWallet />,
      onClick: () => navigate('/mypay'),
    },
    ...(auth?.role === 'admin'
      ? [
          {
            type: 'divider' as const,
          },
          {
            key: 'manage',
            label: 'Quản lý',
            icon: <FaAddressCard />,
            onClick: () => navigate('/admin/statistical'),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <FaArrowRightFromBracket />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const setVar = () => {
      if (headerRef.current) {
        const h = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
      }
    };
    setVar();
    window.addEventListener('resize', setVar);
    return () => window.removeEventListener('resize', setVar);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="bg-[#515154] text-white pt-1 pb-3 fixed z-50 w-full"
      >
        <div className="container mx-auto w-full max-w-345 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-start gap-1">
              <Link to={'/'}>
                <img
                  src="/gemini-svg.svg"
                  alt="Logo"
                  className="w-60 object-cover cursor-pointer"
                  // loading="lazy"
                />
              </Link>

              <Form
                form={form}
                name="horizontal_search"
                layout="inline"
                onFinish={onSubmit}
                className="relative"
              >
                <Form.Item name="search">
                  <Input
                    className="h-10 w-140! w-lg-140!"
                    prefix={<FaSearchengin size={25} />}
                    placeholder="Bạn cần tìm kiếm gi ? ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  />
                </Form.Item>
                {isFocused && searchValue && (
                  <div className="absolute top-full w-140! w-lg-140! mt-3 bg-gray-300 text-white rounded-2xl shadow-lg z-20 max-h-50 md:max-h-90 lg:max-h-160">
                    <p className="py-2! text-gray-800 font-bold px-4 text-sm md:text-[13px] lg:text-[14px] bg-gray-400 w-full">
                      Có phải bạn muốn tìm
                    </p>
                    {!isPending ? (
                      <>
                        {data?.data?.length > 0 ? (
                          <>
                            {data.data.map((item: productVariantType) => (
                              <Link
                                key={item._id}
                                to={`/iphone/detail/${item.product?.slug}`}
                                className="block py-2 px-4 hover:bg-gray-400! transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.product?.mainImage || ''}
                                    alt={item.product?.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                  <div className="flex-1">
                                    <p className="text-gray-700 font-medium">
                                      {item.product?.name} - {item?.storage} -{' '}
                                      {item?.color}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <p className="text-gray-700 font-medium">
                                        {convertStringToPrice(
                                          Number(item.price)
                                        )}
                                      </p>
                                      <p className="text-gray-500 text-sm line-through">
                                        {convertStringToPrice(
                                          Number(item.originalPrice)
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        ) : (
                          <p className="w-full text-center py-4 text-gray-600 font-medium">
                            Không có kết quả
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center bg-[#f5f5f7] py-5">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                )}
              </Form>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="flex items-center cursor-pointer text-white hover:text-blue-300 transition-colors"
              >
                <Badge count={cartCount} offset={[8, -5]} size="small">
                  <FaCartShopping size={20} className="text-white" />
                </Badge>
                <span className="ml-2 font-medium">Giỏ hàng</span>
              </Link>
              {auth ? (
                <Dropdown menu={{ items: itemsAuth, selectable: true }}>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={vipColor ? 'vip-avatar-container' : ''}
                      style={vipColor ? { background: vipColor } : {}}
                    >
                      {vipColor && (
                        <div className={`vip-badge-crown ${vipCrownType}`}>
                          👑
                        </div>
                      )}
                      {auth.image ? (
                        <Avatar
                          size="large"
                          src={auth.image}
                          style={{
                            border: vipColor ? '2px solid white' : 'none',
                          }}
                        />
                      ) : (
                        <Avatar
                          size="large"
                          icon={<FaCircleUser />}
                          style={{
                            border: vipColor ? '2px solid white' : 'none',
                          }}
                        />
                      )}
                    </div>
                    <span className="font-medium text-white">{auth.name}</span>
                  </div>
                </Dropdown>
              ) : (
                <Link
                  to={'/auth/login'}
                  className="flex items-center cursor-pointer"
                >
                  <FaUser size={20} /> <span className="ml-1">Tài khoản</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <Dropdown menu={{ items: ServicesItems, selectable: true }}>
              <span
                className={clsx(
                  'px-3 py-2 rounded-md text-gray-100 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0',
                  location.pathname === '/' && 'bg-[#99a1af]',
                  location.pathname !== '/' && ''
                )}
              >
                <FaAlignJustify />
                Dịch vụ
              </span>
            </Dropdown>
            <Link
              className={clsx(
                'px-3 py-2 hover:bg-orange-600 hover:rounded-md transition-all duration-100 flex items-center justify-center font-bold text-yellow-300 whitespace-nowrap shrink-0',
                location.pathname === '/flash-sale' &&
                  'bg-orange-600 rounded-md text-white'
              )}
              to="/flash-sale"
            >
              <span className="cursor-pointer font-bold text-yellow-300 hover:text-white text-[15px] flex justify-center items-center gap-1">
                <FaBolt className="text-yellow-300 animate-bounce" /> Flash Sale
              </span>
            </Link>
            {HeaderNavBar.map(
              (item: { key: string; path: string; label: string }) => (
                <Link
                  className={clsx(
                    'px-3 py-2 hover:bg-gray-500 hover:rounded-md transition-all duration-100 whitespace-nowrap shrink-0',
                    location.pathname.includes(`/${item.key}`) &&
                      'bg-[#99a1af] rounded-md',
                    location.pathname !== `/${item.key}` && ''
                  )}
                  key={item.key}
                  to={item.path}
                >
                  <span className="cursor-pointer font-normal text-gray-300 text-[15px] flex justify-center items-center ">
                    {item.label}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <UserModalCompoment
        isModalOpen={isModalUser}
        setIsModalOpen={setIsModalUser}
      />
    </>
  );
};

export default HeaderComponent;
