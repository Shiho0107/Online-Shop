import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getData } from '../../helpers/request';
import type { productVariantType } from '../../helpers/type';
import ProductCart from '../product/ProductCart';

const ItemPage = () => {
  const { type, slug } = useParams();

  const { data, isPending } = useQuery({
    queryKey: ['product', type, slug],
    queryFn: () => getData(`product-variants/${type}/${slug}`),
  });

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f7]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  // console.log(data);
  return (
    <div className="container mx-auto w-300 ">
      <div className="grid grid-cols-4 gap-3 py-10">
        {data?.data?.variants.map((it: productVariantType) => (
          <ProductCart key={it._id} {...it} />
        ))}
      </div>
    </div>
  );
};

export default ItemPage;
