import type { ReactNode } from 'react';
import { responsiveImage } from '../utils/mediaHelper';

const AuthLayout = ({ children, quote }: { children: ReactNode; quote: string }) => (
  <div className="rc-auth">
    <div className="rc-auth__media">
      <img {...responsiveImage('/images/heritage-edit-men.jpg', '50vw')} alt="" />
      <p className="rc-auth__quote">{quote}</p>
    </div>
    <div className="rc-auth__form">{children}</div>
  </div>
);

export default AuthLayout;
