import { useQuery } from '@tanstack/react-query';
import { DatePicker, Segmented, Spin } from 'antd';
import { Column, Line, Pie } from '@ant-design/plots';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

import { getData } from '../../../helpers/request';

const { RangePicker } = DatePicker;

interface Distribution {
  PENDING?: number;
  PAID?: number;
  CANCELLED?: number;
  [key: string]: number | undefined;
}

const ImportExportPage = () => {
  const [range, setRange] = useState<'1w' | '1m' | '1y' | 'custom'>('1w');
  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const { data: responseData, isPending } = useQuery({
    queryKey: ['profit-loss', range, dates],
    queryFn: () => {
      let url = `statistics/profit-loss?range=${range}`;
      if (range === 'custom' && dates) {
        const startDate = dates[0].format('YYYY-MM-DD');
        const endDate = dates[1].format('YYYY-MM-DD');
        url = `statistics/profit-loss?range=custom&startDate=${startDate}&endDate=${endDate}`;
      }
      return getData(url);
    },
    enabled: range !== 'custom' || !!dates,
  });

  // const rawStats = responseData?.data?.chartData || null;
  // const stats =
  //   rawStats?.map((item: any) => ({
  //     ...item,
  //     profit: item.profit ?? (item.revenue || 0) - (item.importedAmount || 0),
  //   })) || [];

  const dataRevenue = useMemo(() => {
    const result: any = [];
    if (!responseData?.data?.chartData) return result;
    const stats = responseData.data.chartData;
    for (const item of stats) {
      // if ((item.revenue || 0) > 0) {
      result.push({
        date: item.date,
        value: item.revenue,
        category: 'Doanh thu',
      });
      // }
    }
    return result;
  }, [responseData]);

  const dataImport = useMemo(() => {
    const result: any = [];
    if (!responseData?.data?.chartData) return result;
    const stats = responseData.data.chartData;
    for (const item of stats) {
      if ((item.importedAmount || 0) > 0) {
        if ((item.importedAmount || 0) > 0) {
          result.push({
            date: item.date,
            value: item.importedAmount,
            category: 'Nhập hàng',
          });
        }
      }
    }
    return result;
  }, [responseData]);

  const profitLossData = useMemo(() => {
    return responseData?.data?.profitLoss
      ? [
          {
            metric: 'Giá vốn hàng bán',
            value: responseData?.data?.profitLoss?.totalImportedAmount || 0,
          },
          {
            metric: 'Đã bán',
            value: responseData?.data?.profitLoss?.soldAmount || 0,
          },
          {
            metric: 'Lợi nhuận thực tế',
            value: responseData?.data?.profitLoss?.profit || 0,
          },
        ]
      : [];
  }, [responseData]);

  const dataStatisticsPie = useMemo(() => {
    const distribution: Distribution | undefined =
      responseData?.data?.distribution;

    // Nếu chưa có data thì trả về mảng rỗng ngay
    if (!distribution) return [];

    return [
      {
        type: 'Đang chờ xử lý',
        value: distribution.PENDING ?? 0,
      },
      {
        type: 'Đã thanh toán',
        value: distribution.PAID ?? 0,
      },
      {
        type: 'Đã hủy',
        value: distribution.CANCELLED ?? 0,
      },
    ];
  }, [responseData]);

  const config = {
    data: [...dataRevenue, ...dataImport],
    xField: 'date',
    yField: 'value',
    colorField: 'category', // 👈 Ant Design sẽ dựa vào thuộc tính này để tách thành 2 đường Line
    point: {
      shapeField: 'square',
      sizeField: 3,
    },
    scale: {
      color: {
        range: ['#1890ff', '#ff4d4f'], // Đường 1 màu Xanh Dương, Đường 2 màu Đỏ
      },
    },
    style: {
      lineWidth: 10,
    },
    tooltip: {
      channel: 'y',
      name: 'Số tiền',
      valueFormatter: (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value);
      },
    },
    axis: {
      y: {
        labelFormatter: (value: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value);
        },
      },
    },
  };

  const configTest = {
    data: profitLossData,
    xField: 'metric',
    yField: 'value',
    axis: {
      y: {
        labelFormatter: (value: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(value);
        },
      },
    },
    tooltip: {
      channel: 'y',
      name: 'Số tiền',
      valueFormatter: (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value);
      },
    },
    style: {
      fill: (d: any) => {
        if (d.metric === 'Lợi nhuận thực tế') {
          return d.value >= 0 ? '#10b981' : '#ef4444';
        }
        return '#3b82f6';
      },
    },
    label: {
      text: 'value',
      position: 'top',
      style: {
        fill: '#334155',
        fontSize: 12,
        fontWeight: 'bold',
      },
      formatter: (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
  };

  const configPie = {
    data: dataStatisticsPie,
    angleField: 'value',
    colorField: 'type',
    innerRadius: 0.6,
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    annotations: [
      {
        type: 'text',
        style: {
          text: 'Đơn hàng',
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 40,
          fontStyle: 'bold',
        },
      },
    ],
  };

  return (
    <div>
      <Spin size="large" spinning={isPending}>
        <div className="relative bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
            <div className="font-bold text-slate-800 text-base">
              {range === '1w' && 'Biểu đồ 7 ngày qua'}
              {range === '1m' && 'Biểu đồ theo tuần (30 ngày)'}
              {range === 'custom' &&
                dates &&
                `Biểu đồ từ ngày ${dates[0].format('DD/MM/YYYY')} đến ngày ${dates[1].format('DD/MM/YYYY')}`}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Segmented
                value={range}
                onChange={(value: any) => setRange(value)}
                options={[
                  { label: '1 Tuần', value: '1w' },
                  { label: '1 Tháng', value: '1m' },
                  { label: 'Tùy chọn', value: 'custom' },
                ]}
                className="bg-slate-100 p-0.5 rounded-lg text-xs font-semibold"
              />
              {range === 'custom' && (
                <RangePicker
                  value={dates}
                  onChange={(values) => {
                    if (values && values[0] && values[1]) {
                      setDates([values[0], values[1]]);
                    } else {
                      setDates(null);
                    }
                  }}
                  format="DD/MM/YYYY"
                  className="rounded-lg text-xs"
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
              )}
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Đơn vị: VND (₫)
              </span>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-5">
          <h1>Nhập hàng</h1>
          <Line {...config} />;
        </div>

        <div className=" mb-5 grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h1 className="text-xl mb-3">Lợi nhuận</h1>
            <Column {...configTest} />;
          </div>
          <div className="col-span-1 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <h1 className="text-xl mb-3">Tổng quan đơn hàng</h1>
            <Pie {...configPie} />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default ImportExportPage;
