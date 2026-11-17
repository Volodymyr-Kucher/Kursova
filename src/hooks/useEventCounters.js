import { useSelector } from 'react-redux';
import { selectEventCounters } from '../store.js';

export const useEventCounters = () => useSelector(selectEventCounters);
