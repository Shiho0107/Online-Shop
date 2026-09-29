import { Carousel, Pagination, Select } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getData } from '../../helpers/request';
import type { productVariantType } from '../../helpers/type';
import ProductCart from '../product/ProductCart';

const iphoneSeries = [
  {
    id: 'iphone-17',
    name: 'iPhone 17 series',
    path: '/iphone/iphone-17-series',
  },
  {
    id: 'iphone-16-series',
    name: 'iPhone 16 series',
    path: '/iphone/iphone-16-series',
  },
  {
    id: 'iphone-15-series',
    name: 'iPhone 15 series',
    path: '/iphone/iphone-15-series',
  },
  {
    id: 'iphone-14-series',
    name: 'iPhone 14 series',
    path: '/iphone/iphone-14-series',
  },
  {
    id: 'iphone-13-series',
    name: 'iPhone 13 series',
    path: '/iphone/iphone-13-series',
  },
];

const IphonePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('p') || searchParams.get('page') || 1;
  const limit = searchParams.get('l') || searchParams.get('limit') || 16;
  const sort = searchParams.get('sort') || searchParams.get('sort') || 'newest';
  const { data, isPending } = useQuery({
    queryKey: ['product', page, limit, sort],
    queryFn: () =>
      getData(
        `product-variants?search=iphone&page=${page}&limit=${limit}&sort=${sort}`
      ),
  });

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (key === 'sort') {
      params.set(key, value);
    } else {
      params.set(key, value);
      // params.set('p', '1'); // Reset về trang 1 khi đổi limit hoặc sort
    }
    setSearchParams(params);
  };

  return (
    <>
      <div className="py-5 rounded-2xl">
        <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={2000}>
          <div>
            <img
              className="w-full block object-fill"
              src="./iphone/banner iP17_Danh mục.webp"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="./iphone/banner iP17Air_Danh mục.webp"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="./iphone/banner iP17promax_Danh mục.webp"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="./iphone/danh mục-ip_Danh mục copy 6.webp"
              alt=""
            />
          </div>
          <div>
            <img
              className="w-full block object-fill"
              src="./iphone/danh mục-ip_Danh mục copy 8.webp"
              alt=""
            />
          </div>
        </Carousel>
      </div>

      <div className="flex gap-4 flex-wrap pb-3">
        {iphoneSeries.map((it) => (
          <Link
            to={it.path}
            key={it.id}
            className="bg-[#ffffff] p-2 rounded-2xl px-4 "
          >
            <span className="text-sm font-mono">{it.name}</span>
          </Link>
        ))}
      </div>

      <div className="p-3 bg-slate-50 mt-3 rounded-2xl">
        {isPending || !data ? (
          <>
            <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm">Sắp xếp theo</span>
              <Select
                defaultValue={String(sort) || 'newest'}
                style={{ width: 120 }}
                onChange={(value) => handleChange('sort', value)}
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price_asc', label: 'Giá thấp' },
                  { value: 'price_desc', label: 'Giá cao' },
                ]}
              />

              <span className="ms-4 text-sm">Hiển thị theo</span>
              <Select
                defaultValue={String(limit) || '8'}
                style={{ width: 60 }}
                onChange={(value) => handleChange('l', value)}
                options={[
                  { value: '8', label: '8' },
                  { value: '16', label: '16' },
                  { value: '32', label: '32' },
                ]}
              />
              <span className="text-sm">trên một trang</span>
            </div>

            <div className="grid grid-cols-4 gap-3 py-10">
              {data?.data?.length > 0 &&
                data.data.map((it: productVariantType) => (
                  <ProductCart key={it._id} {...it} />
                ))}
            </div>
            <div className="pb-15 pt-10">
              <Pagination
                align="center"
                current={Number(page) || 1}
                total={Number(data?.pagination?.totalVariants) || 1}
                pageSize={Number(limit) || 8}
                onChange={(value) => handleChange('p', String(value))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default IphonePage;
