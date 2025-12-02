
import { useContext } from 'react';
import AutenticacaoContext from '../contexts/AutenticacaoContext';

export default function useAutenticacao() {
  return useContext(AutenticacaoContext);
}
