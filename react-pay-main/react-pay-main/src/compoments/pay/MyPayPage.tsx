import { useQuery } from '@tanstack/react-query';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Tag, Progress, Card, type TableProps } from 'antd';
import { FaBars } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CrownOutlined, TrophyOutlined } from '@ant-design/icons';

import { getData } from '../../helpers/request';
import type { typeInitState } from '../../helpers/type';
import { convertStringToPrice, formattedDate } from '../../helpers/func';
import { updateUser } from '../../store/authSlice';

const columns: TableProps<any>['columns'] = [
  {
    title: 'STT',
    dataIndex: 'number_id',
    key: 'number_id',
    render: (_text, _, index) => <span>{index + 1}</span>,
  },
  {
    title: 'Mã hoá đơn',
    dataIndex: 'codeOrder',
    render: (_, _record) => <span>#{_record.orderCode}</span>,
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    render: (_, _record) => (
      <span>{convertStringToPrice(Number(_record.totalAmount))}</span>
    ),
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (_, record: any) => {
      return record.status == 'PAID' ? (
        <Tag color="green">Thanh toán</Tag>
      ) : record.status == 'PENDING' ? (
        <Tag color="blue">Đang xử lý</Tag>
      ) : (
        <Tag color="red">Thất bại</Tag>
      );
    },
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (_, _record) => <span>{formattedDate(_record.createdAt)}</span>,
  },
  {
    title: '',
    key: 'action',
    render: (_, _record) => (
      <div className="flex justify-center items-center">
        <Link to={`/mypay/${_record.orderCode}`}>
          <FaBars className="cursor-pointer" />
        </Link>
      </div>
    ),
  },
];

const MyPayPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: typeInitState) => state.auth.user) as any;

  useEffect(() => {
    if (!auth) {
      navigate('/');
    }
  }, [auth]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getData('auth/profile');
        if (res?.user) {
          dispatch(updateUser({ data: res.user }));
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
      }
    };
    fetchProfile();
  }, [dispatch]);

  const { data, isPending } = useQuery({
    queryKey: ['mypay'],
    queryFn: () => getData(`pays/get-history`),
  });

  const totalSpent = auth?.totalSpent || 0;
  const currentTierName = auth?.currentTier?.name || 'Thành viên thường';
  const discount = auth?.currentTier?.discount || 0;
  const nextTierName = auth?.nextTier?.name || '';
  const needed = auth?.nextTier?.needed || 0;

  let percent = 0;
  if (auth?.nextTier) {
    const currentMin = auth.currentTier?.minSpent || 0;
    const nextMin = auth.nextTier.minSpent;
    const range = nextMin - currentMin;
    const progress = totalSpent - currentMin;
    percent = range > 0 ? Math.round((progress / range) * 100) : 0;
  } else if (auth?.currentTier) {
    percent = 100;
  }
  percent = Math.max(0, Math.min(100, percent));

  const getProgressColor = (name: string) => {
    if (name.includes('Kim Cương') || name.includes('Diamond')) {
      return { '0%': '#b000ff', '100%': '#ff0077' };
    }
    if (name.includes('Bạch Kim') || name.includes('Platinum')) {
      return { '0%': '#00f2fe', '100%': '#4facfe' };
    }
    if (name.includes('Vàng') || name.includes('Gold')) {
      return { '0%': '#ffd700', '100%': '#ffa500' };
    }
    if (name.includes('Bạc') || name.includes('Silver')) {
      return { '0%': '#c0c0c0', '100%': '#708090' };
    }
    return { '0%': '#cd7f32', '100%': '#a05a2c' };
  };

  return (
    <div className="min-h-screen py-5 px-2">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-[24px] font-bold text-slate-800">Lịch sử giao dịch</h1>

        {auth && (
          <Card className="shadow-sm border-slate-200/60 bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <TrophyOutlined style={{ fontSize: '100px', color: '#1e293b' }} />
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <CrownOutlined className="text-yellow-500" /> Cấp độ thành viên
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    {currentTierName} {discount > 0 && <span className="text-sm text-red-500 font-semibold">(-{discount}%)</span>}
                  </h2>
                </div>
                <div className="sm:text-right">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Tổng chi tiêu tích lũy
                  </div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">
                    {convertStringToPrice(totalSpent)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  percent={percent}
                  status="active"
                  strokeColor={getProgressColor(currentTierName)}
                  showInfo={false}
                  className="mb-0"
                />
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{currentTierName}</span>
                  {auth?.nextTier ? (
                    <span>{nextTierName} ({convertStringToPrice(auth.nextTier.minSpent)})</span>
                  ) : (
                    <span>Cấp độ tối đa</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-sm text-slate-600">
                {auth?.nextTier ? (
                  <span>
                    🎉 Bạn cần tích lũy thêm <strong className="text-blue-600">{convertStringToPrice(needed)}</strong> nữa để nâng cấp thành viên lên <strong className="text-slate-800">{nextTierName}</strong>.
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
                    🏆 Chúc mừng! Bạn đã đạt thứ hạng VIP cao nhất và đang hưởng đặc quyền chiết khấu tối đa.
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="py-3">
          <Table<any>
            rowKey="_id"
            columns={columns}
            dataSource={data?.data || []}
            loading={isPending}
            sticky
            scroll={{ y: 500 }}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPayPage;
