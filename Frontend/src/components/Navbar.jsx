import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Trang cho khách</Link>
        <Link to="/login" className="hover:underline">Đăng nhập</Link>
      </div>
    </nav>
  );
}

export default Navbar;