import type { ReactNode } from 'react';

const AuthLayout = ({ children, quote }: { children: ReactNode; quote: string }) => (
  <div className="rc-auth">
    <div className="rc-auth__media">
      <img src="/images/heritage-edit-men.jpg" alt="" />
      <p className="rc-auth__quote">{quote}</p>
    </div>
    <div className="rc-auth__form">{children}</div>
  </div>
);

export default AuthLayout;
