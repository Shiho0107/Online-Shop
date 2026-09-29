import { useState, useMemo } from 'react';
import { Select, Empty, Card } from 'antd';
import { FaFire, FaFilter, FaClock } from 'react-icons/fa6';
import { useActiveFlashSale, useCountdown } from '../../helpers/useFlashSale';
import ProductCart from '../product/ProductCart';
import type { productVariantType } from '../../helpers/type';

const FlashSalePage = () => {
  const { activeEvents } = useActiveFlashSale();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const currentEvent = useMemo(() => {
    if (!activeEvents || activeEvents.length === 0) return null;
    if (selectedEventId === 'all') return activeEvents[0]?.event;
    const found = activeEvents.find(
      (group: any) => group.event?._id === selectedEventId
    );
    return found?.event || activeEvents[0]?.event;
  }, [activeEvents, selectedEventId]);

  const { hours, minutes, seconds } = useCountdown(currentEvent?.endTime || '');

  // Flatten all items across active events
  const allItems = useMemo(() => {
    if (!activeEvents || activeEvents.length === 0) return [];

    let itemsList: any[] = [];
    if (selectedEventId === 'all') {
      activeEvents.forEach((group: any) => {
        if (Array.isArray(group.items)) {
          itemsList.push(...group.items);
        }
      });
    } else {
      const group = activeEvents.find(
        (g: any) => g.event?._id === selectedEventId
      );
      if (group && Array.isArray(group.items)) {
        itemsList = group.items;
      }
    }

    // Filter out inactive or out-of-stock items
    let filtered = itemsList.filter(
      (item) => item.isActive && item.productVariant
    );

    // Sorting
    if (sortBy === 'price-asc') {
      filtered.sort(
        (a, b) => (a.flashSalePrice || 0) - (b.flashSalePrice || 0)
      );
    } else if (sortBy === 'price-desc') {
      filtered.sort(
        (a, b) => (b.flashSalePrice || 0) - (a.flashSalePrice || 0)
      );
    } else if (sortBy === 'discount') {
      filtered.sort((a, b) => {
        const pctA = a.productVariant?.price
          ? (a.productVariant.price - a.flashSalePrice) / a.productVariant.price
          : 0;
        const pctB = b.productVariant?.price
          ? (b.productVariant.price - b.flashSalePrice) / b.productVariant.price
          : 0;
        return pctB - pctA;
      });
    }

    return filtered;
  }, [activeEvents, selectedEventId, sortBy]);

  // Convert flash sale items into productVariantType for ProductCart
  const formattedVariants = useMemo(() => {
    return allItems.map((item: any) => {
      const v = item.productVariant;
      return {
        _id: v?._id || item._id,
        sku: v?.sku || '',
        price: String(v?.price || item.flashSalePrice),
        originalPrice: String(
          v?.originalPrice || v?.price || item.flashSalePrice
        ),
        stock: String(item.flashSaleStock || 0),
        storage: v?.storage || '',
        color: v?.color || '',
        condition: v?.condition || 'New',
        region: v?.region || 'VN/A',
        isActive: true,
        imageColor: v?.imageColor || null,
        product: item.product || {
          _id: '',
          name: 'Sản phẩm Flash Sale',
          mainImage: '/placeholder.png',
          slug: '',
        },
      } as unknown as productVariantType;
    });
  }, [allItems]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen">
      {/* Hero Header Banner */}
      <div className="bg-linear-to-r from-red-600 via-orange-600 to-amber-500 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden mb-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-red-800/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-800 font-extrabold text-xs uppercase px-3 py-1 rounded-full shadow-md animate-pulse">
              <FaFire /> Khung Giờ Vàng Độc Quyền
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-yellow-300 drop-shadow">
              ⚡ SỰ KIỆN FLASH SALE
            </h1>
            <p className="text-orange-100 text-sm md:text-base max-w-xl">
              Danh sách sản phẩm công nghệ đang được áp dụng mức giá sập sàn.
              Chọn ngay món đồ yêu thích trước khi hết thời gian!
            </p>
          </div>

          {/* Countdown Clock Box */}
          {currentEvent && (
            <div className="bg-black/30 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center shadow-xl min-w-70">
              <div className="flex items-center justify-center gap-2 text-orange-200 text-xs font-bold uppercase tracking-wider mb-2">
                <FaClock /> Thời gian còn lại
              </div>
              <div className="flex items-center justify-center gap-2 font-mono font-black text-2xl">
                <div className="bg-white text-red-600 px-3 py-1.5 rounded-xl shadow-md">
                  {hours}
                </div>
                <span className="text-yellow-300 font-bold text-xl">:</span>
                <div className="bg-white text-red-600 px-3 py-1.5 rounded-xl shadow-md">
                  {minutes}
                </div>
                <span className="text-yellow-300 font-bold text-xl">:</span>
                <div className="bg-white text-red-600 px-3 py-1.5 rounded-xl shadow-md">
                  {seconds}
                </div>
              </div>
              <p className="text-[11px] text-orange-200 mt-2 font-medium">
                Sự kiện:{' '}
                <strong className="text-white">{currentEvent.name}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Event Switcher Toolbar */}
      {activeEvents && activeEvents.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Active Events selector if multiple events */}
          {activeEvents.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Khung giờ:
              </span>
              <Select
                value={selectedEventId}
                onChange={setSelectedEventId}
                className="w-full sm:w-64"
                options={[
                  { label: 'Tất cả khung giờ Flash Sale', value: 'all' },
                  ...activeEvents.map((g: any) => ({
                    label: `${g.event?.name} (${new Date(g.event?.startTime).getHours()}h - ${new Date(g.event?.endTime).getHours()}h)`,
                    value: g.event?._id,
                  })),
                ]}
              />
            </div>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-3 ml-auto w-full sm:w-auto justify-end">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
              <FaFilter className="text-orange-500" /> Sắp xếp:
            </span>
            <Select
              value={sortBy}
              onChange={setSortBy}
              className="w-48"
              options={[
                { label: 'Mặc định', value: 'default' },
                { label: 'Giảm giá nhiều nhất', value: 'discount' },
                { label: 'Giá thấp đến cao', value: 'price-asc' },
                { label: 'Giá cao đến thấp', value: 'price-desc' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Product List Grid */}
      {formattedVariants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {formattedVariants.map((variant) => (
            <ProductCart key={variant._id} {...variant} />
          ))}
        </div>
      ) : (
        <Card className="my-12 text-center shadow-sm border-slate-100 py-12 rounded-3xl">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-700">
                  Chưa có sản phẩm Flash Sale
                </h3>
                <p className="text-gray-400 text-sm">
                  Hiện tại không có sản phẩm nào trong khung giờ này. Xin quý
                  khách vui lòng quay lại sau!
                </p>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default FlashSalePage;
