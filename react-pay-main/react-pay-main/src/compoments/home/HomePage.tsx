import { useRef } from 'react';
import { Carousel } from 'antd';
import { FaBolt, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

import {
  HomePageAirpods,
  HomePageIPad,
  HomePageIphone,
  HomePageMac,
  HomePagePhuKien,
  HomePageWatch,
} from '../../helpers/dataTest';
import CategoryItem from './CategoryItem';
import { useActiveFlashSale, useCountdown } from '../../helpers/useFlashSale';
import { convertStringToPrice } from '../../helpers/func';

const FlashSaleSectionBox = ({
  event,
  items,
}: {
  event: any;
  items: any[];
}) => {
  const carouselRef = useRef<any>(null);
  const { hours, minutes, seconds } = useCountdown(event.endTime);

  return (
    <div className="my-8 bg-linear-to-r from-red-400 via-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative">
      {/* Background glowing effects */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-400 text-red-700 rounded-2xl animate-bounce shadow-lg">
            <FaBolt size={26} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-yellow-300">
              ⚡ {event.name || 'GIỜ VÀNG FLASH SALE'}
            </h2>
            <p className="text-xs md:text-sm font-medium text-orange-100">
              Săn deal sập sàn - Giá giảm sốc cực hời!
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
          <span className="text-xs font-semibold text-orange-200">
            KẾT THÚC SAU:
          </span>
          <span className="bg-white text-red-600 px-2.5 py-1 rounded-lg font-mono font-black text-base shadow">
            {hours}
          </span>
          <span className="font-bold text-yellow-300">:</span>
          <span className="bg-white text-red-600 px-2.5 py-1 rounded-lg font-mono font-black text-base shadow">
            {minutes}
          </span>
          <span className="font-bold text-yellow-300">:</span>
          <span className="bg-white text-red-600 px-2.5 py-1 rounded-lg font-mono font-black text-base shadow">
            {seconds}
          </span>
        </div>
      </div>

      {/* Scoped CSS for Carousel dots positioning below cards */}
      <style>{`
        .flash-sale-carousel .slick-dots {
          position: relative !important;
          bottom: auto !important;
          margin-top: 18px !important;
          margin-bottom: 4px !important;
        }
        .flash-sale-carousel .slick-dots li button {
          background: rgba(255, 255, 255, 0.6) !important;
          height: 5px !important;
          border-radius: 4px !important;
        }
        .flash-sale-carousel .slick-dots li.slick-active button {
          background: #facc15 !important;
          width: 24px !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Carousel of Flash Sale Items */}
      <div className="flash-sale-carousel relative px-3 sm:px-6">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => carouselRef.current?.prev()}
          className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-orange-600 shadow-2xl border border-orange-200 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Previous Slide"
        >
          <FaChevronLeft size={18} />
        </button>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => carouselRef.current?.next()}
          className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-orange-600 shadow-2xl border border-orange-200 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Next Slide"
        >
          <FaChevronRight size={18} />
        </button>

        <Carousel
          ref={carouselRef}
          autoplay={{ dotDuration: true }}
          autoplaySpeed={3500}
          slidesToShow={items.length < 4 ? items.length : 4}
          slidesToScroll={1}
          dots={true}
          responsive={[
            {
              breakpoint: 1280,
              settings: { slidesToShow: Math.min(items.length, 4) },
            },
            {
              breakpoint: 1024,
              settings: { slidesToShow: Math.min(items.length, 3) },
            },
            {
              breakpoint: 768,
              settings: { slidesToShow: Math.min(items.length, 2) },
            },
            {
              breakpoint: 480,
              settings: { slidesToShow: 1 },
            },
          ]}
        >
          {items.map((item: any) => {
            const product = item.product;
            const variant = item.productVariant;
            const originalPrice = variant?.price || 0;
            const flashPrice = item.flashSalePrice || 0;
            const discountPct =
              originalPrice > 0
                ? Math.round(
                    ((originalPrice - flashPrice) / originalPrice) * 100
                  )
                : 0;

            return (
              <div key={item._id} className="px-2 py-1">
                <Link
                  to={`/iphone/detail/${product?.slug || '_'}`}
                  className="bg-white rounded-2xl p-4 text-slate-800 flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-xl group relative border border-orange-100 h-full"
                >
                  {/* Discount Tag */}
                  {discountPct > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-lg z-10 shadow">
                      -{discountPct}%
                    </div>
                  )}

                  <div className="overflow-hidden rounded-xl bg-slate-50 p-3">
                    <img
                      src={product?.mainImage || '/placeholder.png'}
                      alt={product?.name}
                      className="w-full h-40 object-contain group-hover:scale-105 transition-transform duration-300 mx-auto"
                    />
                  </div>

                  <div className="mt-3 text-center">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                      {product?.name}
                    </h4>
                    <p className="text-xs text-gray-100 font-medium mt-0.5">
                      {variant?.storage} - {variant?.color}
                    </p>

                    <div className="mt-2.5 flex justify-center items-baseline gap-2">
                      <span className="text-orange-100 font-extrabold text-base">
                        {convertStringToPrice(flashPrice)}
                      </span>
                      {originalPrice > flashPrice && (
                        <span className="line-through text-xs text-gray-300">
                          {convertStringToPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </Carousel>
      </div>

      {/* Bottom Line View All Button */}
      <div className="flex justify-center items-center pt-5 border-t border-white/15 mt-3">
        <Link to="/flash-sale">
          <button className="py-2.5 px-6 font-bold text-sm flex items-center justify-center gap-2 text-red-800 bg-yellow-400 hover:bg-yellow-300 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer uppercase tracking-wider">
            Xem tất cả Flash Sale <FaChevronRight />
          </button>
        </Link>
      </div>
    </div>
  );
};

const FlashSaleHomeSection = () => {
  const { activeEvents } = useActiveFlashSale();

  if (!activeEvents || activeEvents.length === 0) return null;

  const currentGroup = activeEvents[0];
  const { event, items } = currentGroup;
  if (!items || items.length === 0) return null;

  return <FlashSaleSectionBox event={event} items={items} />;
};

const HomePage = () => {
  return (
    <>
      <div className="relative w-screen max-w-none overflow-hidden! left-1/2 -translate-x-1/2 -mx-4 md:-mx-6 lg:mx-0 xl:-mx-2">
        <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={3000}>
          <div>
            <img
              className="w-full block object-fill"
              src="https://cdn.shopdunk.com/assets/b9c84320-acda-4eec-891c-e85f54e5a7f7?key=sd-home-hero-desktop"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="https://cdn.shopdunk.com/assets/f5396e71-c825-407c-beb0-b4dc51e35471?key=sd-home-hero-desktop"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="https://cdn.shopdunk.com/assets/15c5b8ed-aa26-4bfc-b388-56b7dac5e099?key=sd-home-hero-desktop"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="https://cdn.shopdunk.com/assets/da51a741-9e4f-4938-b4a4-ccce34848d01?key=sd-home-hero-desktop"
              alt=""
            />
          </div>
        </Carousel>
      </div>

      <div className="relative">
        {/* Left Banner */}
        <div className="absolute top-10 -right-50 ml-3 hidden 2xl:block">
          <img
            src="/home/left.png"
            alt="Left Banner"
            className="w-36 h-auto object-contain"
          />
        </div>

        {/* Right Banner */}
        <div className="absolute top-10 -left-50 ml-3 hidden 2xl:block">
          <img
            src="/home/right.png"
            alt="Right Banner"
            className="w-36 h-auto object-contain"
          />
        </div>
        <div className="my-4 rounded-2xl ">
          <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={2000}>
            <div>
              <img
                className="w-full block"
                src="https://cdn.shopdunk.com/assets/f3db7957-920b-48ab-a749-255eecfb6868?key=sd-home-subhero-desktop"
                alt=""
              />
            </div>
            <div>
              <img
                className="w-full block"
                src="https://cdn.shopdunk.com/assets/0838c294-fce9-4ac3-a85c-9b59e226e4e3?key=sd-home-subhero-desktop"
                alt=""
              />
            </div>
          </Carousel>
        </div>

        {/* Eye-catching Flash Sale Section on Homepage */}
        <FlashSaleHomeSection />

        <CategoryItem data={HomePageIphone} name="iPhone" />
        <CategoryItem data={HomePageIPad} name="iPad" />
        <CategoryItem data={HomePageMac} name="Mac" />
        <CategoryItem data={HomePageWatch} name="Watch" />
        <CategoryItem data={HomePageAirpods} name="Airpods" />
        <CategoryItem data={HomePagePhuKien} name="Phụ kiện" />
      </div>
    </>
  );
};
export default HomePage;
