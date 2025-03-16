"use client";
import { FaHome, FaCar, FaPlus, FaList, FaBlogger, FaTags, FaUserShield, FaGlobe, FaImages, FaShippingFast, FaAnchor, FaQuestionCircle } from 'react-icons/fa';
import { IoIosColorPalette } from "react-icons/io";
import { SiRollsroyce } from "react-icons/si";
import { GiCarDoor } from "react-icons/gi";
import { AiOutlineSafety } from "react-icons/ai";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const AdminMenu = ({ children }) => {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const MenuItem = ({ href, icon: Icon, label }) => (
    <Link href={href} className="w-full">
      <motion.div
        whileHover={{ x: 4 }}
        className={`
          flex items-center px-4 py-2.5 rounded-lg cursor-pointer
          transition-all duration-200 group w-full
          ${isActive(href) 
            ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md" 
            : "text-gray-300 hover:bg-gray-800/50"
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive(href) ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        <span className="ml-3 text-sm font-medium">{label}</span>
      </motion.div>
    </Link>
  );

  const MenuSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="ml-4 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-10 z-40 h-[calc(100vh-2.5rem)] w-64 bg-gray-900">
        <div className="flex h-full flex-col overflow-y-auto border-r border-gray-800 px-3 py-4">
          <div className="mb-6 flex items-center justify-center">
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pb-20">
            <MenuSection title="Main">
              <MenuItem 
                href="/admin/dashboard" 
                icon={FaHome} 
                label="Dashboard" 
              />
            </MenuSection>

            <MenuSection title="Slider Management">
              <MenuItem 
                href="/admin/dashboard/slider" 
                icon={FaImages} 
                label="Manage Sliders" 
              />
              <MenuItem 
                href="/admin/dashboard/slider/new" 
                icon={FaPlus} 
                label="Add Slider" 
              />
            </MenuSection>

            <MenuSection title="Car Management">
              <MenuItem 
                href="/admin/dashboard/listing" 
                icon={FaCar} 
                label="Car Listings"
              />
              <MenuItem 
                href="/admin/dashboard/listing/new" 
                icon={FaPlus} 
                label="New Listing" 
              />
              <MenuItem href="/admin/dashboard/listing/make" icon={SiRollsroyce} label="Make" />
              <MenuItem href="/admin/dashboard/listing/model" icon={FaList} label="Model" />
              <MenuItem href="/admin/dashboard/listing/color" icon={IoIosColorPalette} label="Color" />
              <MenuItem href="/admin/dashboard/listing/features" icon={GiCarDoor} label="Features" />
              <MenuItem href="/admin/dashboard/listing/safety-features" icon={AiOutlineSafety} label="Safety" />
              <MenuItem href="/admin/dashboard/listing/type" icon={FaList} label="Type" />
              <MenuItem href="/admin/dashboard/listing/countries" icon={FaGlobe} label="Countries" />
            </MenuSection>

            <MenuSection title="Content Management">
              <MenuItem 
                href="/admin/dashboard/blog" 
                icon={FaBlogger} 
                label="Blog Posts" 
              />
              <MenuItem 
                href="/admin/dashboard/blog/new" 
                icon={FaPlus} 
                label="New Post" 
              />
              <MenuItem 
                href="/admin/dashboard/blog/cat" 
                icon={FaTags} 
                label="Categories" 
              />
            </MenuSection>

            <MenuSection title="Q&A Management">
              <MenuItem 
                href="/admin/dashboard/qna" 
                icon={FaQuestionCircle} 
                label="All Q&A" 
              />
              <MenuItem 
                href="/admin/dashboard/qna/new" 
                icon={FaPlus} 
                label="Add New Q&A" 
              />
            </MenuSection>

            <MenuSection title="Shipping">
              <MenuItem 
                href="/admin/dashboard/shipping" 
                icon={FaShippingFast} 
                label="Shipping Schedule" 
              />
              <MenuItem 
                href="/admin/dashboard/ports" 
                icon={FaAnchor} 
                label="Ports Management" 
              />
            </MenuSection>

            <MenuSection title="Settings">
              <MenuItem 
                href="/admin/dashboard/roles" 
                icon={FaUserShield} 
                label="Role Management" 
              />
            </MenuSection>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-4">
        {children}
      </main>
    </div>
  );
};

export default AdminMenu;
