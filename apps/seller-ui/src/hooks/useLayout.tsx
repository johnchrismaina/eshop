import { useLayout as useLayoutBase } from '../../../../packages/hooks';
import axiosInstance from '../utils/axiosInstance';

const useLayout = () => {
  return useLayoutBase(axiosInstance);
};

export default useLayout;
