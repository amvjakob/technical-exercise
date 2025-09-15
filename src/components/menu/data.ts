// import toast from 'react-hot-toast';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
// import { IoSettingsOutline } from 'react-icons/io5';

export const menu = [
  {
    catalog: 'main',
    listItems: [
      {
        isLink: true,
        url: '/',
        icon: HiOutlineHome,
        label: 'Home',
      },
    ],
  },
  {
    catalog: 'Experiments',
    listItems: [
      {
        isLink: true,
        url: '/experiments',
        icon: HiOutlineCube,
        label: 'Experiments',
      },
      {
        isLink: true,
        url: '/calendar',
        icon: HiOutlineCalendarDays,
        label: 'calendar',
      },
    ],
  },
  {
    catalog: 'Deep Fractionation',
    listItems: [
      {
        isLink: true,
        url: '/deep-fractionation',
        icon: HiOutlineDocumentText,
        label: 'Experiments',
      },
      
    ],
  },
  {
    catalog: 'Screening',
    listItems: [
      {
        isLink: true,
        url: '/screening',
        icon: HiOutlineDocumentText,
        label: 'Experiments',
      },
  
    ],
  },
];
