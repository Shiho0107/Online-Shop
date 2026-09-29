import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Table,
  Tag,
  Row,
  Col,
  Space,
  Progress,
  Empty,
  Segmented,
} from 'antd';
import type { TableProps } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  BlockOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HistoryOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

import { getData } from '../../../helpers/request';
import type { LowStock, RecentOrder, StatData } from '../../../helpers/type';
// import { convertStringToPrice } from '../../../helpers/func';

const AdminStatisticalPage = () => {
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(
    null
  );
  const [range, setRange] = useState<'1w' | '1m' | '1y'>('1w');

  const { data: responseData, isPending } = useQuery({
    queryKey: ['statistics', range],
    queryFn: () => getData(`statistics?range=${range}`),
  });

  const stats: StatData | null = responseData?.data || null;

  // Format monetary values
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  // Safe division helper
  const getPercent = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // Columns for Low Stock (Storage Control)
  const lowStockColumns: TableProps<LowStock>['columns'] = [
    {
      title: 'Tên sản phẩm',
      key: 'productName',
      render: (_, record) => (
        <span className="font-semibold text-slate-800 text-sm">
          {record.product?.name || 'Sản phẩm chưa đặt tên'}
        </span>
      ),
    },
    {
      title: 'Dung lượng',
      dataIndex: 'storage',
      key: 'storage',
      render: (storage) => <Tag color="geekblue">{storage}</Tag>,
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <span className="text-slate-600 text-sm capitalize">{color}</span>
      ),
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition',
      key: 'condition',
      render: (cond) => <Tag color="orange">{cond}</Tag>,
    },
    {
      title: 'Số lượng còn lại',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock === 0 ? 'red' : 'volcano'} className="font-bold px-3">
          {stock === 0 ? 'Hết hàng (0)' : `Còn ${stock}`}
        </Tag>
      ),
    },
  ];

  // Columns for Recent Orders
  const recentOrdersColumns: TableProps<RecentOrder>['columns'] = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code) => (
        <span className="font-mono text-xs font-semibold text-slate-700">
          #{code}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium text-sm text-slate-800">
            {record.info?.name || 'Khách vãng lai'}
          </div>
          <div className="text-xs text-gray-400">
            {record.info?.phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span className="font-semibold text-slate-800">
          {formatVND(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: RecentOrder['status']) => {
        const colors = { PAID: 'green', PENDING: 'blue', CANCELLED: 'red' };
        const labels = {
          PAID: 'Đã thanh toán',
          PENDING: 'Chờ thanh toán',
          CANCELLED: 'Đã huỷ',
        };
        return (
          <Tag color={colors[status]} className="font-medium">
            {labels[status]}
          </Tag>
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="text-gray-500 text-xs">
          {new Date(date).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })}
        </span>
      ),
    },
  ];

  // Draw Revenue Line Chart using pure SVG
  const renderTrendChart = () => {
    if (!stats || !stats.salesTrend || stats.salesTrend.length === 0)
      return <Empty description="Chưa có dữ liệu xu hướng" />;

    const trend = stats.salesTrend;
    const width = 600;
    const height = 350;
    const padding = { top: 30, right: 20, bottom: 40, left: 60 };

    const maxVal = Math.max(...trend.map((t) => t.revenue), 1000000);

    // Convert data to SVG coordinate points
    const points = trend.map((t, i) => {
      const x =
        padding.left +
        (i / (trend.length - 1)) * (width - padding.left - padding.right);
      const y =
        height -
        padding.bottom -
        (t.revenue / maxVal) * (height - padding.top - padding.bottom);
      return { x, y, data: t };
    });

    // Create Path String
    let pathD = '';
    points.forEach((p, i) => {
      if (i === 0) {
        pathD += `M ${p.x} ${p.y}`;
      } else {
        pathD += ` L ${p.x} ${p.y}`;
      }
    });

    // Create Filled Area Path String
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

    const getFormattedLabel = (dateStr: string) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}`;
      }
      if (dateStr.startsWith('Tuần ')) {
        return dateStr.split(' ')[0] + ' ' + dateStr.split(' ')[1];
      }
      if (dateStr.startsWith('Tháng ')) {
        const parts = dateStr.replace('Tháng ', '').split('/');
        if (parts.length === 2) {
          return `T${parts[0]}/${parts[1].substring(2)}`;
        }
        return dateStr;
      }
      return dateStr;
    };

    return (
      <div className="relative bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
          <div className="font-bold text-slate-800 text-base">
            {range === '1w' && 'Biểu đồ doanh thu 7 ngày qua'}
            {range === '1m' && 'Biểu đồ doanh thu theo tuần (30 ngày)'}
            {range === '1y' && 'Biểu đồ doanh thu theo tháng (1 năm)'}
          </div>
          <div className="flex items-center gap-4">
            <Segmented
              value={range}
              onChange={(value: any) => setRange(value)}
              options={[
                { label: '1 Tuần', value: '1w' },
                { label: '1 Tháng', value: '1m' },
                { label: '1 Năm', value: '1y' },
              ]}
              className="bg-slate-100 p-0.5 rounded-lg text-xs font-semibold"
            />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Đơn vị: VND (₫)
            </span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y =
              padding.top + ratio * (height - padding.top - padding.bottom);
            const val = maxVal * (1 - ratio);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  className="text-[10px] font-medium"
                >
                  {val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : formatVND(val).replace('₫', '')}
                </text>
              </g>
            );
          })}

          {/* Filled Area */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredTrendIndex === i ? 6 : 4}
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth={hoveredTrendIndex === i ? 3 : 2}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredTrendIndex(i)}
                onMouseLeave={() => setHoveredTrendIndex(null)}
              />
              {/* Date label */}
              <text
                x={p.x}
                y={height - 15}
                textAnchor="middle"
                fill="#64748b"
                className="text-[9px] font-semibold"
              >
                {getFormattedLabel(p.data.date)}
              </text>
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredTrendIndex !== null && points[hoveredTrendIndex] && (
          <div
            className="absolute z-10 bg-slate-800 text-white rounded-lg p-2.5 shadow-md text-xs pointer-events-none transition-all duration-150"
            style={{
              left: `${(points[hoveredTrendIndex].x / width) * 100}%`,
              top: `${(points[hoveredTrendIndex].y / height) * 100}%`,
              transform: 'translate(-50%, -115%)',
            }}
          >
            <div className="font-semibold">
              {points[hoveredTrendIndex].data.date}
            </div>
            <div className="mt-0.5 text-emerald-400">
              Doanh thu: {formatVND(points[hoveredTrendIndex].data.revenue)}
            </div>
            <div className="text-slate-300">
              Đơn hàng: {points[hoveredTrendIndex].data.orders} đơn
            </div>
          </div>
        )}
      </div>
    );
  };

  // Draw Status Distribution Donut Chart using pure SVG (compact version)
  const renderDistributionChart = () => {
    if (!stats) return null;

    const { PAID, PENDING, CANCELLED } = stats.distribution;
    const total = PAID + PENDING + CANCELLED;

    if (total === 0) return <Empty description="Chưa có dữ liệu đơn hàng" />;

    const r = 38;
    const circ = 2 * Math.PI * r;

    // Percentages
    const paidPct = getPercent(PAID, total);
    const pendPct = getPercent(PENDING, total);
    const cancPct = getPercent(CANCELLED, total);

    // Stroke offsets
    const paidDash = (PAID / total) * circ;
    const pendDash = (PENDING / total) * circ;
    const cancDash = (CANCELLED / total) * circ;

    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="font-bold text-slate-800 text-sm mb-2">
          Phân trạng thái đơn hàng
        </div>

        <div className="flex flex-row items-center justify-around gap-4 py-0.5">
          {/* Donut Chart */}
          <div className="relative w-24 h-24 shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={10}
              />

              {/* Paid segment */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#10b981"
                strokeWidth={10}
                strokeDasharray={`${paidDash} ${circ}`}
                strokeDashoffset={0}
              />

              {/* Pending segment */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={10}
                strokeDasharray={`${pendDash} ${circ}`}
                strokeDashoffset={-paidDash}
              />

              {/* Cancelled segment */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#ef4444"
                strokeWidth={10}
                strokeDasharray={`${cancDash} ${circ}`}
                strokeDashoffset={-(paidDash + pendDash)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                Đơn
              </span>
              <span className="text-lg font-bold text-slate-800">{total}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-[11px] leading-tight flex-1 max-w-30">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700">Đã trả: </span>
                <span className="text-slate-500">
                  {PAID} ({paidPct}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700">Chờ: </span>
                <span className="text-slate-500">
                  {PENDING} ({pendPct}%)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 block shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-slate-700">Huỷ: </span>
                <span className="text-slate-500">
                  {CANCELLED} ({cancPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBestSellers = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <FireOutlined className="text-amber-500 text-base animate-pulse" />
            <span className="font-bold text-slate-800 text-sm">
              Top 5 sản phẩm bán chạy
            </span>
          </div>
          <div className="p-2.5 divide-y divide-slate-100">
            {stats && stats.bestSellers.length > 0 ? (
              stats.bestSellers.map((item, index) => (
                <div
                  key={index}
                  className="py-2 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-850 text-xs truncate">
                        {item.variant?.product?.name ||
                          'Sản phẩm không tồn tại'}
                      </div>
                      <div className="text-gray-400 text-[9px] mt-0.5 flex gap-1.5">
                        <span>Màu: {item.variant?.color || 'N/A'}</span>
                        <span>•</span>
                        <span>
                          Dung lượng: {item.variant?.storage || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Tag
                      color="green"
                      className="font-bold block text-center m-0 text-[10px] px-1.5 py-0"
                    >
                      Bán {item.quantitySold}
                    </Tag>
                  </div>
                </div>
              ))
            ) : (
              <Empty description="Chưa có dữ liệu bán hàng" className="py-4" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. KPIs Section */}
      <Row gutter={[16, 16]} className="flex-stretch">
        <Col xs={24} sm={8}>
          <Card
            loading={isPending}
            style={{
              background: 'linear-gradient(to bottom right, #10b981, #0d9488)',
              border: 0,
              height: '100%',
            }}
            className="overflow-hidden relative rounded-2xl text-white shadow-md hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                  Doanh thu tích luỹ
                </div>
                <div className="text-2xl font-bold mt-2 truncate text-white">
                  {stats ? formatVND(stats.kpis.totalRevenue) : '0 ₫'}
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <DollarOutlined className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-50 font-medium">
              {stats && stats.kpis.revenueDiff !== undefined ? (
                <>
                  {stats.kpis.revenueDiff >= 0 ? (
                    <>
                      <ArrowUpOutlined />
                      <span>
                        +{formatVND(stats.kpis.revenueDiff)} so với tháng trước
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownOutlined />
                      <span>
                        {formatVND(stats.kpis.revenueDiff)} so với tháng trước
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span>0 ₫ so với tháng trước</span>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            loading={isPending}
            style={{
              background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)',
              border: 0,
              height: '100%',
            }}
            className="overflow-hidden relative rounded-2xl text-white shadow-md hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider">
                  Đơn hàng hoàn tất
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  {stats
                    ? `${stats.kpis.paidOrdersCount} / ${stats.kpis.totalOrders}`
                    : '0 / 0'}
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <ShoppingCartOutlined className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-50 flex items-center justify-between font-medium">
              <span>Tỷ lệ hoàn thành:</span>
              <span className="font-bold">
                {stats
                  ? getPercent(
                      stats.kpis.paidOrdersCount,
                      stats.kpis.totalOrders
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="mt-1">
              <Progress
                percent={
                  stats
                    ? getPercent(
                        stats.kpis.paidOrdersCount,
                        stats.kpis.totalOrders
                      )
                    : 0
                }
                showInfo={false}
                strokeColor="#ffffff"
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            loading={isPending}
            style={{
              background: 'linear-gradient(to bottom right, #f59e0b, #ea580c)',
              border: 0,
              height: '100%',
            }}
            className="overflow-hidden relative rounded-2xl text-white shadow-md hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-orange-100 text-xs font-semibold uppercase tracking-wider">
                  Mặt hàng kinh doanh
                </div>
                <div className="text-2xl font-bold mt-2 text-white">
                  {stats ? stats.kpis.totalProducts : 0} sản phẩm
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white">
                <BlockOutlined className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-orange-50 font-medium">
              <span>Đang được quản lý trên hệ thống</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 2. Charts Section */}
      <Row gutter={[16, 16]} className="flex-stretch">
        <Col xs={24} lg={16}>
          {renderTrendChart()}
        </Col>
        <Col xs={24} lg={8} className="flex flex-col gap-4 justify-between">
          {renderDistributionChart()}
          {renderBestSellers()}
        </Col>
      </Row>

      {/* 3. Low Stock Storage Control Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <Space>
            <WarningOutlined className="text-rose-500 text-lg" />
            <span className="font-bold text-slate-800 text-base">
              Cảnh báo tồn kho (Kiểm soát kho hàng)
            </span>
          </Space>
          <Tag color="red" className="font-bold px-2 py-0.5">
            Số lượng &lt; 5
          </Tag>
        </div>
        <Table<LowStock>
          rowKey="_id"
          columns={lowStockColumns}
          dataSource={stats?.lowStockAlerts || []}
          loading={isPending}
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: (
              <Empty description="Kho hàng đầy đủ, không có sản phẩm sắp hết" />
            ),
          }}
        />
      </div>

      {/* 5. Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2.5">
          <HistoryOutlined className="text-blue-500 text-lg" />
          <span className="font-bold text-slate-800 text-base">
            Hoạt động mua hàng gần đây
          </span>
        </div>
        <Table<RecentOrder>
          rowKey="_id"
          columns={recentOrdersColumns}
          dataSource={stats?.recentOrders || []}
          loading={isPending}
          pagination={false}
          locale={{
            emptyText: (
              <Empty description="Chưa có đơn hàng nào được ghi nhận" />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default AdminStatisticalPage;
