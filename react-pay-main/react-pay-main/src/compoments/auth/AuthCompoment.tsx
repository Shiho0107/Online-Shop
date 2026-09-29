import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import type { typeInitState } from '../../helpers/type';

const AuthCompoment = () => {
  const auth = useSelector((state: typeInitState) => state.auth.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (auth) {
      navigate('/');
    }
  }, [auth]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-12 md:py-16 bg-[#ffffff] min-h-[calc(100vh-var(--header-height,88px))] items-center">
      <div>
        <img src="/auth/login.webp" className="object-contain" alt="" />
      </div>
      <div className="px-15">
        <Outlet />
      </div>
    </div>
  );
};
export default AuthCompoment;
