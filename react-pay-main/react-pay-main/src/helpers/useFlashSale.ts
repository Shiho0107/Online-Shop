import { useQuery } from '@tanstack/react-query';
import { getData } from './request';
import { useState, useEffect } from 'react';

export interface FlashSaleItemInfo {
  eventId: string;
  eventName: string;
  startTime: string;
  endTime: string;
  flashSalePrice: number;
  flashSaleStock: number;
  soldCount: number;
  limitPerUser: number;
}

export const useActiveFlashSale = () => {
  const { data } = useQuery({
    queryKey: ['active-flash-sales'],
    queryFn: () => getData('flash-sales/active'),
    refetchInterval: 10000,
  });

  const variantMap: Record<string, FlashSaleItemInfo> = {};
  const productMap: Record<string, FlashSaleItemInfo> = {};
  const activeEvents: any[] = [];

  if (data?.success && Array.isArray(data?.data)) {
    data.data.forEach((group: any) => {
      const event = group.event;
      if (!event) return;
      const now = new Date();
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      if (now >= start && now <= end) {
        activeEvents.push(group);

        group.items?.forEach((item: any) => {
          const variantId = item.productVariant?._id || item.productVariant;
          const productId = item.product?._id || item.product;

          if (item.isActive && (item.flashSaleStock - (item.soldCount || 0)) > 0) {
            const info: FlashSaleItemInfo = {
              eventId: event._id,
              eventName: event.name,
              startTime: event.startTime,
              endTime: event.endTime,
              flashSalePrice: item.flashSalePrice,
              flashSaleStock: item.flashSaleStock,
              soldCount: item.soldCount || 0,
              limitPerUser: item.limitPerUser || 1,
            };

            if (variantId) {
              variantMap[variantId] = info;
            }
            if (productId) {
              if (!productMap[productId] || item.flashSalePrice < productMap[productId].flashSalePrice) {
                productMap[productId] = info;
              }
            }
          }
        });
      }
    });
  }

  return { variantMap, productMap, activeEvents, rawData: data?.data || [] };
};

export const useCountdown = (targetDate: string) => {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00', isEnded: false });

  useEffect(() => {
    if (!targetDate) return;
    const calculateTime = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00', isEnded: true });
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: h < 10 ? `0${h}` : `${h}`,
        minutes: m < 10 ? `0${m}` : `${m}`,
        seconds: s < 10 ? `0${s}` : `${s}`,
        isEnded: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};
