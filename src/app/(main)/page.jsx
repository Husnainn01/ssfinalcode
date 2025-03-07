"use client"
import React from 'react';
import SingleBox from "@/components/block/singleBox";
import BlogPost from "@/components/block/blogPost";
import FilterList from "@/components/block/filterList";
import Listing from "@/components/block/listing";
import LeftSidebar from "@/components/template/leftsidebar";
import RightSidebar from "@/components/template/rightsidebar";
import PurchaseFlow from "@/components/block/purchaseflow";
import FAQ from '@/components/block/faq'
import HeroBanner from "@/components/block/hero-banner";
import { OrganizationJsonLd, FaqJsonLd } from '../components/json-ld'

export default function App() {
  return (
    <div>
      <OrganizationJsonLd />
      <FaqJsonLd />
      <HeroBanner />
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
          <div className="sticky top-0">
            <LeftSidebar />
          </div>
        </div>

        <div className="w-full md:w-3/5 lg:w-4/6">
          <div id='search-fliter' className="lisitng-box mt-4 px-3 md:px-8">
            <FilterList />
          </div>

          <div className='mt-3 md:mt-12 px-3 md:px-8 mb-4'>
            <Listing className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" />
          </div>
        </div>

        <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
          <div className="sticky top-0">
            <RightSidebar />
          </div>
        </div>
      </div>
      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <SingleBox />
      </div>

      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <PurchaseFlow />
      </div>

      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <FAQ />
      </div>
      
      <div className='mt-3 md:mt-12 px-3 md:px-20 mb-4'>
        <BlogPost />
      </div>
    </div>
  );
}
