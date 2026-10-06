import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = (props: Props) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="rc-password">
      <input {...props} type={visible ? 'text' : 'password'} className="rc-input" />
      <button type="button" className="rc-icon-btn" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;
