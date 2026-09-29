import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Form, Input, Pagination, Select } from 'antd';

import { getData } from '../../helpers/request';
import type { productVariantType } from '../../helpers/type';
import ProductCart from '../product/ProductCart';

const SearchPage = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('s');
  const page = searchParams.get('p') || searchParams.get('page') || 1;
  const limit = searchParams.get('l') || searchParams.get('limit') || 10;
  const sort = searchParams.get('sort') || searchParams.get('sort') || 'newest';

  const { data, isPending } = useQuery({
    queryKey: ['product', search, page, limit, sort],
    queryFn: () =>
      getData(
        `product-variants?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
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

  // console.log('data', data);
  const onSubmit = (values: any) => {
    const params = new URLSearchParams(searchParams);
    let s = values.search.trim();
    if (!s) return;
    // s = s.replace(/\s+/g, '-');
    params.set('s', s);
    setSearchParams(params);
  };

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-5">
        <h2 className="text-center text-2xl font-bold">Tìm kiếm</h2>
      </div>

      <div className="px-3 py-5 flex justify-center items-center bg-[#ffffff] rounded-xl">
        <Form
          form={form}
          name="search_page_form"
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            search: search,
          }}
        >
          <Form.Item layout="vertical" label="Từ tìm kiếm :" name="search">
            <Input
              className="h-10 w-140! w-lg-140!"
              placeholder="Bạn cần tìm kiếm gi ? ..."
            />
          </Form.Item>
          <Form.Item className="flex! justify-center! mb-0!">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="flex justify-center items-center"
            >
              Tìm kiếm
            </Button>
          </Form.Item>
        </Form>
      </div>

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

      <div className="pb-20 pt-10">
        <Pagination
          align="center"
          current={Number(page) || 1}
          total={Number(data?.pagination?.totalVariants) || 1}
          pageSize={Number(limit) || 8}
          onChange={(value) => handleChange('p', String(value))}
        />
      </div>
    </div>
  );
};
export default SearchPage;
