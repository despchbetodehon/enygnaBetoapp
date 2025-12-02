import Link from 'next/link';
import { Menu } from 'antd';
import { FaHome , FaBuilding } from 'react-icons/fa';

const BotoesNavegacao = () => {
  const menuStyle = {
    width: '220px', // Set the desired width here
  };

  const menuItemStyle = {
    borderRadius: '50px',
    borde: '15px',
    marginBottom: '3px'
  };

  return (
    <Menu mode="horizontal" style={{ ...menuStyle, ...menuItemStyle }} theme="dark">
      <Menu.Item icon={< FaHome />} style={menuItemStyle}>
        <Link href="/">Inicio</Link>
      </Menu.Item>
      <Menu.Item icon={<FaBuilding />} style={menuItemStyle}>
        <Link href="/enterprises">EnterPrises</Link>
      </Menu.Item>

     
    </Menu>
  );
};

export default BotoesNavegacao;
