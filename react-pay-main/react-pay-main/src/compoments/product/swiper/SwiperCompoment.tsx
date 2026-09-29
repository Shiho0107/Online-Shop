import { useState } from 'react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type SwiperCompomentProps = {
  images: string[] | [];
};

const SwiperCompoment = ({ images }: SwiperCompomentProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-2xl">
      {/* 1. SLIDER CHÍNH (HIỂN THỊ ẢNH LỚN HOẶC VIDEO) */}
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full aspect-square rounded-xl overflow-hidden border border-slate-100"
      >
        {/* Các Slide tiếp theo: Vòng lặp hiển thị ảnh sản phẩm */}
        {images.map((imgUrl: string, index: number) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full flex items-center justify-center bg-slate-50 p-6">
              <img
                src={imgUrl}
                alt="Product"
                className="max-w-full max-h-full object-contain"
                // onClick={() => setThumbsSwiper(imgUrl)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 2. SLIDER PHỤ (HÀNG ẢNH NHỎ THUMBS Ở DƯỚI) */}
      <div className="mt-4">
        <Swiper
          onSwiper={setThumbsSwiper}
          onDestroy={() => setThumbsSwiper(null)}
          spaceBetween={10}
          slidesPerView={images.length || 5} // Hiển thị 5 ảnh nhỏ cùng lúc
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="product-thumb-scroll cursor-pointer select-none"
        >
          {/* Các Thumb ảnh tiếp theo */}
          {images.map((imgUrl: string, index: number) => (
            <SwiperSlide
              key={index}
              className="rounded-lg overflow-hidden border border-slate-200 aspect-square opacity-50 hover:opacity-80 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:border-slate-800 [&.swiper-slide-thumb-active]:border-2 transition-all"
            >
              <div className="w-full h-full bg-slate-50 p-1 flex items-center justify-center">
                <img
                  src={imgUrl}
                  alt="Thumb"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SwiperCompoment;
