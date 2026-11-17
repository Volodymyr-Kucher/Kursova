import { useSelector } from 'react-redux';
import { selectAllEvents } from '../store.js';

export const useEvents = () => useSelector(selectAllEvents);
