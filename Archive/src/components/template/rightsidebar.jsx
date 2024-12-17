const RightSidebar = () => {
  return (
    <div className="w-full space-y-4 p-4 bg-[#E2F1E7]">
      {/* Banner 1 */}
      <div className="banner-container">
        <div className="w-[240px] h-[500px] bg-gray-100 rounded-md overflow-hidden">
          <img 
            src="/ban1.jpg"  // Replace with your backend image URL
            alt="Advertisement Banner 1"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Banner 2 */}
      <div className="banner-container">
        <div className="w-[240px] h-[500px] bg-gray-100 rounded-md overflow-hidden">
          <img 
            src="/ban1.jpg"  // Replace with your backend image URL
            alt="Advertisement Banner 2"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Banner 3 */}
      <div className="banner-container">
        <div className="w-[240px] h-[500px] bg-gray-100 rounded-md overflow-hidden">
          <img 
            src="/ban1.jpg"  // Replace with your backend image URL
            alt="Advertisement Banner 3"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
