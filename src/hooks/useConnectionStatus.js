import { useSelector } from 'react-redux';
import { selectConnectionStatus } from '../store.js';

export const useConnectionStatus = () => useSelector(selectConnectionStatus);
