import { Link } from 'react-router-dom';
import {
  calculateDiscountPercentage,
  convertStringToPrice,
} from '../../helpers/func';
import { FaChevronRight, FaTag } from 'react-icons/fa6';

interface CategoryItemProps {
  _id: string;
  name: string;
  mainImage: string;
  price: string;
  originalPrice: string;
  slug: string;
}

const CategoryItem = ({
  data,
  name,
}: {
  data: CategoryItemProps[];
  name: string;
}) => {
  return (
    <>
      <div className="py-5">
        <h2 className="w-full text-center text-2xl font-bold mb-3">{name}</h2>
        <div className="grid grid-cols-4 gap-4">
          {data.map((it) => (
            <Link
              to={`/iphone/detail/${it.slug}`}
              key={it._id}
              className="pt-10 pb-3 px-3 rounded-2xl bg-[#ffffff] relative cursor-pointer border-slate-100 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl"
            >
              {calculateDiscountPercentage(it.originalPrice, it.price) > 0 && (
                <div className="absolute top-0 left-0 bg-red-500 rounded-r-2xl rounded-tl-2xl w-auto px-3 py-1 text-gray-100 text-[13px] text-center">
                  Giảm {calculateDiscountPercentage(it.originalPrice, it.price)}
                  %
                </div>
              )}

              <div className="absolute top-3 right-2 border-2 px-2 border-green-600 rounded-lg text-[14px] text-green-700">
                <span className="flex justify-center items-center gap-1">
                  <FaTag /> New
                </span>
              </div>
              <img
                loading="lazy"
                src={it.mainImage}
                alt=""
                className="rounded-2xl object-cover "
              />

              <h3 className="text-center text-lg mt-3 font-medium">
                {it.name}
              </h3>

              <div className="mt-3 flex justify-center items-center gap-3">
                <span className="text-blue-600 font-medium">
                  {convertStringToPrice(Number(it.price))}
                </span>
                <span className="line-through">
                  {convertStringToPrice(Number(it.originalPrice))}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center items-center pt-5 ">
          <Link to={'/iphone'}>
            <button className="py-3! px-5! border text-sm flex items-center justify-center gap-2 text-blue-400 rounded-md hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer">
              Xem tất cả {name} <FaChevronRight />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CategoryItem;
