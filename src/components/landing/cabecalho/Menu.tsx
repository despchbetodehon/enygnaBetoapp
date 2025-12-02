import AutenticacaoContext from '@/data/contexts/AutenticacaoContext';
import { IconBrandGoogle, IconMail } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import MenuItem from './MenuItem';
import LoginEmailSenha from './LoginEmailSenha';

export default function Menu() {
  const { loginGoogle } = useContext(AutenticacaoContext);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  return (
    <div className="flex relative">
      <div className="flex gap-2">
        <MenuItem onClick={loginGoogle} className="bg-gradient-to-r from-indigo-600 to-cyan-600">
          <div className="flex items-center gap-2">
            <IconBrandGoogle size={12} />
            <span>Google</span>
          </div>
        </MenuItem>
        
        <MenuItem 
          onClick={() => setShowEmailLogin(!showEmailLogin)} 
          className="bg-gradient-to-r from-green-600 to-teal-600"
        >
          <div className="flex items-center gap-2">
            <IconMail size={12} />
            <span>Email</span>
          </div>
        </MenuItem>
      </div>

      {showEmailLogin && (
        <div className="absolute top-full right-0 mt-2 z-50">
          <LoginEmailSenha />
        </div>
      )}
    </div>
  );
}
