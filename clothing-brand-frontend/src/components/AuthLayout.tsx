import { useMemo, type ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import { pickLooks } from '../lib/media';
import { responsiveImage } from '../utils/mediaHelper';

const AuthLayout = ({ children, quote }: { children: ReactNode; quote: string }) => {
  const { state } = useAppContext();
  const [look] = useMemo(() => pickLooks(state.products, 1, { salt: 7 }), [state.products]);

  return (
    <div className="rc-auth">
      <div className="rc-auth__media">
        {look && <img key={look.src} {...responsiveImage(look.src, '50vw', 960)} alt="" className="rc-fade-in" />}
        <p className="rc-auth__quote">{quote}</p>
      </div>
      <div className="rc-auth__form">{children}</div>
    </div>
  );
};

export default AuthLayout;
