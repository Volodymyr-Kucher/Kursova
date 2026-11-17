import { useSelector } from 'react-redux';
import { selectEventsStatus } from '../store.js';

export const useEventsStatus = () => useSelector(selectEventsStatus);
