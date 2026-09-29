import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useCartSync } from '../../helpers/hook';
import { FaArrowUp, FaCommentDots, FaPhone } from 'react-icons/fa6';
import { useEffect, useState } from 'react';

const MasterLayout = () => {
  // Sync the cart state with the backend store
  useCartSync();

  const [isVisibleArrowUp, setIsVisibleArrowUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisibleArrowUp(true);
      } else {
        setIsVisibleArrowUp(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <Header />
      <main
        style={{ paddingTop: 'var(--header-height, 88px)' }}
        className="h-full bg-[#f5f5f7] relative"
      >
        <div className="container mx-auto w-300 relative">
          <Outlet />
        </div>

        <div
          onClick={handleScrollToTop}
          className={`fixed bottom-47 right-3 rounded-full bg-gray-500 text-white p-4 cursor-pointer transition-all duration-400 ${isVisibleArrowUp ? 'opacity-100' : 'opacity-0'}`}
        >
          <FaArrowUp size={25} />
        </div>

        <div className="fixed bottom-30 right-3 rounded-full bg-green-500 text-white p-4 cursor-pointer">
          <FaCommentDots size={25} />
        </div>
        <div className="fixed bottom-13 right-3 rounded-full bg-blue-500 text-white p-4 cursor-pointer">
          <FaPhone size={25} />
        </div>
      </main>
      <Footer />
    </>
  );
};
export default MasterLayout;
