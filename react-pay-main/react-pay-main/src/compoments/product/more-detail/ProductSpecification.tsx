import { memo } from 'react';

type ProductSpecificationProps = {
  screen?: string;
  chip?: string;
  gpu?: string;
  ram?: string;
  rearCamera?: string;
  frontCamera?: string;
  battery?: string;
  weight?: string;
};

interface ComponentProps {
  specifications: ProductSpecificationProps;
}

const ProductSpecification = ({ specifications }: ComponentProps) => {
  return (
    <div className=" py-4">
      <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-200 p-3 rounded-md">
        <span className="font-medium">Màn hình</span>
        <span className="text-sm">{specifications.screen}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 p-3">
        <span className="font-medium">Chip</span>
        <span className="text-sm">{specifications.chip}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-200 p-3 rounded-md">
        <span className="font-medium">GPU</span>
        <span className="text-sm">{specifications.gpu}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 p-3">
        <span className="font-medium">RAM</span>
        <span className="text-sm">{specifications.ram}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-200 p-3 rounded-md">
        <span className="font-medium">Camera sau</span>
        <span className="text-sm">{specifications.rearCamera}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 p-3">
        <span className="font-medium">Camera trước</span>
        <span className="text-sm">{specifications.frontCamera}</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-200 p-3 rounded-md">
        <span className="font-medium">Pin</span>
        <span className="text-sm">{specifications.battery}</span>
      </div>
      {/* <div className="grid grid-cols-2 gap-1 mb-3 p-3">
        <span className="font-medium">Trọng lượng</span>
        <span className="text-sm">{specifications.weight}</span>
      </div> */}
    </div>
  );
};

export default memo(ProductSpecification);
