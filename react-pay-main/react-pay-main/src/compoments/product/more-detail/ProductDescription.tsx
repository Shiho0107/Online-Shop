import { memo } from 'react';

const ProductDescription = () => {
  return (
    <div className="py-4">
      <img
        src="/iphone/test.webp"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export default memo(ProductDescription);
