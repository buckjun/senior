import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    console.log('Landing 페이지 클릭됨');
    setLocation('/login');
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div 
        className="w-full h-full cursor-pointer"
        style={{ maxWidth: '393px', maxHeight: '852px' }}
        onClick={handleClick}
      >
        <img 
          src="/83-1499.png" 
          alt="스플래시 화면"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}